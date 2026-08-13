import React, { useState, useEffect } from 'react';
import { AdvancedImageAnalyzer } from '../utils/advancedImageAnalysis';
import { ImageFile, ImageSimilarityResult } from '../types';
import FileUploader from './FileUploader';
import MLMetrics from './MLMetrics';
import ReportGenerator from './ReportGenerator';
import ImageComparisonChart from './visualizations/ImageComparisonChart';
import { Image, AlertTriangle, Eye, Zap, Target, TrendingUp, BarChart3, FileText } from 'lucide-react';

const ImageAnalysis: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<ImageSimilarityResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<ImageSimilarityResult | null>(null);
  const [analyzer] = useState(() => new AdvancedImageAnalyzer());
  const [activeView, setActiveView] = useState<'results' | 'metrics' | 'reports'>('results');
  const [modelAccuracy, setModelAccuracy] = useState<{
    overall: number;
    confidence: number;
    method: string;
  } | null>(null);

  const handleFilesUploaded = async (files: File[]) => {
    console.log('Files uploaded:', files.length);
    const newImages: ImageFile[] = files.map(file => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
      uploadedAt: new Date()
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };

  const analyzeImages = async () => {
    if (images.length < 2) return;
    
    setIsAnalyzing(true);
    const analysisResults: ImageSimilarityResult[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        for (let j = i + 1; j < images.length; j++) {
          const image1 = images[i];
          const image2 = images[j];
          
          console.log(`Comparing ${image1.name} with ${image2.name}`);
          
          try {
            const comparison = await analyzer.compareImages(image1.file, image2.file);
            console.log('Comparison result:', comparison);
          
            // Enhanced result with confidence and detailed metrics
            analysisResults.push({
              sourceImage: image1,
              targetImage: image2,
              similarity: comparison.similarity,
              matchingFeatures: Math.floor(comparison.confidence * 100),
              transformationType: comparison.similarity > 0.95 ? 'Identical' :
                                 comparison.similarity > 0.85 ? 'Near Identical' : 
                                 comparison.similarity > 0.65 ? 'Similar/Transformed' : 
                                 comparison.similarity > 0.4 ? 'Partially Similar' : 'Different',
              confidence: comparison.confidence,
              details: comparison.details
            });
          } catch (error) {
            console.error(`Error comparing ${image1.name} and ${image2.name}:`, error);
            
            // Provide more specific error messages
            let errorMessage = 'Analysis Failed';
            if (error instanceof Error) {
              if (error.message.includes('Failed to load image')) {
                errorMessage = 'Image Load Error';
              } else if (error.message.includes('CORS')) {
                errorMessage = 'CORS Error';
              } else if (error.message.includes('memory')) {
                errorMessage = 'Memory Error';
              } else {
                errorMessage = 'Processing Error';
              }
            }
            
            // Add a failed comparison result
            analysisResults.push({
              sourceImage: image1,
              targetImage: image2,
              similarity: 0,
              matchingFeatures: 0,
              transformationType: errorMessage,
              confidence: 0,
              details: { error: error instanceof Error ? error.message : String(error) }
            });
          }
        }
      }

      // Calculate model accuracy metrics
      if (analysisResults.length > 0) {
        const avgConfidence = analysisResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / analysisResults.length;
        const highAccuracyCount = analysisResults.filter(r => (r.confidence || 0) > 0.8).length;
        const overallAccuracy = (highAccuracyCount / analysisResults.length) * 100;
        
        setModelAccuracy({
          overall: overallAccuracy,
          confidence: avgConfidence,
          method: 'Advanced Multi-Feature Analysis'
        });
      }

      setResults(analysisResults.sort((a, b) => b.similarity - a.similarity));
      console.log('Image analysis completed:', analysisResults);
    } catch (error) {
      console.error('Image analysis error:', error);
      // Show error to user
      alert('Image analysis failed. Please check the console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (images.length >= 2 && !isAnalyzing) {
      analyzeImages();
    }
  }, [images]);

  const getSimilarityLevel = (similarity: number) => {
    if (similarity > 0.95) return { level: 'Identical', color: 'text-red-700', bgColor: 'bg-red-100' };
    if (similarity > 0.85) return { level: 'Near Identical', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (similarity > 0.65) return { level: 'Similar', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (similarity > 0.4) return { level: 'Partially Similar', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Image className="w-6 h-6 mr-3 text-purple-600" />
          Image Similarity Detection
          {modelAccuracy && (
            <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              Model Accuracy: {modelAccuracy.overall.toFixed(1)}%
            </span>
          )}
        </h2>
        
        <FileUploader
          onFilesUploaded={handleFilesUploaded}
          acceptedTypes=".jpg,.jpeg,.png,.gif,.webp,.bmp"
          type="image"
        />

        {images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Uploaded Images ({images.length})</h3>
            {images.length === 1 && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 text-sm">
                  Upload at least 2 images to start similarity analysis.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden bg-white">
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      console.error('Image load error:', image.name);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTG9hZCBFcnJvcjwvdGV4dD4KPHN2Zz4K';
                    }}
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{image.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(image.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAnalyzing && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
            <span className="text-purple-800">Analyzing images for similarities...</span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveView('results')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'results'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                Analysis Results
              </button>
              <button
                onClick={() => setActiveView('metrics')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'metrics'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2 inline" />
                ML Metrics
              </button>
              <button
                onClick={() => setActiveView('reports')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'reports'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Reports & Export
              </button>
            </div>
          </div>

          {activeView === 'results' && (
            <>
          {/* Model Performance Metrics */}
          {modelAccuracy && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Model Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {modelAccuracy.overall.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Accuracy</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {(modelAccuracy.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {results.filter(r => r.similarity > 0.95).length}
                  </div>
                  <div className="text-sm text-gray-600">Identical Matches</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {modelAccuracy.method}
                  </div>
                  <div className="text-sm text-gray-600">Analysis Method</div>
                </div>
              </div>
            </div>
          )}

          <ImageComparisonChart results={results} />

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Image Similarity Results
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.map((result, index) => {
                  const similarity = getSimilarityLevel(result.similarity);
                  
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className={`p-4 ${similarity.bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4" />
                            <span className="font-semibold text-sm">Image Comparison</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${similarity.color} ${similarity.bgColor}`}>
                            {similarity.level}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className={`text-2xl font-bold ${similarity.color}`}>
                            {(result.similarity * 100).toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-600 mt-1">{result.transformationType}</p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <img 
                              src={result.sourceImage.url} 
                              alt={result.sourceImage.name}
                              className="w-full h-32 object-cover rounded border"
                            />
                            <p className="text-xs font-medium mt-1 truncate">{result.sourceImage.name}</p>
                          </div>
                          <div>
                            <img 
                              src={result.targetImage.url} 
                              alt={result.targetImage.name}
                              className="w-full h-32 object-cover rounded border"
                            />
                            <p className="text-xs font-medium mt-1 truncate">{result.targetImage.name}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <div>Confidence: {((result.confidence || 0) * 100).toFixed(1)}%</div>
                              <div>Features: {result.matchingFeatures}</div>
                            </div>
                            <button
                              onClick={() => setSelectedComparison(result)}
                              className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
            </>
          )}

          {activeView === 'metrics' && (
            <MLMetrics results={results} type="image" />
          )}

          {activeView === 'reports' && (
            <ReportGenerator results={results} type="image" modelAccuracy={modelAccuracy} />
          )}
        </div>
      )}

      {selectedComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Detailed Image Comparison</h3>
                <button
                  onClick={() => setSelectedComparison(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium">
                  {(selectedComparison.similarity * 100).toFixed(1)}% Similarity - {selectedComparison.transformationType}
                  <span className="ml-2 text-sm">
                    (Confidence: {((selectedComparison.confidence || 0) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-3">Source Image</h4>
                  <img 
                    src={selectedComparison.sourceImage.url} 
                    alt={selectedComparison.sourceImage.name}
                    className="w-full max-h-80 object-contain border rounded"
                  />
                  <p className="text-sm text-gray-600 mt-2">{selectedComparison.sourceImage.name}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-3">Target Image</h4>
                  <img 
                    src={selectedComparison.targetImage.url} 
                    alt={selectedComparison.targetImage.name}
                    className="w-full max-h-80 object-contain border rounded"
                  />
                  <p className="text-sm text-gray-600 mt-2">{selectedComparison.targetImage.name}</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Analysis Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                  <div className="p-3 bg-white rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {((selectedComparison.details?.hashSimilarity || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Hash Similarity</div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-lg font-bold text-green-600">
                      {((selectedComparison.details?.colorSimilarity || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Color Similarity</div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {((selectedComparison.details?.edgeSimilarity || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Edge Similarity</div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-lg font-bold text-red-600">
                      {((selectedComparison.details?.featureSimilarity || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Texture Features</div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {((selectedComparison.confidence || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Confidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;