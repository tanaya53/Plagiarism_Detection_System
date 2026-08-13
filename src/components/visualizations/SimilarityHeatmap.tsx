import React from 'react';
import { PlagiarismResult } from '../../types';

interface SimilarityHeatmapProps {
  results: PlagiarismResult[];
}

const SimilarityHeatmap: React.FC<SimilarityHeatmapProps> = ({ results }) => {
  if (results.length === 0) return null;

  const maxSimilarity = Math.max(...results.map(r => r.overallSimilarity));
  
  const getIntensity = (similarity: number) => {
    const intensity = similarity / maxSimilarity;
    return Math.max(0.1, intensity);
  };

  const getColor = (similarity: number) => {
    if (similarity > 0.8) return 'bg-red-500';
    if (similarity > 0.6) return 'bg-orange-500';
    if (similarity > 0.4) return 'bg-yellow-500';
    if (similarity > 0.2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Similarity Heatmap</h3>
      
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {result.sourceDoc.name} vs {result.targetDoc.name}
              </div>
            </div>
            
            <div className="flex-shrink-0 w-32">
              <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className={`h-full ${getColor(result.overallSimilarity)} transition-all duration-500 ease-out flex items-center justify-center`}
                  style={{ 
                    width: `${result.overallSimilarity * 100}%`,
                    opacity: getIntensity(result.overallSimilarity)
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    {(result.overallSimilarity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High (80%+)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Medium-High (60-80%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium (40-60%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Low-Medium (20-40%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low (0-20%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarityHeatmap;