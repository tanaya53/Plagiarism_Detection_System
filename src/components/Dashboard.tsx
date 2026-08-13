import React, { useState } from 'react';
import { BarChart3, FileText, Image, Shield, Target, TrendingUp, AlertTriangle, Bot } from 'lucide-react';
import TextAnalysis from './TextAnalysis';
import ImageAnalysis from './ImageAnalysis';
import AIDetection from './AIDetection';
import Chatbot from './Chatbot';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'text' | 'image' | 'ai'>('overview');

  const OverviewCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
  }> = ({ icon, title, description, color }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">PlagiarismGuard</h1>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2 inline" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'text'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Text Analysis
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'image'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Image className="w-4 h-4 mr-2 inline" />
                Image Analysis
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Bot className="w-4 h-4 mr-2 inline" />
                AI Detection
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Plagiarism Detection System</h2>
              <p className="text-gray-600 text-lg">
                Advanced AI-powered plagiarism detection for text documents and images with real-time analysis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <OverviewCard
                icon={<FileText className="w-6 h-6 text-white" />}
                title="Text Plagiarism Detection"
                description="Advanced NLP techniques using TF-IDF, cosine similarity, and semantic analysis to detect copied content and paraphrasing"
                color="bg-blue-500"
              />
              <OverviewCard
                icon={<Image className="w-6 h-6 text-white" />}
                title="Image Similarity Detection"
                description="Perceptual hashing and feature extraction to identify similar images even with transformations like resizing or rotation"
                color="bg-purple-500"
              />
              <OverviewCard
                icon={<Bot className="w-6 h-6 text-white" />}
                title="AI Content Detection"
                description="Advanced algorithms to identify AI-generated text using pattern analysis, vocabulary assessment, and linguistic markers"
                color="bg-green-500"
              />
              <OverviewCard
                icon={<Target className="w-6 h-6 text-white" />}
                title="High Accuracy Analysis"
                description="Combines multiple algorithms to achieve precise detection with detailed similarity scoring and confidence metrics"
                color="bg-indigo-500"
              />
              <OverviewCard
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                title="Real-time Processing"
                description="Instant analysis and comparison with live results, progress tracking, and immediate feedback for uploaded content"
                color="bg-orange-500"
              />
              <OverviewCard
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                title="Advanced Visualizations"
                description="Interactive charts, heatmaps, and comparison tools to make plagiarism results clear and actionable"
                color="bg-pink-500"
              />
              <OverviewCard
                icon={<AlertTriangle className="w-6 h-6 text-white" />}
                title="Detailed Reports"
                description="Comprehensive analysis reports with highlighted matches, similarity percentages, and exportable summaries"
                color="bg-red-500"
              />
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
              <div className="max-w-3xl">
                <h3 className="text-2xl font-bold mb-4">Get Started with Plagiarism Detection</h3>
                <p className="text-lg mb-6">
                  Upload your documents or images to begin analysis. Our system will automatically compare 
                  them and provide detailed similarity reports with advanced visualizations.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('text')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Analyze Text Documents
                  </button>
                  <button
                    onClick={() => setActiveTab('image')}
                    className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                  >
                    Compare Images
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                  >
                    Detect AI Content
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Text Analysis Capabilities</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• TF-IDF and cosine similarity algorithms</li>
                    <li>• Semantic sentence comparison</li>
                    <li>• Paraphrasing detection</li>
                    <li>• Multi-format support (TXT, PDF, DOCX)</li>
                    <li>• Highlighted text matches</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Image Analysis Capabilities</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Perceptual hashing algorithms</li>
                    <li>• Color histogram comparison</li>
                    <li>• Transformation-resistant detection</li>
                    <li>• Multiple format support (JPG, PNG, GIF)</li>
                    <li>• Side-by-side visual comparison</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Detection Capabilities</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pattern recognition algorithms</li>
                    <li>• Vocabulary and style analysis</li>
                    <li>• Sentence structure evaluation</li>
                    <li>• Coherence and perplexity scoring</li>
                    <li>• Confidence-based results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && <TextAnalysis />}
        {activeTab === 'image' && <ImageAnalysis />}
        {activeTab === 'ai' && <AIDetection />}
      </div>
      
      <Chatbot />
    </div>
  );
};

export default Dashboard;