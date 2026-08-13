import React from 'react';
import { Lightbulb, BookOpen, CreditCard as Edit3, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface PlagiarismSuggestionsProps {
  originalText: string;
  plagiarizedText: string;
  similarityScore: number;
}

const PlagiarismSuggestions: React.FC<PlagiarismSuggestionsProps> = ({
  originalText,
  plagiarizedText,
  similarityScore
}) => {
  const generateSuggestions = () => {
    const suggestions = [];
    
    if (similarityScore > 0.8) {
      suggestions.push({
        type: 'critical',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        title: 'High Plagiarism Detected',
        description: 'This content shows significant similarity to existing text.',
        actions: [
          'Completely rewrite the content in your own words',
          'Add proper citations and quotation marks',
          'Provide multiple sources to support your arguments',
          'Use paraphrasing tools as a starting point, then heavily modify'
        ]
      });
    }
    
    if (similarityScore > 0.6) {
      suggestions.push({
        type: 'warning',
        icon: <Edit3 className="w-5 h-5 text-orange-500" />,
        title: 'Paraphrasing Improvements',
        description: 'Consider these techniques to make your content more original:',
        actions: [
          'Change sentence structure (active to passive voice)',
          'Use synonyms and alternative expressions',
          'Break long sentences into shorter ones or combine short ones',
          'Add your own analysis and interpretation',
          'Include additional examples or case studies'
        ]
      });
    }
    
    suggestions.push({
      type: 'info',
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      title: 'Citation Best Practices',
      description: 'Proper citation can help avoid plagiarism issues:',
      actions: [
        'Use in-text citations for all borrowed ideas',
        'Include a comprehensive bibliography',
        'Quote directly when using exact phrases (with quotation marks)',
        'Cite even when paraphrasing or summarizing',
        'Use citation management tools like Zotero or Mendeley'
      ]
    });
    
    suggestions.push({
      type: 'success',
      icon: <Lightbulb className="w-5 h-5 text-green-500" />,
      title: 'Content Enhancement Tips',
      description: 'Make your work more original and valuable:',
      actions: [
        'Add your own insights and critical analysis',
        'Include recent research and current examples',
        'Compare different perspectives on the topic',
        'Provide practical applications or implications',
        'Use visual aids like charts, diagrams, or infographics'
      ]
    });
    
    return suggestions;
  };

  const suggestions = generateSuggestions();

  const getRewrittenExample = () => {
    // Simple example of how text could be rewritten
    const words = plagiarizedText.split(' ');
    if (words.length < 10) return null;
    
    const sample = words.slice(0, 15).join(' ');
    return {
      original: sample + '...',
      rewritten: `According to recent research, ${sample.toLowerCase().replace(/^./, sample[0].toUpperCase())}... [Add your analysis and cite sources]`
    };
  };

  const example = getRewrittenExample();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
          Plagiarism Avoidance Suggestions
        </h3>
        <p className="text-gray-600">
          Based on the similarity analysis, here are personalized recommendations to improve originality:
        </p>
      </div>

      {example && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-blue-500" />
            Rewriting Example
          </h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-red-600">Original (Problematic):</label>
              <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded text-sm">
                {example.original}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-green-600">Improved Version:</label>
              <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded text-sm">
                {example.rewritten}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-3">
              {suggestion.icon}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{suggestion.description}</p>
                <ul className="space-y-2">
                  {suggestion.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-800 mb-2">Academic Integrity Reminder</h4>
        <p className="text-yellow-700 text-sm">
          Remember that the goal is not just to avoid detection, but to create original, valuable content that contributes 
          to knowledge. Always strive for academic integrity and give proper credit to original authors.
        </p>
      </div>
    </div>
  );
};

export default PlagiarismSuggestions;