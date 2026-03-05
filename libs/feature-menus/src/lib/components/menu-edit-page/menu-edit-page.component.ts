import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  untracked
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';
import { MenuStore } from '../../store/menu.store';
import { ContentContainerComponent, ChipItem } from '@smartcafe/admin/shared/ui';
import { PriceUnit } from '../../models';
import { MenuEditSectionComponent } from './menu-edit-section/menu-edit-section.component';

@Component({
  selector: 'sc-menu-edit-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    DragDropModule,
    TranslateModule,
    ContentContainerComponent,
    MenuEditSectionComponent
  ],
  templateUrl: './menu-edit-page.component.html',
  styleUrl: './menu-edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dense-form-fields' }
})
export class MenuEditPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly menuStore = inject(MenuStore);

  protected readonly cafeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('cafeId') ?? ''))
  );
  protected readonly menuId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('menuId')))
  );

  protected readonly isEditMode = computed(() => !!this.menuId());
  protected readonly isSubmitting = signal(false);

  protected readonly PriceUnit = PriceUnit;

  protected menuForm: FormGroup;
  protected readonly isFormInvalid;

  // Track expanded sections (all expanded by default)
  private expandedSectionsSet = signal(new Set<number>());

  constructor() {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(500)]],
      sections: this.fb.array([])
    });

    this.isFormInvalid = toSignal(
      this.menuForm.statusChanges.pipe(
        startWith(this.menuForm.status),
        map(() => this.menuForm.invalid)
      ),
      { initialValue: this.menuForm.invalid }
    );

    // Load menu data when in edit mode
    effect(() => {
      const isEdit = this.isEditMode();
      const menuId = this.menuId();
      const cafeId = this.cafeId();

      if (isEdit && menuId && cafeId) {
        untracked(() => {
          this.loadMenu(cafeId, menuId);
        });
      } else if (!isEdit) {
        // Add one empty section for new menus
        untracked(() => {
          this.addSection();
        });
      }
    });
  }

  private async loadMenu(cafeId: string, menuId: string): Promise<void> {
    await this.menuStore.loadMenu(cafeId, menuId);
    const menu = this.menuStore.selectedMenu();
    if (menu) {
      this.menuForm.patchValue({
        name: menu.name,
        description: ''
      });

      // Clear existing sections and populate from loaded menu
      this.sections.clear();
      this.expandedSectionsSet.set(new Set<number>());

      menu.sections.forEach((section, index) => {
        const sectionGroup = this.createSectionGroup();
        sectionGroup.patchValue({
          id: section.id ?? null,
          name: section.name,
          availableFrom: section.availableFrom,
          availableTo: section.availableTo
        });

        const itemsArray = sectionGroup.get('items') as FormArray;
        section.items.forEach((item) => {
          const itemGroup = this.createItemGroup();
          itemGroup.patchValue({
            id: item.id ?? null,
            name: item.name,
            description: item.description,
            priceAmount: item.price.amount,
            priceUnit: item.price.unit,
            discountPercent: item.price.discountPercent
          });

          itemGroup.get('ingredients')?.setValue(
            item.ingredients.map(
              (ingredient) =>
                ({
                  text: ingredient.name,
                  checked: ingredient.isExcludable
                }) as ChipItem
            )
          );

          itemsArray.push(itemGroup);
        });

        this.sections.push(sectionGroup);
        // Expand all loaded sections by default
        this.expandedSectionsSet.update((set) => {
          set.add(index);
          return new Set(set);
        });
      });
    }
  }

  get sections(): FormArray {
    return this.menuForm.get('sections') as FormArray;
  }

  protected getSectionItems(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('items') as FormArray;
  }

  protected createSectionGroup(): FormGroup {
    return this.fb.group({
      id: [null as string | null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      availableFrom: [''],
      availableTo: [''],
      items: this.fb.array([])
    });
  }

  protected createItemGroup(): FormGroup {
    return this.fb.group({
      id: [null as string | null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      priceAmount: [0, [Validators.required, Validators.min(0)]],
      priceUnit: [PriceUnit.PerItem, Validators.required],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      ingredients: [[] as ChipItem[]]
    });
  }

  protected addSection(): void {
    const section = this.createSectionGroup();
    this.sections.push(section);
    // Expand new section by default
    const newIndex = this.sections.length - 1;
    this.expandedSectionsSet.update((set) => {
      set.add(newIndex);
      return new Set(set);
    });
  }

  protected removeSection(index: number): void {
    this.sections.removeAt(index);
    // Remove from expanded set and update indices
    this.expandedSectionsSet.update((currentSet) => {
      const newSet = new Set<number>();
      currentSet.forEach((i) => {
        if (i > index) {
          newSet.add(i - 1);
        } else if (i < index) {
          newSet.add(i);
        }
      });
      return newSet;
    });
  }

  protected toggleSection(index: number): void {
    this.expandedSectionsSet.update((set) => {
      if (set.has(index)) {
        set.delete(index);
      } else {
        set.add(index);
      }
      return new Set(set);
    });
  }

  protected isSectionExpanded(index: number): boolean {
    return this.expandedSectionsSet().has(index);
  }

  protected addItem(sectionIndex: number): void {
    const item = this.createItemGroup();
    this.getSectionItems(sectionIndex).push(item);
  }

  protected removeItem(sectionIndex: number, itemIndex: number): void {
    this.getSectionItems(sectionIndex).removeAt(itemIndex);
  }

  protected dropSection(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.sections.controls, event.previousIndex, event.currentIndex);
    this.sections.updateValueAndValidity();
  }

  protected dropItem(event: CdkDragDrop<FormGroup[]>, sectionIndex: number): void {
    const itemsArray = this.getSectionItems(sectionIndex);
    moveItemInArray(itemsArray.controls, event.previousIndex, event.currentIndex);
    itemsArray.updateValueAndValidity();
  }

  protected async onSubmit(): Promise<void> {
    if (this.menuForm.invalid || this.isSubmitting()) {
      this.menuForm.markAllAsTouched();
      return;
    }

    const cafeId = this.cafeId();
    if (!cafeId) return;

    this.isSubmitting.set(true);

    try {
      const formValue = this.menuForm.value;

      interface FormSection {
        id?: string | null;
        name: string;
        availableFrom?: string;
        availableTo?: string;
        items: FormItem[];
      }

      interface FormItem {
        id?: string | null;
        name: string;
        description?: string;
        priceAmount: number;
        priceUnit: string;
        discountPercent?: number;
        ingredients: ChipItem[];
      }

      const menuData = {
        name: formValue.name,
        sections: formValue.sections.map((section: FormSection) => ({
          id: section.id ?? null,
          name: section.name,
          availableFrom: section.availableFrom || null,
          availableTo: section.availableTo || null,
          items: section.items.map((item: FormItem) => ({
            id: item.id ?? null,
            name: item.name,
            description: item.description || null,
            price: {
              amount: item.priceAmount,
              unit: item.priceUnit,
              discountPercent: item.discountPercent || 0
            },
            image: null,
            ingredients: (item.ingredients as ChipItem[]).map((chip: ChipItem) => ({
              name: chip.text,
              isExcludable: chip.checked
            }))
          }))
        }))
      };

      if (this.isEditMode()) {
        const menuId = this.menuId();
        if (!menuId) return;
        await this.menuStore.updateMenu(cafeId, menuId, menuData);
      } else {
        await this.menuStore.createMenu(cafeId, menuData);
      }

      if (!this.menuStore.error()) {
        this.router.navigate(['/cafes', cafeId, 'menus']);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected onCancel(): void {
    const cafeId = this.cafeId();
    if (cafeId) {
      this.router.navigate(['/cafes', cafeId, 'menus']);
    }
  }

  protected async onPreview(): Promise<void> {
    const cafeId = this.cafeId();
    const menuId = this.menuId();
    if (cafeId && menuId) {
      this.router.navigate(['/cafes', cafeId, 'menus', menuId, 'preview']);
    }
  }
}
