import React from 'react';
import { Download, FileText, Share2, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportGeneratorProps {
  results: any[];
  type: 'text' | 'image';
  modelAccuracy?: any;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ results, type, modelAccuracy }) => {
  const generatePDFReport = async () => {
    const reportElement = document.getElementById('plagiarism-report');
    if (!reportElement) return;

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`plagiarism-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const exportToJSON = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      type,
      modelAccuracy,
      results: results.map(result => ({
        similarity: result.overallSimilarity || result.similarity,
        confidence: result.confidence,
        details: result.details || result.algorithmDetails,
        sourceDocument: result.sourceDoc?.name || result.sourceImage?.name,
        targetDocument: result.targetDoc?.name || result.targetImage?.name
      })),
      summary: {
        totalComparisons: results.length,
        averageSimilarity: results.reduce((sum, r) => sum + (r.overallSimilarity || r.similarity), 0) / results.length,
        highRiskCount: results.filter(r => (r.overallSimilarity || r.similarity) > 0.8).length
      }
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plagiarism-data-${type}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Source', 'Target', 'Similarity (%)', 'Confidence (%)', 'Risk Level'];
    const csvData = results.map(result => [
      result.sourceDoc?.name || result.sourceImage?.name,
      result.targetDoc?.name || result.targetImage?.name,
      ((result.overallSimilarity || result.similarity) * 100).toFixed(2),
      ((result.confidence || 0.8) * 100).toFixed(2),
      (result.overallSimilarity || result.similarity) > 0.8 ? 'High' : 
      (result.overallSimilarity || result.similarity) > 0.6 ? 'Medium' : 'Low'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plagiarism-results-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        Export & Report Generation
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={generatePDFReport}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>PDF Report</span>
        </button>
        
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>CSV Data</span>
        </button>
        
        <button
          onClick={exportToJSON}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>JSON Export</span>
        </button>
        
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Comparisons:</span>
            <div className="font-semibold">{results.length}</div>
          </div>
          <div>
            <span className="text-gray-600">High Risk:</span>
            <div className="font-semibold text-red-600">
              {results.filter(r => (r.overallSimilarity || r.similarity) > 0.8).length}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Average Similarity:</span>
            <div className="font-semibold">
              {(results.reduce((sum, r) => sum + (r.overallSimilarity || r.similarity), 0) / results.length * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Model Accuracy:</span>
            <div className="font-semibold text-green-600">
              {modelAccuracy ? `${modelAccuracy.overall.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;