import {
  Component,
  input,
  output,
  computed,
  signal,
  effect,
  ChangeDetectionStrategy,
  DestroyRef,
  inject
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { EditableChipListComponent, PriceSummaryComponent } from '@smartcafe/admin/shared/ui';
import { Subscription } from 'rxjs';
import { PriceUnit } from '../../../../models';

@Component({
  selector: 'sc-menu-edit-item',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    EditableChipListComponent,
    DragDropModule,
    TranslateModule,
    PriceSummaryComponent
  ],
  templateUrl: './menu-edit-item.component.html',
  styleUrl: './menu-edit-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuEditItemComponent {
  itemForm = input.required<FormGroup>();
  itemIndex = input.required<number>();
  sectionIndex = input.required<number>();

  removeItem = output<void>();

  readonly PriceUnit = PriceUnit;
  private readonly destroyRef = inject(DestroyRef);
  private formSub: Subscription | null = null;

  isCollapsed = signal(false);
  imagePreview = signal<string | null>(null);

  private readonly priceInfo = signal({
    price: 0,
    discountPercent: 0,
    unit: PriceUnit.PerItem,
    description: ''
  });

  descriptionPreview = computed(() => {
    return this.priceInfo().description?.trim();
  });

  originalPrice = computed(() => this.priceInfo().price || 0);

  discountPercent = computed(() => {
    const discount = Number(this.priceInfo().discountPercent) || 0;
    return Math.max(0, Math.min(100, Math.round(discount)));
  });

  calculatedPrice = computed(() => {
    const vals = this.priceInfo();
    const final = vals.price - (vals.price * vals.discountPercent) / 100;
    return { amount: final };
  });

  constructor() {
    effect(() => {
      const form = this.itemForm();

      // Clean up previous subscription
      this.formSub?.unsubscribe();

      const extractValues = (): void => {
        this.priceInfo.set({
          price: form.get('priceAmount')?.value || 0,
          discountPercent: form.get('discountPercent')?.value || 0,
          unit: form.get('priceUnit')?.value ?? PriceUnit.PerItem,
          description: form.get('description')?.value || ''
        });
      };

      // Set initial values
      extractValues();

      // Subscribe to future changes
      this.formSub = form.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => extractValues());
    });
  }

  toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview.set(e.target?.result as string);
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
  }
}
