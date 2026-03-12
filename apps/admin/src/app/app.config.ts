import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { APP_CONFIG, AppConfig, AppConfigService } from '@smartcafe/admin/shared/config';

import { routes } from './app.routes';
import {
  errorInterceptor,
  loadingInterceptor,
  retryInterceptor,
  API_URL,
  DEFAULT_LOCALE
} from '@smartcafe/admin/shared/data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([retryInterceptor, loadingInterceptor, errorInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      }),
      fallbackLang: DEFAULT_LOCALE
    }),
    provideAppInitializer(() => {
      return inject(AppConfigService).load();
    }),
    {
      provide: APP_CONFIG,
      useFactory: (configService: AppConfigService) => configService.getConfig(),
      deps: [AppConfigService]
    },
    {
      provide: API_URL,
      useFactory: (config: AppConfig) => config.apiUrl,
      deps: [APP_CONFIG]
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    }
  ]
};
