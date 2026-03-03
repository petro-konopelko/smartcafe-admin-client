import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  forwardRef,
  ElementRef,
  viewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl
} from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

/**
 * Represents a single chip item with text and checked state.
 */
export interface ChipItem {
  text: string;
  checked: boolean;
}

/**
 * A reusable editable chip list component with ControlValueAccessor support.
 * Each chip displays a checkbox, an inline-editable text input, and a remove button.
 * Supports adding new chips via an inline input field.
 *
 * @example
 * ```html
 * <sc-editable-chip-list
 *   formControlName="ingredients"
 *   [label]="'Ingredients'"
 *   [placeholder]="'Add ingredient...'"
 *   [checkboxTooltip]="'Excludable'"
 *   [removeTooltip]="'Remove'" />
 * ```
 */
@Component({
  selector: 'sc-editable-chip-list',
  imports: [
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './editable-chip-list.component.html',
  styleUrl: './editable-chip-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableChipListComponent),
      multi: true
    }
  ]
})
export class EditableChipListComponent implements ControlValueAccessor {
  /** Label displayed above the chip list */
  readonly label = input<string>('');

  /** Placeholder text for the add input */
  readonly placeholder = input<string>('Add item...');

  /** Tooltip for the checkbox */
  readonly checkboxTooltip = input<string>('');

  /** Tooltip for the remove button */
  readonly removeTooltip = input<string>('Remove');

  /** Accessible label for the add button */
  readonly addButtonLabel = input<string>('Add');

  /** The list of chip items */
  readonly chips = signal<ChipItem[]>([]);

  /** Whether the control is disabled */
  readonly isDisabled = signal(false);

  /** Form control for adding new chips */
  readonly addInputControl = new FormControl('');

  private readonly addInputRef = viewChild<ElementRef<HTMLInputElement>>('addInput');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: ChipItem[]) => void = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(value: ChipItem[]): void {
    this.chips.set(value ?? []);
  }

  registerOnChange(fn: (value: ChipItem[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    if (isDisabled) {
      this.addInputControl.disable();
    } else {
      this.addInputControl.enable();
    }
  }

  addChip(): void {
    const text = this.addInputControl.value?.trim();
    if (!text) {
      return;
    }

    const updated = [...this.chips(), { text, checked: false }];
    this.chips.set(updated);
    this.onChange(updated);
    this.onTouched();
    this.addInputControl.setValue('');
    this.addInputRef()?.nativeElement.focus();
  }

  removeChip(index: number): void {
    const updated = this.chips().filter((_, i) => i !== index);
    this.chips.set(updated);
    this.onChange(updated);
    this.onTouched();
  }

  toggleChecked(index: number): void {
    const updated = this.chips().map((chip, i) =>
      i === index ? { ...chip, checked: !chip.checked } : chip
    );
    this.chips.set(updated);
    this.onChange(updated);
    this.onTouched();
  }

  /** Update chip text on inline input blur */
  updateChipText(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value.trim();

    if (!text) {
      this.removeChip(index);
      return;
    }

    const current = this.chips()[index];
    if (current.text === text) {
      return;
    }

    const updated = this.chips().map((chip, i) => (i === index ? { ...chip, text } : chip));
    this.chips.set(updated);
    this.onChange(updated);
    this.onTouched();
  }

  /** Handle keyboard events in chip inline input */
  handleChipKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    }
  }

  handleAddKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addChip();
    }
  }
}
