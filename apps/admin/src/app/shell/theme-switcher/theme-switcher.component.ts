import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, Theme, LIGHT_THEME_NAME } from '../../services/theme.service';

@Component({
  selector: 'sc-theme-switcher',
  imports: [MatIconButton, MatIcon, MatTooltip, TranslateModule],
  templateUrl: './theme-switcher.component.html'
})
export class ThemeSwitcherComponent {
  private readonly themeService = inject(ThemeService);

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public get currentTheme(): Theme {
    return this.themeService.currentTheme();
  }

  public get label(): string {
    return this.currentTheme === LIGHT_THEME_NAME
      ? 'app.theme.switchToDark'
      : 'app.theme.switchToLight';
  }
}
