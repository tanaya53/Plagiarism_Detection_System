import CryptoJS from 'crypto-js';

export interface TextFeatures {
  tfidfVector: number[];
  ngramHashes: string[];
  sentenceEmbeddings: number[][];
  stylometricFeatures: {
    avgSentenceLength: number;
    avgWordLength: number;
    punctuationRatio: number;
    capitalRatio: number;
    functionWordRatio: number;
  };
  semanticFingerprint: string;
}

export interface TextComparisonResult {
  similarity: number;
  confidence: number;
  method: string;
  details: {
    tfidfSimilarity: number;
    ngramSimilarity: number;
    semanticSimilarity: number;
    stylometricSimilarity: number;
    structuralSimilarity: number;
  };
  matches: DetailedTextMatch[];
}

export interface DetailedTextMatch {
  sourceText: string;
  targetText: string;
  similarity: number;
  sourceStart: number;
  sourceEnd: number;
  targetStart: number;
  targetEnd: number;
  matchType: 'exact' | 'paraphrase' | 'semantic';
  confidence: number;
}

export class AdvancedTextAnalyzer {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  private functionWords = new Set([
    'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on',
    'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one',
    'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said'
  ]);

  preprocessText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  extractAdvancedFeatures(text: string): TextFeatures {
    const words = this.preprocessText(text);
    const sentences = this.splitIntoSentences(text);
    
    return {
      tfidfVector: this.calculateTFIDFVector(text, [text]),
      ngramHashes: this.generateNGramHashes(words, [3, 4, 5]),
      sentenceEmbeddings: this.calculateSentenceEmbeddings(sentences),
      stylometricFeatures: this.extractStylometricFeatures(text),
      semanticFingerprint: this.generateSemanticFingerprint(text)
    };
  }

  calculateTFIDFVector(text: string, corpus: string[]): number[] {
    const processedDocs = corpus.map(doc => this.preprocessText(doc));
    const vocabulary = new Set<string>();
    
    processedDocs.forEach(doc => {
      doc.forEach(word => vocabulary.add(word));
    });

    const vocabArray = Array.from(vocabulary);
    const currentDoc = this.preprocessText(text);
    const wordCount = new Map<string, number>();
    
    currentDoc.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    const tfidfVector: number[] = [];
    
    vocabArray.forEach(word => {
      const tf = (wordCount.get(word) || 0) / currentDoc.length;
      const docsWithWord = processedDocs.filter(doc => doc.includes(word)).length;
      const idf = Math.log(corpus.length / (docsWithWord || 1));
      tfidfVector.push(tf * idf);
    });

    return tfidfVector;
  }

  generateNGramHashes(words: string[], nSizes: number[]): string[] {
    const hashes: string[] = [];
    
    nSizes.forEach(n => {
      for (let i = 0; i <= words.length - n; i++) {
        const ngram = words.slice(i, i + n).join(' ');
        const hash = CryptoJS.MD5(ngram).toString().substring(0, 16);
        hashes.push(hash);
      }
    });
    
    return hashes;
  }

  calculateSentenceEmbeddings(sentences: string[]): number[][] {
    // Simplified sentence embeddings using word frequency vectors
    return sentences.map(sentence => {
      const words = this.preprocessText(sentence);
      const embedding = new Array(100).fill(0);
      
      words.forEach((word, index) => {
        const hash = this.simpleHash(word);
        for (let i = 0; i < 100; i++) {
          embedding[i] += Math.sin(hash + i) * (1 / (index + 1));
        }
      });
      
      // Normalize
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
    });
  }

  extractStylometricFeatures(text: string): TextFeatures['stylometricFeatures'] {
    const sentences = this.splitIntoSentences(text);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const allWords = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    const avgSentenceLength = sentences.length > 0 ? 
      sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length : 0;
    
    const avgWordLength = words.length > 0 ? 
      words.reduce((sum, w) => sum + w.replace(/[^\w]/g, '').length, 0) / words.length : 0;
    
    const punctuationCount = (text.match(/[.!?;:,]/g) || []).length;
    const punctuationRatio = text.length > 0 ? punctuationCount / text.length : 0;
    
    const capitalCount = (text.match(/[A-Z]/g) || []).length;
    const capitalRatio = text.length > 0 ? capitalCount / text.length : 0;
    
    const functionWordCount = allWords.filter(word => this.functionWords.has(word)).length;
    const functionWordRatio = allWords.length > 0 ? functionWordCount / allWords.length : 0;
    
    return {
      avgSentenceLength,
      avgWordLength,
      punctuationRatio,
      capitalRatio,
      functionWordRatio
    };
  }

  generateSemanticFingerprint(text: string): string {
    const words = this.preprocessText(text);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    // Get top frequent words and create fingerprint
    const topWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word)
      .join('');
    
