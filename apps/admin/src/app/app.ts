import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './shell/toolbar/toolbar.component';
import { LoadingSpinnerComponent } from '@smartcafe/admin/shared/ui';
import { LoadingService, LocaleService } from '@smartcafe/admin/shared/data-access';

@Component({
  selector: 'sc-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [RouterOutlet, ToolbarComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly loadingService = inject(LoadingService);
  protected readonly localeService = inject(LocaleService); // Make accessible to template

  protected readonly isLoading = this.loadingService.isLoading;
}
