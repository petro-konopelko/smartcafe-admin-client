import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'icon';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Material Design 3 button component with support for filled, outlined, text, and icon variants.
 * 
 * @example
 * ```html
 * <sc-button variant="filled" (clicked)="handleClick()">
 *   Save
 * </sc-button>
 * 
 * <sc-button variant="outlined" [disabled]="isLoading()">
 *   <span class="material-symbols-rounded">add</span>
 *   Add Item
 * </sc-button>
 * 
 * <sc-button variant="icon" ariaLabel="Delete">
 *   <span class="material-symbols-rounded">delete</span>
 * </sc-button>
 * ```
 */
@Component({
  selector: 'sc-button',
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [class]="'btn btn-' + variant()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="disabled()"
      (click)="handleClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.full-width]': 'fullWidth()'
  }
})
export class ButtonComponent {
  /** Button variant (filled, outlined, text, icon) */
  variant = input<ButtonVariant>('filled');
  
  /** Button type attribute */
  type = input<ButtonType>('button');
  
  /** Whether the button is disabled */
  disabled = input<boolean>(false);
  
  /** ARIA label for accessibility */
  ariaLabel = input<string>('');
  
  /** Whether button should take full width */
  fullWidth = input<boolean>(false);
  
  /** Click event emitter */
  clicked = output<MouseEvent>();
  
  handleClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
