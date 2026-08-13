import CryptoJS from 'crypto-js';

export class ImageAnalyzer {
  async calculatePerceptualHash(imageFile: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          // Resize to 8x8 for perceptual hashing
          canvas.width = 8;
          canvas.height = 8;
          ctx.drawImage(img, 0, 0, 8, 8);
          
          const imageData = ctx.getImageData(0, 0, 8, 8);
          const pixels = imageData.data;
          const grayscale: number[] = [];
          
          // Convert to grayscale
          for (let i = 0; i < pixels.length; i += 4) {
            const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            grayscale.push(gray);
          }
          
          // Calculate average
          const average = grayscale.reduce((sum, val) => sum + val, 0) / grayscale.length;
          
          // Create binary hash
          const binaryString = grayscale.map(pixel => pixel > average ? '1' : '0').join('');
          const hash = CryptoJS.MD5(binaryString).toString();
          resolve(hash);
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  }

  async extractFeatures(imageFile: File): Promise<{
    colorHistogram: number[];
    aspectRatio: number;
    dimensions: { width: number; height: number };
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const pixels = imageData.data;
          
          // Calculate color histogram (simplified RGB bins)
          const histogram = new Array(27).fill(0); // 3x3x3 RGB bins
          
          for (let i = 0; i < pixels.length; i += 4) {
            const r = Math.floor(pixels[i] / 85); // 0, 1, or 2
            const g = Math.floor(pixels[i + 1] / 85);
            const b = Math.floor(pixels[i + 2] / 85);
            const binIndex = r * 9 + g * 3 + b;
            histogram[binIndex]++;
          }
          
          // Normalize histogram
          const totalPixels = pixels.length / 4;
          const normalizedHistogram = histogram.map(count => count / totalPixels);
          
          resolve({
            colorHistogram: normalizedHistogram,
            aspectRatio: img.width / img.height,
            dimensions: { width: img.width, height: img.height }
          });
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  }

  hammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 1;
    
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }
    
    return distance / hash1.length;
  }

  compareFeatures(features1: any, features2: any): number {
    // Compare color histograms using chi-square distance
    const histogramSimilarity = this.compareHistograms(
      features1.colorHistogram,
      features2.colorHistogram
    );
    
    // Compare aspect ratios
    const aspectRatioSimilarity = 1 - Math.abs(features1.aspectRatio - features2.aspectRatio) / 
                                 Math.max(features1.aspectRatio, features2.aspectRatio);
    
    // Weight the similarities
    return (histogramSimilarity * 0.7) + (aspectRatioSimilarity * 0.3);
  }

  private compareHistograms(hist1: number[], hist2: number[]): number {
    let similarity = 0;
    for (let i = 0; i < hist1.length; i++) {
      similarity += Math.min(hist1[i], hist2[i]);
    }
    return similarity;
  }

  async compareImages(image1: File, image2: File): Promise<{
    similarity: number;
    method: string;
    details: any;
  }> {
    const [hash1, hash2] = await Promise.all([
      this.calculatePerceptualHash(image1),
      this.calculatePerceptualHash(image2)
    ]);
    
    const [features1, features2] = await Promise.all([
      this.extractFeatures(image1),
      this.extractFeatures(image2)
    ]);
    
    const hashSimilarity = 1 - this.hammingDistance(hash1, hash2);
    const featureSimilarity = this.compareFeatures(features1, features2);
    
    // Combined similarity score
    const overallSimilarity = (hashSimilarity * 0.6) + (featureSimilarity * 0.4);
    
    return {
      similarity: overallSimilarity,
      method: 'Perceptual Hash + Feature Comparison',
      details: {
        hashSimilarity,
        featureSimilarity,
        dimensions1: features1.dimensions,
        dimensions2: features2.dimensions
      }
    };
  }
}