export interface Document {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'pdf' | 'docx';
  uploadedAt: Date;
}

export interface ImageFile {
  id: string;
  name: string;
  url: string;
  file: File;
  uploadedAt: Date;
}

export interface PlagiarismResult {
  sourceDoc: Document;
  targetDoc: Document;
  overallSimilarity: number;
  matches: TextMatch[];
  similarityMatrix: number[][];
  confidence?: number;
  algorithmDetails?: {
    tfidfSimilarity: number;
    ngramSimilarity: number;
    semanticSimilarity: number;
    stylometricSimilarity: number;
    structuralSimilarity: number;
  };
}

export interface TextMatch {
  sourceText: string;
  targetText: string;
  similarity: number;
  sourceStart: number;
  sourceEnd: number;
  targetStart: number;
  targetEnd: number;
}

export interface ImageSimilarityResult {
  sourceImage: ImageFile;
  targetImage: ImageFile;
  similarity: number;
  matchingFeatures: number;
  transformationType?: string;
  confidence?: number;
  details?: {
    hashSimilarity: number;
    colorSimilarity: number;
    structuralSimilarity: number;
    featureSimilarity: number;
    edgeSimilarity: number;
  };
}

export interface AnalysisReport {
  id: string;
  timestamp: Date;
  type: 'text' | 'image';
  results: PlagiarismResult[] | ImageSimilarityResult[];
  summary: {
    totalComparisons: number;
    highSimilarityCount: number;
    averageSimilarity: number;
  };
}