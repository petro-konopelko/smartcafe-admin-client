import { Preview, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#F8F9FA',
        },
        {
          name: 'dark',
          value: '#111318',
        }
      ]
    },
  },

  decorators: [
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideHttpClient(),
        provideTranslateService({
          defaultLanguage: 'en-US',
        }),
      ],
    }),
  ],

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
};

export default preview;