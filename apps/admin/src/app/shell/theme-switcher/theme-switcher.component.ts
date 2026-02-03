import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '@smartcafe/admin/shared/data-access';

@Component({
  selector: 'sc-theme-switcher',
  imports: [MatIconButton, MatIcon, MatTooltip, TranslateModule],
  template: `
    <button
      mat-icon-button
      (click)="toggleTheme()"
      [attr.aria-label]="
        (themeService.currentTheme() === 'light'
          ? 'app.theme.switchToDark'
          : 'app.theme.switchToLight'
        ) | translate
      "
      [matTooltip]="
        (themeService.currentTheme() === 'light'
          ? 'app.theme.switchToDark'
          : 'app.theme.switchToLight'
        ) | translate
      "
    >
      <mat-icon>contrast</mat-icon>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      button {
        color: var(--md-on-surface);
      }
    `,
  ],
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
