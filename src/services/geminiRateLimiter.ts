/* eslint-disable @typescript-eslint/no-explicit-any */
// services/geminiRateLimiter.ts
export interface QueuedRequest<T> {
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  addedAt: number;
}

export class GeminiRateLimiter {
  private requestQueue: Array<QueuedRequest<any>> = [];
  private isProcessing = false;
  private requestCount = 0;
  private lastRequestTime = Date.now();
  private readonly MIN_REQUEST_INTERVAL = 4000; // 4 seconds between requests (15 RPM)
  private readonly MAX_QUEUE_SIZE = 100; // Máximo número de solicitudes en cola

  private onQueueUpdate?:
    | ((queueLength: number, estimatedWait: number) => void)
    | null;

  // Método para registrar callback de actualización
  setQueueUpdateCallback(
    callback: ((queueLength: number, estimatedWait: number) => void) | null
  ) {
    this.onQueueUpdate = callback || undefined;
  }

  private notifyQueueUpdate() {
    if (this.onQueueUpdate) {
      this.onQueueUpdate(this.getQueueLength(), this.getEstimatedWaitTime());
    }
  }

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
        await new Promise((resolve) =>
          setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeElapsed)
        );
      }

      const queuedRequest = this.requestQueue.shift();
      if (queuedRequest) {
        try {
          this.requestCount++;
          this.lastRequestTime = Date.now();
          const result = await queuedRequest.request();
          queuedRequest.resolve(result);
        } catch (error) {
          console.error("Error processing Gemini request:", error);
          queuedRequest.reject(error);
        }

        this.notifyQueueUpdate();
      }

      // Reset counter every minute
      if (currentTime - this.lastRequestTime >= 60000) {
        this.requestCount = 0;
      }
    }

    this.isProcessing = false;
  }

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    if (this.requestQueue.length >= this.MAX_QUEUE_SIZE) {
      throw new Error("Queue is full. Please try again later.");
    }

    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest<T> = {
        request,
        resolve,
        reject,
        addedAt: Date.now(),
      };

      this.requestQueue.push(queuedRequest);
      this.notifyQueueUpdate();
      this.processQueue().catch(console.error);
    });
  }

  getQueueLength(): number {
    return this.requestQueue.length;
  }

  getEstimatedWaitTime(totalRequests?: number): number {
    if (totalRequests) {
      return totalRequests * this.MIN_REQUEST_INTERVAL;
    }
    return this.requestQueue.length * this.MIN_REQUEST_INTERVAL;
  }

  getEstimatedTimeForRequests(requestCount: number): number {
    return requestCount * this.MIN_REQUEST_INTERVAL;
  }

  // Método para obtener la posición en la cola
  getPositionInQueue(requestTime: number): number {
    return (
      this.requestQueue.findIndex((req) => req.addedAt === requestTime) + 1
    );
  }
}

export const geminiRateLimiter = new GeminiRateLimiter();
