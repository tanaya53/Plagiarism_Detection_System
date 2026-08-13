import CryptoJS from 'crypto-js';

export interface ImageFeatures {
  perceptualHash: string;
  colorHistogram: number[];
  aspectRatio: number;
  dimensions: { width: number; height: number };
  edgeHistogram: number[];
  textureFeatures: number[];
  dominantColors: string[];
}

export interface ComparisonResult {
  similarity: number;
  confidence: number;
  method: string;
  details: {
    hashSimilarity: number;
    colorSimilarity: number;
    structuralSimilarity: number;
    featureSimilarity: number;
    edgeSimilarity: number;
  };
}

export class AdvancedImageAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async extractAdvancedFeatures(imageFile: File): Promise<ImageFeatures> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(new Error(`Failed to load image: ${imageFile.name}`));
      };
      
      img.onload = async () => {
        try {
          // Ensure canvas is properly sized
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx.clearRect(0, 0, img.width, img.height);
          this.ctx.drawImage(img, 0, 0);
          
          const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
          
          const features: ImageFeatures = {
            perceptualHash: await this.calculateAdvancedPerceptualHash(imageData),
            colorHistogram: this.calculateColorHistogram(imageData),
            aspectRatio: img.width / img.height,
            dimensions: { width: img.width, height: img.height },
            edgeHistogram: this.calculateEdgeHistogram(imageData),
            textureFeatures: this.calculateTextureFeatures(imageData),
            dominantColors: this.extractDominantColors(imageData)
          };
          
          resolve(features);
        } catch (error) {
          console.error('Feature extraction error:', error);
          reject(error);
        }
      };
      
      try {
        img.crossOrigin = 'anonymous';
        img.src = URL.createObjectURL(imageFile);
      } catch (error) {
        console.error('Error creating object URL:', error);
        reject(error);
      }
    });
  }

  private async calculateAdvancedPerceptualHash(imageData: ImageData): Promise<string> {
    // Resize to 32x32 for better accuracy than 8x8
    const resized = this.resizeImageData(imageData, 32, 32);
    const grayscale = this.convertToGrayscale(resized);
    
    // Apply DCT (Discrete Cosine Transform) approximation
    const dctCoeffs = await this.approximateDCT(grayscale, 32);
    
    // The DCT coefficients are already limited to 8x8
    const lowFreq = dctCoeffs;
    
    // Calculate median
    const sorted = [...lowFreq].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Create binary hash
    const binaryString = lowFreq.map(coeff => coeff > median ? '1' : '0').join('');
    return CryptoJS.MD5(binaryString).toString();
  }

  private resizeImageData(imageData: ImageData, newWidth: number, newHeight: number): ImageData {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    const resizedCanvas = document.createElement('canvas');
    const resizedCtx = resizedCanvas.getContext('2d')!;
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    
    resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
    return resizedCtx.getImageData(0, 0, newWidth, newHeight);
  }

  private convertToGrayscale(imageData: ImageData): number[] {
    const grayscale: number[] = [];
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayscale.push(gray);
    }
    
    return grayscale;
  }

  private async approximateDCT(grayscale: number[], size: number): Promise<number[]> {
    // Simplified DCT approximation for perceptual hashing
    const result: number[] = [];
    
    // Only calculate the first 8x8 coefficients since we only use them anyway
    const maxCoeff = Math.min(8, size);
    
    for (let u = 0; u < maxCoeff; u++) {
      // Yield control every 4 iterations to prevent blocking
      if (u % 4 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      for (let v = 0; v < maxCoeff; v++) {
        let sum = 0;
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            const pixel = grayscale[x * size + y];
            sum += pixel * Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size)) * 
                          Math.cos(((2 * y + 1) * v * Math.PI) / (2 * size));
          }
        }
        result.push(sum);
      }
    }
    
    // Fill remaining positions with zeros for consistent hash length
    while (result.length < 64) { // 8x8 = 64
      result.push(0);
    }
    
    return result;
  }

  private calculateColorHistogram(imageData: ImageData): number[] {
    // Enhanced color histogram with more bins
    const histogram = new Array(64).fill(0); // 4x4x4 RGB bins
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.floor(data[i] / 64); // 0-3
      const g = Math.floor(data[i + 1] / 64); // 0-3
      const b = Math.floor(data[i + 2] / 64); // 0-3
      const binIndex = r * 16 + g * 4 + b;
      histogram[binIndex]++;
    }
    
    // Normalize
    const totalPixels = data.length / 4;
    return histogram.map(count => count / totalPixels);
  }

  private calculateEdgeHistogram(imageData: ImageData): number[] {
    const grayscale = this.convertToGrayscale(imageData);
    const width = imageData.width;
    const height = imageData.height;
    
    // Sobel edge detection
    const edges: number[] = [];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const gx = 
          -1 * grayscale[(y - 1) * width + (x - 1)] +
          1 * grayscale[(y - 1) * width + (x + 1)] +
          -2 * grayscale[y * width + (x - 1)] +
          2 * grayscale[y * width + (x + 1)] +
          -1 * grayscale[(y + 1) * width + (x - 1)] +
          1 * grayscale[(y + 1) * width + (x + 1)];
        
        const gy = 
          -1 * grayscale[(y - 1) * width + (x - 1)] +
          -2 * grayscale[(y - 1) * width + x] +
          -1 * grayscale[(y - 1) * width + (x + 1)] +
          1 * grayscale[(y + 1) * width + (x - 1)] +
          2 * grayscale[(y + 1) * width + x] +
          1 * grayscale[(y + 1) * width + (x + 1)];
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges.push(magnitude);
      }
    }
    
    // Create edge histogram
    const histogram = new Array(16).fill(0);
    const maxEdge = Math.max(...edges);
    
    edges.forEach(edge => {
      const bin = Math.min(15, Math.floor((edge / maxEdge) * 16));
      histogram[bin]++;
    });
    
    // Normalize
    return histogram.map(count => count / edges.length);
  }

  private calculateTextureFeatures(imageData: ImageData): number[] {
    const grayscale = this.convertToGrayscale(imageData);
    const width = imageData.width;
    const height = imageData.height;
    
    // Local Binary Pattern approximation
    const lbpHistogram = new Array(256).fill(0);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = grayscale[y * width + x];
        let lbpValue = 0;
        
        // 8-neighborhood
        const neighbors = [
          grayscale[(y - 1) * width + (x - 1)],
          grayscale[(y - 1) * width + x],
          grayscale[(y - 1) * width + (x + 1)],
          grayscale[y * width + (x + 1)],
          grayscale[(y + 1) * width + (x + 1)],
          grayscale[(y + 1) * width + x],
          grayscale[(y + 1) * width + (x - 1)],
          grayscale[y * width + (x - 1)]
        ];
        
        for (let i = 0; i < 8; i++) {
          if (neighbors[i] >= center) {
            lbpValue |= (1 << i);
          }
        }
        
        lbpHistogram[lbpValue]++;
      }
    }
    
    // Normalize and return first 32 bins for efficiency
    const totalPixels = (width - 2) * (height - 2);
    return lbpHistogram.slice(0, 32).map(count => count / totalPixels);
  }

  private extractDominantColors(imageData: ImageData): string[] {
    const colorMap = new Map<string, number>();
    const data = imageData.data;
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = Math.floor(data[i] / 32) * 32;
      const g = Math.floor(data[i + 1] / 32) * 32;
      const b = Math.floor(data[i + 2] / 32) * 32;
      const color = `rgb(${r},${g},${b})`;
      
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
    
    // Get top 5 colors
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  }

  hammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 1;
    
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }
    
    return distance / hash1.length;
  }

  compareColorHistograms(hist1: number[], hist2: number[]): number {
    // Bhattacharyya coefficient for histogram comparison
    let similarity = 0;
    for (let i = 0; i < hist1.length; i++) {
      similarity += Math.sqrt(hist1[i] * hist2[i]);
    }
    return similarity;
  }

  compareFeatureVectors(vec1: number[], vec2: number[]): number {
    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  async compareImages(image1: File, image2: File): Promise<ComparisonResult> {
    const [features1, features2] = await Promise.all([
      this.extractAdvancedFeatures(image1),
      this.extractAdvancedFeatures(image2)
    ]);
    
    // Multiple similarity metrics
    const hashSimilarity = 1 - this.hammingDistance(features1.perceptualHash, features2.perceptualHash);
    const colorSimilarity = this.compareColorHistograms(features1.colorHistogram, features2.colorHistogram);
    const edgeSimilarity = this.compareFeatureVectors(features1.edgeHistogram, features2.edgeHistogram);
    const textureSimilarity = this.compareFeatureVectors(features1.textureFeatures, features2.textureFeatures);
    
    // Structural similarity based on aspect ratio and dimensions
    const aspectRatioSimilarity = 1 - Math.abs(features1.aspectRatio - features2.aspectRatio) / 
                                 Math.max(features1.aspectRatio, features2.aspectRatio);
    
    // Weighted combination for final similarity
    const weights = {
      hash: 0.35,
      color: 0.25,
      edge: 0.20,
      texture: 0.15,
      structure: 0.05
    };
    
    const overallSimilarity = 
      hashSimilarity * weights.hash +
      colorSimilarity * weights.color +
      edgeSimilarity * weights.edge +
      textureSimilarity * weights.texture +
      aspectRatioSimilarity * weights.structure;
    
    // Calculate confidence based on consistency of metrics
    const metrics = [hashSimilarity, colorSimilarity, edgeSimilarity, textureSimilarity, aspectRatioSimilarity];
    const mean = metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
    const variance = metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / metrics.length;
    const confidence = Math.max(0, 1 - variance * 2); // Lower variance = higher confidence
    
    return {
      similarity: Math.max(0, Math.min(1, overallSimilarity)),
      confidence,
      method: 'Advanced Multi-Feature Analysis',
      details: {
        hashSimilarity,
        colorSimilarity,
        structuralSimilarity: aspectRatioSimilarity,
        featureSimilarity: textureSimilarity,
        edgeSimilarity
      }
    };
  }
}