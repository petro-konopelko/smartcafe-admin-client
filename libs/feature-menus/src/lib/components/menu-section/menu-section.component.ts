import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'sc-menu-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    DragDropModule,
    TranslateModule,
    MenuItemComponent
  ],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuSectionComponent {
  sectionForm = input.required<FormGroup>();
  sectionIndex = input.required<number>();
  isExpanded = input.required<boolean>();
  
  removeSection = output<void>();
  toggleExpand = output<void>();
  addItem = output<void>();
  removeItem = output<number>();
  dropItem = output<CdkDragDrop<unknown>>();
  addIngredient = output<number>();
  removeIngredient = output<{ itemIndex: number; ingredientIndex: number }>();
  
  get items(): FormArray {
    return this.sectionForm().get('items') as FormArray;
  }
}
