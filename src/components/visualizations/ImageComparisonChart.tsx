import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { ImageSimilarityResult } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ImageComparisonChartProps {
  results: ImageSimilarityResult[];
}

const ImageComparisonChart: React.FC<ImageComparisonChartProps> = ({ results }) => {
  if (results.length === 0) return null;

  // Bar chart data
  const barData = {
    labels: results.map((r, i) => `Comparison ${i + 1}`),
    datasets: [
      {
        label: 'Similarity Percentage',
        data: results.map(r => r.similarity * 100),
        backgroundColor: results.map(r => {
          if (r.similarity > 0.8) return 'rgba(147, 51, 234, 0.8)';
          if (r.similarity > 0.6) return 'rgba(168, 85, 247, 0.8)';
          if (r.similarity > 0.4) return 'rgba(196, 181, 253, 0.8)';
          return 'rgba(233, 213, 255, 0.8)';
        }),
        borderColor: results.map(r => {
          if (r.similarity > 0.8) return 'rgba(147, 51, 234, 1)';
          if (r.similarity > 0.6) return 'rgba(168, 85, 247, 1)';
          if (r.similarity > 0.4) return 'rgba(196, 181, 253, 1)';
          return 'rgba(233, 213, 255, 1)';
        }),
        borderWidth: 2,
      },
    ],
  };

  // Pie chart data for transformation types
  const transformationCounts = results.reduce((acc, result) => {
    const type = result.transformationType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(transformationCounts),
    datasets: [
      {
        data: Object.values(transformationCounts),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(196, 181, 253, 0.8)',
          'rgba(233, 213, 255, 0.8)',
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(196, 181, 253, 1)',
          'rgba(233, 213, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Image Similarity Scores',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Transformation Types',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Bar data={barData} options={barOptions} />
        </div>
        
        <div>
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{results.length}</div>
          <div className="text-xs text-gray-600">Total Comparisons</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {(results.reduce((sum, r) => sum + r.similarity, 0) / results.length * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Average Similarity</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {(Math.max(...results.map(r => r.similarity)) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600">Highest Similarity</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {results.filter(r => r.similarity > 0.8).length}
          </div>
          <div className="text-xs text-gray-600">High Risk Matches</div>
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonChart;