import { Component, ChangeDetectionStrategy, inject, signal, HostListener } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService, SUPPORTED_LOCALES } from '@smartcafe/admin/shared/data-access';

@Component({
  selector: 'sc-language-selector',
  imports: [MatIcon, TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent {
  protected readonly localeService = inject(LocaleService);
  protected isOpen = signal(false);

  protected toggleDropdown(): void {
    this.isOpen.update(value => !value);
  }

  protected closeDropdown(): void {
    this.isOpen.set(false);
  }

  protected getCurrentLanguageName(): string {
    return this.localeService.currentLocale() === 'en-US' ? 'English' : 'Українська';
  }

  protected onLanguageChange(locale: string): void {
    this.localeService.setLocale(
      locale as (typeof SUPPORTED_LOCALES)[keyof typeof SUPPORTED_LOCALES],
    );
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('sc-language-selector')) {
      this.closeDropdown();
    }
  }
}
