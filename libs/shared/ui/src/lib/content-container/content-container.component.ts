import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

/**
 * A reusable container component that handles loading, empty, and content states.
 *
 * @example
 * ```html
 * <sc-content-container
 *   [loading]="isLoading()"
 *   [empty]="items().length === 0"
 *   [emptyIcon]="'store'"
 *   [emptyTitle]="'No cafes found'"
 *   [emptyMessage]="'Create your first cafe to get started'">
 *   <div>Your actual content here</div>
 * </sc-content-container>
 * ```
 */
@Component({
  selector: 'sc-content-container',
  imports: [LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './content-container.component.html',
  styleUrl: './content-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentContainerComponent {
  /**
   * Whether the content is currently loading
   */
  readonly loading = input<boolean>(false);

  /**
   * Whether the content is empty (no data to display)
   */
  readonly empty = input<boolean>(false);

  /**
   * Icon to display in empty state
   */
  readonly emptyIcon = input<string>('inbox');

  /**
   * Title to display in empty state
   */
  readonly emptyTitle = input<string>('No items found');

  /**
   * Message to display in empty state
   */
  readonly emptyMessage = input<string>('');

  /**
   * Optional loading message
   */
  readonly loadingMessage = input<string>('');

  /**
   * Size of the loading spinner
   */
  readonly loadingSize = input<'small' | 'medium' | 'large'>('medium');
}
