interface Metrics {
  totalRequests: number;
  activeReservations: number;
  totalCheckouts: number;
  failedReservations: number;
  averageResponseTime: number;
  responseTimes: number[];
}

class MetricsCollector {
  private metrics: Metrics = {
    totalRequests: 0,
    activeReservations: 0,
    totalCheckouts: 0,
    failedReservations: 0,
    averageResponseTime: 0,
    responseTimes: []
  };

  incrementTotalRequests() {
    this.metrics.totalRequests++;
  }

  incrementActiveReservations() {
    this.metrics.activeReservations++;
  }

  decrementActiveReservations() {
    this.metrics.activeReservations--;
  }

  incrementTotalCheckouts() {
    this.metrics.totalCheckouts++;
  }

  incrementFailedReservations() {
    this.metrics.failedReservations++;
  }

  addResponseTime(time: number) {
    this.metrics.responseTimes.push(time);
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
    this.metrics.averageResponseTime = 
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
  }

  getMetrics() {
    return {
      ...this.metrics,
      responseTimes: undefined,
      p95ResponseTime: this.calculatePercentile(95),
      p99ResponseTime: this.calculatePercentile(99)
    };
  }

  private calculatePercentile(percentile: number): number {
    if (this.metrics.responseTimes.length === 0) return 0;
    const sorted = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      activeReservations: 0,
      totalCheckouts: 0,
      failedReservations: 0,
      averageResponseTime: 0,
      responseTimes: []
    };
  }
}

export const metricsCollector = new MetricsCollector();