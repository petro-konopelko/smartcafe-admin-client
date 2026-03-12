import { Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, LIGHT_THEME_NAME } from '../../services/theme.service';

@Component({
  selector: 'sc-theme-switcher',
  imports: [MatIconButton, MatIcon, MatTooltip, TranslateModule],
  templateUrl: './theme-switcher.component.html'
})
export class ThemeSwitcherComponent {
  private readonly themeService = inject(ThemeService);

  readonly label = computed(() =>
    this.themeService.currentTheme() === LIGHT_THEME_NAME
      ? 'app.theme.switchToDark'
      : 'app.theme.switchToLight'
  );

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
