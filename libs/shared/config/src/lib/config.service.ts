import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from './config.model';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly CONFIG_PATH = '/app-config.json';
  private readonly http = inject(HttpClient);

  readonly config = signal<AppConfig | null>(null);

  async load(): Promise<void> {
    const loadedConfig = await firstValueFrom(this.http.get<AppConfig>(this.CONFIG_PATH));
    if (!this.isValidConfig(loadedConfig)) {
      throw new Error('Runtime config is invalid: apiUrl is required.');
    }

    this.config.set(loadedConfig);
  }

  getConfig(): AppConfig {
    const currentConfig = this.config();
    if (!currentConfig) {
      throw new Error('Runtime config is not loaded yet.');
    }

    return currentConfig;
  }

  private isValidConfig(config: AppConfig | null | undefined): config is AppConfig {
    return !!config && typeof config.apiUrl === 'string' && config.apiUrl.length > 0;
  }
}
