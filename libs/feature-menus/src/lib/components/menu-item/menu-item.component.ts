import { Component, input, output, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { PriceUnit } from '../../models';

@Component({
  selector: 'sc-menu-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    DragDropModule,
    TranslateModule
  ],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemComponent {
  itemForm = input.required<FormGroup>();
  itemIndex = input.required<number>();
  sectionIndex = input.required<number>();
  
  removeItem = output<void>();
  addIngredient = output<void>();
  removeIngredient = output<number>();
  
  PriceUnit = PriceUnit;
  
  // Collapse state
  isCollapsed = signal(false);
  
  // Image preview
  imagePreview = signal<string | null>(null);
  
  get ingredients(): FormArray {
    return this.itemForm().get('ingredients') as FormArray;
  }
  
  // Computed final price with discount applied
  finalPrice = computed(() => {
    const form = this.itemForm();
    const price = form.get('priceAmount')?.value || 0;
    const discount = form.get('priceDiscount')?.value || 0;
    return price - (price * discount / 100);
  });
  
  itemTitle = computed(() => {
    return this.itemForm().get('name')?.value || `Item ${this.itemIndex() + 1}`;
  });
  
  toggleCollapse(): void {
    this.isCollapsed.update(value => !value);
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
