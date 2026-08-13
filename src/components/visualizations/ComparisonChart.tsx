import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PlagiarismResult } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ComparisonChartProps {
  results: PlagiarismResult[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ results }) => {
  if (results.length === 0) return null;

  // Bar chart data
  const barData = {
    labels: results.map(r => `${r.sourceDoc.name.split('.')[0]} vs ${r.targetDoc.name.split('.')[0]}`),
    datasets: [
      {
        label: 'Similarity Percentage',
        data: results.map(r => r.overallSimilarity * 100),
        backgroundColor: results.map(r => {
          if (r.overallSimilarity > 0.8) return 'rgba(239, 68, 68, 0.8)';
          if (r.overallSimilarity > 0.6) return 'rgba(245, 158, 11, 0.8)';
          if (r.overallSimilarity > 0.4) return 'rgba(59, 130, 246, 0.8)';
          return 'rgba(16, 185, 129, 0.8)';
        }),
        borderColor: results.map(r => {
          if (r.overallSimilarity > 0.8) return 'rgba(239, 68, 68, 1)';
          if (r.overallSimilarity > 0.6) return 'rgba(245, 158, 11, 1)';
          if (r.overallSimilarity > 0.4) return 'rgba(59, 130, 246, 1)';
          return 'rgba(16, 185, 129, 1)';
        }),
        borderWidth: 2,
      },
    ],
  };

  // Doughnut chart data for similarity distribution
  const similarityCounts = {
    high: results.filter(r => r.overallSimilarity > 0.8).length,
    medium: results.filter(r => r.overallSimilarity > 0.4 && r.overallSimilarity <= 0.8).length,
    low: results.filter(r => r.overallSimilarity <= 0.4).length,
  };

  const doughnutData = {
    labels: ['High Risk (>80%)', 'Medium Risk (40-80%)', 'Low Risk (<40%)'],
    datasets: [
      {
        data: [similarityCounts.high, similarityCounts.medium, similarityCounts.low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
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
        text: 'Document Similarity Comparison',
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
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Risk Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Bar data={barData} options={barOptions} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Doughnut data={doughnutData} options={doughnutOptions} />
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Comparisons:</span>
            <span className="font-semibold">{results.length}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Average Similarity:</span>
            <span className="font-semibold">
              {(results.reduce((sum, r) => sum + r.overallSimilarity, 0) / results.length * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Highest Similarity:</span>
            <span className="font-semibold text-red-600">
              {(Math.max(...results.map(r => r.overallSimilarity)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;