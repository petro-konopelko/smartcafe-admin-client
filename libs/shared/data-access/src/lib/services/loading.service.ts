import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingCount = signal(0);
  readonly isLoading = signal(false);

  show(): void {
    this.loadingCount.update((count) => count + 1);
    this.isLoading.set(this.loadingCount() > 0);
  }

  hide(): void {
    this.loadingCount.update((count) => Math.max(0, count - 1));
    this.isLoading.set(this.loadingCount() > 0);
  }
}
