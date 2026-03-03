import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { MenuEditItemComponent } from './menu-edit-item/menu-edit-item.component';

@Component({
  selector: 'sc-menu-edit-section',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DragDropModule,
    TranslateModule,
    MenuEditItemComponent
  ],
  templateUrl: './menu-edit-section.component.html',
  styleUrl: './menu-edit-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuEditSectionComponent {
  sectionForm = input.required<FormGroup>();
  sectionIndex = input.required<number>();
  isExpanded = input.required<boolean>();
  currencies = input<string[]>(['USD', 'UAH', 'EUR', 'GBP']);

  removeSection = output<void>();
  toggleExpand = output<void>();
  addItem = output<void>();
  removeItem = output<number>();
  dropItem = output<CdkDragDrop<unknown>>();

  get items(): FormArray {
    return this.sectionForm().get('items') as FormArray;
  }
}
