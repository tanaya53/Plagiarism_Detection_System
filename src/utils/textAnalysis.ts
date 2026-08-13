import CryptoJS from 'crypto-js';

export class TextAnalyzer {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  preprocessText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  calculateTFIDF(documents: string[]): Map<string, number[]> {
    const processedDocs = documents.map(doc => this.preprocessText(doc));
    const vocabulary = new Set<string>();
    
    // Build vocabulary
    processedDocs.forEach(doc => {
      doc.forEach(word => vocabulary.add(word));
    });

    const vocabArray = Array.from(vocabulary);
    const tfidfVectors = new Map<string, number[]>();

    processedDocs.forEach((doc, docIndex) => {
      const wordCount = new Map<string, number>();
      doc.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      });

      const tfidfVector: number[] = [];
      
      vocabArray.forEach(word => {
        const tf = (wordCount.get(word) || 0) / doc.length;
        const docsWithWord = processedDocs.filter(d => d.includes(word)).length;
        const idf = Math.log(documents.length / docsWithWord);
        tfidfVector.push(tf * idf);
      });

      tfidfVectors.set(`doc_${docIndex}`, tfidfVector);
    });

    return tfidfVectors;
  }

  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  findSimilarSentences(text1: string, text2: string, threshold: number = 0.5): Array<{
    sentence1: string;
    sentence2: string;
    similarity: number;
    start1: number;
    end1: number;
    start2: number;
    end2: number;
  }> {
    if (!text1 || !text2) return [];
    
    const sentences1 = this.splitIntoSentences(text1);
    const sentences2 = this.splitIntoSentences(text2);
    
    if (sentences1.length === 0 || sentences2.length === 0) return [];
    
    const matches: Array<{
      sentence1: string;
      sentence2: string;
      similarity: number;
      start1: number;
      end1: number;
      start2: number;
      end2: number;
    }> = [];

    let currentPos1 = 0;

    sentences1.forEach((sent1, i) => {
      const start1 = text1.indexOf(sent1, currentPos1);
      if (start1 === -1) return; // Skip if sentence not found
      const end1 = start1 + sent1.length;
      currentPos1 = end1;

      let currentPos2 = 0;
      sentences2.forEach((sent2, j) => {
        const start2 = text2.indexOf(sent2, currentPos2);
        if (start2 === -1) return; // Skip if sentence not found
        const end2 = start2 + sent2.length;
        currentPos2 = end2;

        try {
          const tfidf = this.calculateTFIDF([sent1, sent2]);
          const vec1 = tfidf.get('doc_0') || [];
          const vec2 = tfidf.get('doc_1') || [];
          const similarity = this.cosineSimilarity(vec1, vec2);

          if (similarity >= threshold && !isNaN(similarity)) {
            matches.push({
              sentence1: sent1,
              sentence2: sent2,
              similarity,
              start1,
              end1,
              start2,
              end2
            });
          }
        } catch (error) {
          console.warn('Error comparing sentences:', error);
        }
      });
    });

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 5); // Reduced minimum length
  }

  generateFingerprint(text: string): string {
    const processed = this.preprocessText(text);
    const nGrams = this.generateNGrams(processed, 5);
    const hashes = nGrams.map(ngram => 
      CryptoJS.MD5(ngram.join(' ')).toString()
    );
    return hashes.slice(0, 20).join('');
  }

  private generateNGrams(words: string[], n: number): string[][] {
    const ngrams: string[][] = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n));
    }
    return ngrams;
  }
}