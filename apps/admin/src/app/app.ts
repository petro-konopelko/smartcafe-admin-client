import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './shell/toolbar/toolbar.component';
import { LoadingService, LocaleService } from '@smartcafe/admin/shared/data-access';

@Component({
  selector: 'sc-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly loadingService = inject(LoadingService);
  protected readonly localeService = inject(LocaleService); // Make accessible to template

  protected readonly isLoading = this.loadingService.isLoading;
}
