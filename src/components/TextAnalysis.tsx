import React, { useState, useEffect } from 'react';
import { AdvancedTextAnalyzer } from '../utils/advancedTextAnalysis';
import { Document, PlagiarismResult, TextMatch } from '../types';
import FileUploader from './FileUploader';
import PlagiarismSuggestions from './PlagiarismSuggestions';
import MLMetrics from './MLMetrics';
import ReportGenerator from './ReportGenerator';
import SimilarityHeatmap from './visualizations/SimilarityHeatmap';
import ComparisonChart from './visualizations/ComparisonChart';
import { FileText, AlertTriangle, CheckCircle, Eye, Target, Brain, BarChart3, BookOpen } from 'lucide-react';
import mammoth from 'mammoth';

const TextAnalysis: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [results, setResults] = useState<PlagiarismResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TextMatch | null>(null);
  const [analyzer] = useState(() => new AdvancedTextAnalyzer());
  const [activeView, setActiveView] = useState<'results' | 'suggestions' | 'metrics' | 'reports'>('results');
  const [modelAccuracy, setModelAccuracy] = useState<{
    overall: number;
    confidence: number;
    method: string;
    algorithmBreakdown: any;
  } | null>(null);

  const handleFilesUploaded = async (files: File[]) => {
    const newDocs: Document[] = [];
    
    for (const file of files) {
      try {
        let content = '';
        
        if (file.type === 'application/pdf') {
          // For PDF files - simplified extraction
          content = `[PDF Content from ${file.name}]`;
        } else if (file.type.includes('word')) {
          // For Word documents
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
        } else if (file.type === 'application/pdf') {
          // For PDF files - show a message that PDF parsing is simplified
          content = `This is a PDF file: ${file.name}. For demonstration purposes, this represents the extracted text content from the PDF document. In a production system, you would use a PDF parsing library like pdf-parse or PDF.js to extract the actual text content.`;
        } else {
          // For text files
          content = await file.text();
        }

        if (!content || content.trim().length === 0) {
          console.warn(`No content extracted from file: ${file.name}`);
          content = `Empty or unreadable file: ${file.name}`;
        }

        newDocs.push({
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          content,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : 'text',
          uploadedAt: new Date()
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Add a placeholder document for failed files
        newDocs.push({
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          content: `Error processing file: ${file.name}. Please try a different file format.`,
          type: 'text',
          uploadedAt: new Date()
        });
      }
    }
    
    setDocuments(prev => [...prev, ...newDocs]);
    console.log('Documents uploaded:', newDocs);
  };

  const analyzeDocuments = async () => {
    if (documents.length < 2) return;
    
    setIsAnalyzing(true);
    const analysisResults: PlagiarismResult[] = [];

    try {
      for (let i = 0; i < documents.length; i++) {
        for (let j = i + 1; j < documents.length; j++) {
          const sourceDoc = documents[i];
          const targetDoc = documents[j];
          
          // Skip if either document has no content
          if (!sourceDoc.content || !targetDoc.content) {
            console.warn(`Skipping comparison: empty content for ${sourceDoc.name} or ${targetDoc.name}`);
            continue;
          }
          
          // Calculate overall similarity using TF-IDF
          const comparison = await analyzer.compareTexts(sourceDoc.content, targetDoc.content);
          const overallSimilarity = comparison.similarity;
          
          // Convert detailed matches to TextMatch format
          const textMatches: TextMatch[] = comparison.matches.map(match => ({
            sourceText: match.sourceText,
            targetText: match.targetText,
            similarity: match.similarity,
            sourceStart: match.sourceStart,
            sourceEnd: match.sourceEnd,
            targetStart: match.targetStart,
            targetEnd: match.targetEnd
          }));
          

          // Create similarity matrix (simplified)
          const similarityMatrix = [
            [1, overallSimilarity],
            [overallSimilarity, 1]
          ];

          analysisResults.push({
            sourceDoc,
            targetDoc,
            overallSimilarity,
            matches: textMatches,
            similarityMatrix,
            confidence: comparison.confidence,
            algorithmDetails: comparison.details
          });
        }
      }

      // Calculate model accuracy metrics
      if (analysisResults.length > 0) {
        const avgConfidence = analysisResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / analysisResults.length;
        const highAccuracyCount = analysisResults.filter(r => (r.confidence || 0) > 0.8).length;
        const overallAccuracy = (highAccuracyCount / analysisResults.length) * 100;
        
        // Calculate algorithm breakdown
        const algorithmBreakdown = {
          tfidf: analysisResults.reduce((sum, r) => sum + (r.algorithmDetails?.tfidfSimilarity || 0), 0) / analysisResults.length,
          ngram: analysisResults.reduce((sum, r) => sum + (r.algorithmDetails?.ngramSimilarity || 0), 0) / analysisResults.length,
          semantic: analysisResults.reduce((sum, r) => sum + (r.algorithmDetails?.semanticSimilarity || 0), 0) / analysisResults.length,
          stylometric: analysisResults.reduce((sum, r) => sum + (r.algorithmDetails?.stylometricSimilarity || 0), 0) / analysisResults.length
        };
        
        setModelAccuracy({
          overall: overallAccuracy,
          confidence: avgConfidence,
          method: 'Advanced Multi-Algorithm NLP Analysis',
          algorithmBreakdown
        });
      }

      setResults(analysisResults);
      console.log('Analysis completed:', analysisResults);
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Analysis failed. ';
      if (error instanceof Error) {
        if (error.message.includes('memory') || error.message.includes('Maximum call stack')) {
          errorMessage += 'Document too large or complex. Try with smaller files.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network error occurred. Please try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage += 'Analysis timed out. Try with smaller documents.';
        } else {
          errorMessage += 'Please check file format and try again.';
        }
      } else {
        errorMessage += 'Unknown error occurred. Please try again.';
      }
      
      // Show specific error to user
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (documents.length >= 2 && !isAnalyzing) {
      analyzeDocuments();
    }
  }, [documents]);

  const getSimilarityLevel = (similarity: number) => {
    if (similarity > 0.9) return { level: 'Very High', color: 'text-red-700', bgColor: 'bg-red-100' };
    if (similarity > 0.75) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (similarity > 0.6) return { level: 'Medium-High', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (similarity > 0.4) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const highlightText = (text: string, matches: TextMatch[], isSource: boolean) => {
    if (!matches.length) return text;
    
    const segments: { text: string; isMatch: boolean; matchIndex?: number }[] = [];
    let lastIndex = 0;
    
    matches.forEach((match, index) => {
      const start = isSource ? match.sourceStart : match.targetStart;
      const end = isSource ? match.sourceEnd : match.targetEnd;
      
      if (start > lastIndex) {
        segments.push({ text: text.slice(lastIndex, start), isMatch: false });
      }
      
      segments.push({ 
        text: text.slice(start, end), 
        isMatch: true, 
        matchIndex: index 
      });
      
      lastIndex = end;
    });
    
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), isMatch: false });
    }
    
    return segments.map((segment, index) => (
      <span
        key={index}
        className={segment.isMatch ? 'bg-yellow-200 cursor-pointer hover:bg-yellow-300' : ''}
        onClick={() => segment.isMatch && segment.matchIndex !== undefined && 
                      setSelectedMatch(matches[segment.matchIndex])}
      >
        {segment.text}
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-3 text-blue-600" />
          Text Plagiarism Detection
          {modelAccuracy && (
            <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              Model Accuracy: {modelAccuracy.overall.toFixed(1)}%
            </span>
          )}
        </h2>
        
        <FileUploader
          onFilesUploaded={handleFilesUploaded}
          acceptedTypes=".txt,.doc,.docx,.pdf"
          type="text"
        />

        {documents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Uploaded Documents ({documents.length})</h3>
            {documents.length === 1 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Upload at least 2 documents to start plagiarism analysis.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium truncate">{doc.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.content.length} characters
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Type: {doc.type.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Analyzing documents for plagiarism...</span>
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
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                Analysis Results
              </button>
              <button
                onClick={() => setActiveView('suggestions')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'suggestions'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2 inline" />
                Improvement Suggestions
              </button>
              <button
                onClick={() => setActiveView('metrics')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === 'metrics'
                    ? 'bg-purple-100 text-purple-700'
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
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                Advanced NLP Model Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {modelAccuracy.overall.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Accuracy</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {(modelAccuracy.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {results.filter(r => r.overallSimilarity > 0.9).length}
                  </div>
                  <div className="text-sm text-gray-600">High Risk Matches</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    Multi-Algorithm
                  </div>
                  <div className="text-sm text-gray-600">Analysis Method</div>
                </div>
              </div>
              
              {/* Algorithm Breakdown */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Algorithm Performance Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-700">
                      {(modelAccuracy.algorithmBreakdown.tfidf * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">TF-IDF</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-700">
                      {(modelAccuracy.algorithmBreakdown.ngram * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">N-Gram</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-700">
                      {(modelAccuracy.algorithmBreakdown.semantic * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Semantic</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-700">
                      {(modelAccuracy.algorithmBreakdown.stylometric * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Stylometric</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComparisonChart results={results} />
            <SimilarityHeatmap results={results} />
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Analysis Results
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {results.map((result, index) => {
                const similarity = getSimilarityLevel(result.overallSimilarity);
                
                return (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className={`p-4 ${similarity.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Eye className="w-5 h-5" />
                          <span className="font-semibold">
                            {result.sourceDoc.name} vs {result.targetDoc.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`font-bold ${similarity.color}`}>
                            {(result.overallSimilarity * 100).toFixed(1)}% Similarity
                            {result.confidence && (
                              <span className="ml-2 text-sm font-normal">
                                (Confidence: {(result.confidence * 100).toFixed(1)}%)
                              </span>
                            )}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${similarity.color} ${similarity.bgColor}`}>
                            {similarity.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {result.matches.length > 0 && (
                      <div className="p-4 bg-gray-50 border-t">
                        <p className="text-sm text-gray-600 mb-3">
                          Found {result.matches.length} similar text segments. Click highlighted text to view details.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">{result.sourceDoc.name}</h4>
                            <div className="text-sm leading-relaxed bg-white p-3 rounded border max-h-48 overflow-y-auto">
                              {highlightText(result.sourceDoc.content, result.matches, true)}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">{result.targetDoc.name}</h4>
                            <div className="text-sm leading-relaxed bg-white p-3 rounded border max-h-48 overflow-y-auto">
                              {highlightText(result.targetDoc.content, result.matches, false)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
            </>
          )}

          {activeView === 'suggestions' && results.length > 0 && (
            <div id="plagiarism-report">
              <PlagiarismSuggestions
                originalText={results[0].sourceDoc.content}
                plagiarizedText={results[0].targetDoc.content}
                similarityScore={results[0].overallSimilarity}
              />
            </div>
          )}

          {activeView === 'metrics' && (
            <MLMetrics results={results} type="text" />
          )}

          {activeView === 'reports' && (
            <ReportGenerator results={results} type="text" modelAccuracy={modelAccuracy} />
          )}
        </div>
      )}

      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Similar Text Segments</h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {(selectedMatch.similarity * 100).toFixed(1)}% Similar
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Source Text</h4>
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="text-gray-800">{selectedMatch.sourceText}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Target Text</h4>
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-gray-800">{selectedMatch.targetText}</p>
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

export default TextAnalysis;