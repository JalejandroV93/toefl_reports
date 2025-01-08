/* eslint-disable @typescript-eslint/no-explicit-any */
// services/geminiRateLimiter.ts
export class GeminiRateLimiter {
    private requestQueue: Array<() => Promise<any>> = [];
    private isProcessing = false;
    private requestCount = 0;
    private lastRequestTime = Date.now();
    private readonly RATE_LIMIT_PER_MINUTE = 15;
    private readonly MIN_REQUEST_INTERVAL = 4000; // 4 seconds between requests (15 RPM)
  
    private async processQueue() {
      if (this.isProcessing || this.requestQueue.length === 0) {
        return;
      }
  
      this.isProcessing = true;
  
      while (this.requestQueue.length > 0) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - this.lastRequestTime;
  
        // Ensure minimum interval between requests
        if (timeElapsed < this.MIN_REQUEST_INTERVAL) {
          await new Promise(resolve => 
            setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeElapsed)
          );
        }
  
        const request = this.requestQueue.shift();
        if (request) {
          try {
            this.requestCount++;
            this.lastRequestTime = Date.now();
            await request();
          } catch (error) {
            console.error('Error processing Gemini request:', error);
          }
        }
  
        // Reset counter every minute
        if (currentTime - this.lastRequestTime >= 60000) {
          this.requestCount = 0;
        }
      }
  
      this.isProcessing = false;
    }
  
    async enqueue<T>(request: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        this.requestQueue.push(async () => {
          try {
            const result = await request();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
  
        this.processQueue().catch(console.error);
      });
    }
  
    getQueueLength(): number {
      return this.requestQueue.length;
    }
  
    getEstimatedWaitTime(): number {
      return this.requestQueue.length * this.MIN_REQUEST_INTERVAL;
    }
  }
  
  export const geminiRateLimiter = new GeminiRateLimiter();