    return CryptoJS.MD5(topWords).toString();
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;
    
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  jaccardSimilarity(set1: string[], set2: string[]): number {
    const s1 = new Set(set1);
    const s2 = new Set(set2);
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  compareStylometricFeatures(features1: TextFeatures['stylometricFeatures'], 
                           features2: TextFeatures['stylometricFeatures']): number {
    const metrics = [
      1 - Math.abs(features1.avgSentenceLength - features2.avgSentenceLength) / 
          Math.max(features1.avgSentenceLength, features2.avgSentenceLength, 1),
      1 - Math.abs(features1.avgWordLength - features2.avgWordLength) / 
          Math.max(features1.avgWordLength, features2.avgWordLength, 1),
      1 - Math.abs(features1.punctuationRatio - features2.punctuationRatio),
      1 - Math.abs(features1.capitalRatio - features2.capitalRatio),
      1 - Math.abs(features1.functionWordRatio - features2.functionWordRatio)
    ];
    
    return metrics.reduce((sum, val) => sum + Math.max(0, val), 0) / metrics.length;
  }

  async compareTexts(text1: string, text2: string): Promise<TextComparisonResult> {
    const features1 = this.extractAdvancedFeatures(text1);
    const features2 = this.extractAdvancedFeatures(text2);
    
    // Calculate multiple similarity metrics
    const tfidfSimilarity = this.cosineSimilarity(features1.tfidfVector, features2.tfidfVector);
    const ngramSimilarity = this.jaccardSimilarity(features1.ngramHashes, features2.ngramHashes);
    const stylometricSimilarity = this.compareStylometricFeatures(features1.stylometricFeatures, features2.stylometricFeatures);
    
    // Semantic similarity using sentence embeddings
    let semanticSimilarity = 0;
    if (features1.sentenceEmbeddings.length > 0 && features2.sentenceEmbeddings.length > 0) {
      const similarities: number[] = [];
      features1.sentenceEmbeddings.forEach(emb1 => {
        const maxSim = Math.max(...features2.sentenceEmbeddings.map(emb2 => 
          this.cosineSimilarity(emb1, emb2)
        ));
        similarities.push(maxSim);
      });
      semanticSimilarity = similarities.reduce((sum, val) => sum + val, 0) / similarities.length;
    }
    
    // Structural similarity (fingerprint comparison)
    const structuralSimilarity = features1.semanticFingerprint === features2.semanticFingerprint ? 1 : 0;
    
    // Weighted combination
    const weights = {
      tfidf: 0.30,
      ngram: 0.25,
      semantic: 0.25,
      stylometric: 0.15,
      structural: 0.05
    };
    
    const overallSimilarity = 
      tfidfSimilarity * weights.tfidf +
      ngramSimilarity * weights.ngram +
      semanticSimilarity * weights.semantic +
      stylometricSimilarity * weights.stylometric +
      structuralSimilarity * weights.structural;
    
    // Calculate confidence
    const metrics = [tfidfSimilarity, ngramSimilarity, semanticSimilarity, stylometricSimilarity];
    const mean = metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
    const variance = metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / metrics.length;
    const confidence = Math.max(0.5, 1 - variance);
    
    // Find detailed matches
    const matches = this.findDetailedMatches(text1, text2, 0.3);
    
    return {
      similarity: Math.max(0, Math.min(1, overallSimilarity)),
      confidence,
      method: 'Advanced Multi-Algorithm Analysis',
      details: {
        tfidfSimilarity,
        ngramSimilarity,
        semanticSimilarity,
        stylometricSimilarity,
        structuralSimilarity
      },
      matches
    };
  }

  private findDetailedMatches(text1: string, text2: string, threshold: number): DetailedTextMatch[] {
    const sentences1 = this.splitIntoSentences(text1);
    const sentences2 = this.splitIntoSentences(text2);
    const matches: DetailedTextMatch[] = [];
    
    let currentPos1 = 0;
    
    sentences1.forEach(sent1 => {
      const start1 = text1.indexOf(sent1, currentPos1);
      if (start1 === -1) return;
      const end1 = start1 + sent1.length;
      currentPos1 = end1;
      
      let currentPos2 = 0;
      sentences2.forEach(sent2 => {
        const start2 = text2.indexOf(sent2, currentPos2);
        if (start2 === -1) return;
        const end2 = start2 + sent2.length;
        currentPos2 = end2;
        
        try {
          // Use simplified similarity calculation instead of recursive compareTexts
          const similarity = this.calculateSimpleSentenceSimilarity(sent1, sent2);
          
          if (similarity >= threshold) {
            let matchType: 'exact' | 'paraphrase' | 'semantic' = 'semantic';
            if (similarity > 0.9) matchType = 'exact';
            else if (similarity > 0.7) matchType = 'paraphrase';
            
            matches.push({
              sourceText: sent1,
              targetText: sent2,
              similarity,
              sourceStart: start1,
              sourceEnd: end1,
              targetStart: start2,
              targetEnd: end2,
              matchType,
              confidence: similarity
            });
          }
        } catch (error) {
          console.warn('Error comparing sentences:', error);
        }
      });
    });
    
    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  private calculateSimpleSentenceSimilarity(sent1: string, sent2: string): number {
    const words1 = this.preprocessText(sent1);
    const words2 = this.preprocessText(sent2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // Simple Jaccard similarity for sentence-level matching
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}