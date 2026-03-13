import './preview.scss';
import { Preview, applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { withThemeByClassName } from '@storybook/addon-themes';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  },

  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark-mode'
      },
      defaultTheme: 'light',
      parentSelector: 'html'
    }),
    applicationConfig({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideTranslateService({
          fallbackLang: 'en-US'
        })
      ]
    })
  ]
};

export default preview;
