import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'sc-loading-spinner',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly message = input<string>('');

  protected readonly diameter = computed(() => {
    const sizeMap = {
      small: 24,
      medium: 48,
      large: 72,
    };
    return sizeMap[this.size()];
  });
}
