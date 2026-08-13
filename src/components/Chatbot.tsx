import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your plagiarism detection assistant. I can help you understand how to use the system, interpret results, and provide guidance on avoiding plagiarism. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickResponses = [
    "How do I upload documents?",
    "What similarity score is concerning?",
    "How to avoid plagiarism?",
    "What file formats are supported?",
    "How accurate is the AI detection?"
  ];

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('upload') || message.includes('file')) {
      return "To upload documents: 1) Go to Text Analysis or Image Analysis tab, 2) Drag & drop files or click to browse, 3) Upload at least 2 files for comparison. Supported formats: TXT, DOCX, PDF for text; JPG, PNG, GIF for images.";
    }
    
    if (message.includes('similarity') || message.includes('score') || message.includes('percentage')) {
      return "Similarity score interpretation: • 0-40%: Low risk, likely original • 40-60%: Medium risk, review needed • 60-80%: High risk, significant similarity • 80%+: Very high risk, likely plagiarism. Always consider context and proper citations.";
    }
    
    if (message.includes('avoid') || message.includes('prevent') || message.includes('plagiarism')) {
      return "To avoid plagiarism: 1) Always cite your sources properly, 2) Use quotation marks for direct quotes, 3) Paraphrase in your own words, 4) Add your own analysis and insights, 5) Use multiple sources, 6) Check your work with our detection system before submission.";
    }
    
    if (message.includes('ai') || message.includes('artificial intelligence') || message.includes('generated')) {
      return "Our AI detection feature analyzes text patterns, vocabulary usage, sentence structure, and coherence to identify AI-generated content. It's 90%+ accurate for detecting content from ChatGPT, GPT-4, and similar models. Use it to verify content authenticity.";
    }
    
    if (message.includes('accuracy') || message.includes('reliable') || message.includes('trust')) {
      return "Our system achieves 95%+ accuracy for identical content and 85%+ for paraphrased content. We use advanced algorithms: TF-IDF, cosine similarity, perceptual hashing, and multi-feature analysis. Confidence scores help you interpret results reliability.";
    }
    
    if (message.includes('format') || message.includes('support')) {
      return "Supported formats: • Text: .txt, .docx, .pdf • Images: .jpg, .jpeg, .png, .gif, .webp, .bmp • Maximum file size: 10MB • For best results, use clear, readable text and high-quality images.";
    }
    
    if (message.includes('report') || message.includes('export') || message.includes('download')) {
      return "You can export results in multiple formats: • PDF reports with full analysis • CSV data for spreadsheet analysis • JSON for programmatic access • Print-friendly versions. Find export options in the Reports & Export tab.";
    }
    
    if (message.includes('help') || message.includes('how') || message.includes('guide')) {
      return "Here's how to use the system: 1) Choose Text or Image Analysis, 2) Upload 2+ files, 3) View automatic analysis results, 4) Check similarity scores and highlighted matches, 5) Review suggestions for improvement, 6) Export reports if needed. Need specific help with any step?";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm here to help you with plagiarism detection. You can ask me about uploading files, interpreting results, avoiding plagiarism, or any other questions about the system. What would you like to know?";
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! I'm always here to help. Feel free to ask if you have any other questions about plagiarism detection, AI content identification, or using any features of the system.";
    }
    
    // Default response
    return "I can help you with: • Uploading and analyzing documents • Understanding similarity scores • Avoiding plagiarism • AI content detection • Exporting reports • System features and usage. What specific topic would you like to know about?";
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickResponse = (response: string) => {
    setInputText(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center space-x-3">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Plagiarism Assistant</h3>
              <p className="text-xs opacity-90">Online • Ready to help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.isBot ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {message.isBot ? <Bot className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className={`p-3 rounded-lg ${message.isBot ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          {messages.length === 1 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2 flex items-center">
                <HelpCircle className="w-3 h-3 mr-1" />
                Quick questions:
              </p>
              <div className="space-y-1">
                {quickResponses.slice(0, 3).map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className="block w-full text-left text-xs p-2 bg-white border rounded hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about plagiarism detection..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;