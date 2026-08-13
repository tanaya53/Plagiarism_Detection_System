export interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number;
  aiProbability: number;
  indicators: {
    repetitivePatterns: number;
    vocabularyComplexity: number;
    sentenceStructure: number;
    coherenceScore: number;
    perplexityScore: number;
  };
  explanation: string;
}

export class AIContentDetector {
  private commonAIPatterns = [
    'in conclusion', 'furthermore', 'moreover', 'additionally', 'however',
    'nevertheless', 'consequently', 'therefore', 'thus', 'hence',
    'it is important to note', 'it should be noted', 'it is worth mentioning',
    'as mentioned earlier', 'as previously discussed', 'in summary'
  ];

  private aiVocabulary = new Set([
    'utilize', 'facilitate', 'implement', 'comprehensive', 'significant',
    'substantial', 'considerable', 'numerous', 'various', 'diverse',
    'optimal', 'efficient', 'effective', 'innovative', 'revolutionary',
    'cutting-edge', 'state-of-the-art', 'paradigm', 'methodology'
  ]);

  analyzeText(text: string): AIDetectionResult {
    const sentences = this.splitIntoSentences(text);
    const words = this.tokenize(text);
    
    // Calculate various AI indicators
    const repetitivePatterns = this.calculateRepetitivePatterns(text);
    const vocabularyComplexity = this.calculateVocabularyComplexity(words);
    const sentenceStructure = this.analyzeSentenceStructure(sentences);
    const coherenceScore = this.calculateCoherence(sentences);
    const perplexityScore = this.calculatePerplexity(words);
    
    // Weighted scoring for AI detection
    const aiScore = (
      repetitivePatterns * 0.25 +
      vocabularyComplexity * 0.20 +
      sentenceStructure * 0.20 +
      coherenceScore * 0.20 +
      perplexityScore * 0.15
    );
    
    const confidence = this.calculateConfidence([
      repetitivePatterns, vocabularyComplexity, sentenceStructure, 
      coherenceScore, perplexityScore
    ]);
    
    const isAIGenerated = aiScore > 0.6;
    
    return {
      isAIGenerated,
      confidence,
      aiProbability: aiScore,
      indicators: {
        repetitivePatterns,
        vocabularyComplexity,
        sentenceStructure,
        coherenceScore,
        perplexityScore
      },
      explanation: this.generateExplanation(aiScore, isAIGenerated)
    };
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private calculateRepetitivePatterns(text: string): number {
    const lowerText = text.toLowerCase();
    let patternScore = 0;
    
    // Check for AI-common phrases
    this.commonAIPatterns.forEach(pattern => {
      const matches = (lowerText.match(new RegExp(pattern, 'g')) || []).length;
      patternScore += matches * 0.1;
    });
    
    // Check for repetitive sentence starters
    const sentences = this.splitIntoSentences(text);
    const starters = sentences.map(s => s.split(' ').slice(0, 3).join(' '));
    const uniqueStarters = new Set(starters);
    const repetitionRatio = 1 - (uniqueStarters.size / starters.length);
    
    return Math.min(1, patternScore + repetitionRatio);
  }

  private calculateVocabularyComplexity(words: string[]): number {
    const aiWordCount = words.filter(word => this.aiVocabulary.has(word)).length;
    const aiWordRatio = aiWordCount / words.length;
    
    // Check for overly formal vocabulary
    const formalWords = words.filter(word => word.length > 8).length;
    const formalRatio = formalWords / words.length;
    
    return Math.min(1, (aiWordRatio * 2) + (formalRatio * 0.5));
  }

  private analyzeSentenceStructure(sentences: string[]): number {
    if (sentences.length === 0) return 0;
    
    const lengths = sentences.map(s => s.split(' ').length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    // AI tends to generate very consistent sentence lengths
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const consistency = 1 / (1 + variance / 10);
    
    // Check for overly perfect grammar patterns
    const perfectStructure = sentences.filter(s => 
      s.includes(',') && s.split(',').length > 2
    ).length / sentences.length;
    
    return Math.min(1, consistency * 0.7 + perfectStructure * 0.3);
  }

  private calculateCoherence(sentences: string[]): number {
    if (sentences.length < 2) return 0;
    
    let coherenceScore = 0;
    
    // Check for logical flow indicators
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally'];
    const transitionCount = sentences.filter(s => 
      transitionWords.some(word => s.toLowerCase().includes(word))
    ).length;
    
    const transitionRatio = transitionCount / sentences.length;
    
    // AI often overuses transition words
    coherenceScore = Math.min(1, transitionRatio * 2);
    
    return coherenceScore;
  }

  private calculatePerplexity(words: string[]): number {
    // Simplified perplexity calculation
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    
    const uniqueWords = wordFreq.size;
    const totalWords = words.length;
    const diversity = uniqueWords / totalWords;
    
    // AI often has lower perplexity (more predictable)
    const perplexityScore = 1 - diversity;
    
    return Math.max(0, Math.min(1, perplexityScore));
  }

  private calculateConfidence(scores: number[]): number {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Lower variance means higher confidence
    return Math.max(0.5, 1 - variance);
  }

  private generateExplanation(aiScore: number, isAIGenerated: boolean): string {
    if (isAIGenerated) {
      if (aiScore > 0.8) {
        return "High probability of AI generation detected. The text shows strong patterns typical of AI models including repetitive structures, formal vocabulary, and predictable sentence patterns.";
      } else {
        return "Moderate probability of AI generation detected. Some indicators suggest possible AI involvement, but the text may be human-written with AI assistance.";
      }
    } else {
      return "Low probability of AI generation. The text shows natural human writing patterns with appropriate vocabulary diversity and sentence structure variation.";
    }
  }
}