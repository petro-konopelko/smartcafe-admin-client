import { Component, inject, signal, computed, effect, untracked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MenuStore } from '../../store/menu.store';
import { LocaleService, LOCALE_CURRENCY_MAP } from '@smartcafe/admin/shared/data-access';
import { PriceUnit } from '../../models';
import { MenuSectionComponent } from '../menu-section/menu-section.component';

@Component({
  selector: 'sc-menu-form-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    DragDropModule,
    TranslateModule,
    MenuSectionComponent,
  ],
  templateUrl: './menu-form-page.component.html',
  styleUrl: './menu-form-page.component.scss',
})
export class MenuFormPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly menuStore = inject(MenuStore);
  protected readonly localeService = inject(LocaleService);

  protected readonly cafeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('cafeId') ?? ''))
  );
  protected readonly menuId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('menuId')))
  );

  protected readonly isEditMode = computed(() => !!this.menuId());
  protected readonly isSubmitting = signal(false);
  protected readonly defaultCurrency = computed(() =>
    LOCALE_CURRENCY_MAP[this.localeService.currentLocale()]
  );

  protected readonly PriceUnit = PriceUnit;
  protected readonly currencies = ['USD', 'UAH', 'EUR', 'GBP'];

  protected menuForm: FormGroup;
  
  // Track expanded sections (all expanded by default)
  private expandedSectionsSet = signal(new Set<number>());

  constructor() {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      sections: this.fb.array([]),
    });

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
      });

      // Clear existing sections and populate from loaded menu
      this.sections.clear();
      this.expandedSectionsSet.set(new Set<number>());
      
      menu.sections.forEach((section, index) => {
        const sectionGroup = this.createSectionGroup();
        sectionGroup.patchValue({
          name: section.name,
          availableFrom: section.availableFrom,
          availableTo: section.availableTo,
        });

        const itemsArray = sectionGroup.get('items') as FormArray;
        section.items.forEach((item) => {
          const itemGroup = this.createItemGroup();
          itemGroup.patchValue({
            name: item.name,
            description: item.description,
            priceAmount: item.price.amount,
            priceCurrency: item.price.currency,
            priceUnit: item.price.unit,
            priceDiscount: item.price.discount,
          });

          const ingredientsArray = itemGroup.get('ingredients') as FormArray;
          item.ingredients.forEach((ingredient) => {
            ingredientsArray.push(
              this.fb.group({
                name: [ingredient.name, Validators.required],
                isExcludable: [ingredient.isExcludable],
              })
            );
          });

          itemsArray.push(itemGroup);
        });

        this.sections.push(sectionGroup);
        // Expand all loaded sections by default
        this.expandedSectionsSet.update(set => {
          set.add(index);
          return new Set(set);
        });
      });
      
      // Force change detection to ensure UI updates
      this.cdr.markForCheck();
    }
  }

  get sections(): FormArray {
    return this.menuForm.get('sections') as FormArray;
  }

  protected getSectionItems(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('items') as FormArray;
  }

  protected getItemIngredients(sectionIndex: number, itemIndex: number): FormArray {
    return this.getSectionItems(sectionIndex).at(itemIndex).get('ingredients') as FormArray;
  }

  protected createSectionGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      availableFrom: [''],
      availableTo: [''],
      items: this.fb.array([]),
    });
  }

  protected createItemGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(1000)],
      priceAmount: [0, [Validators.required, Validators.min(0)]],
      priceCurrency: [this.defaultCurrency(), Validators.required],
      priceUnit: [PriceUnit.PerItem, Validators.required],
      priceDiscount: [0, [Validators.min(0), Validators.max(100)]],
      ingredients: this.fb.array([]),
    });
  }

  protected addSection(): void {
    const section = this.createSectionGroup();
    this.sections.push(section);
    // Expand new section by default
    const newIndex = this.sections.length - 1;
    this.expandedSectionsSet.update(set => {
      set.add(newIndex);
      return new Set(set);
    });
  }

  protected removeSection(index: number): void {
    this.sections.removeAt(index);
    // Remove from expanded set and update indices
    this.expandedSectionsSet.update(currentSet => {
      const newSet = new Set<number>();
      currentSet.forEach(i => {
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
    this.expandedSectionsSet.update(set => {
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

  protected addIngredient(sectionIndex: number, itemIndex: number): void {
    const ingredient = this.fb.group({
      name: ['', Validators.required],
      isExcludable: [false],
    });
    this.getItemIngredients(sectionIndex, itemIndex).push(ingredient);
  }

  protected removeIngredient(
    sectionIndex: number,
    itemIndex: number,
    ingredientIndex: number
  ): void {
    this.getItemIngredients(sectionIndex, itemIndex).removeAt(ingredientIndex);
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
        name: string;
        availableFrom?: string;
        availableTo?: string;
        items: FormItem[];
      }
      
      interface FormItem {
        name: string;
        description?: string;
        priceAmount: number;
        priceCurrency: string;
        priceUnit: string;
        priceDiscount?: number;
        ingredients: FormIngredient[];
      }
      
      interface FormIngredient {
        name: string;
        isExcludable: boolean;
      }
      
      const menuData = {
        name: formValue.name,
        sections: formValue.sections.map((section: FormSection) => ({
          name: section.name,
          availableFrom: section.availableFrom || null,
          availableTo: section.availableTo || null,
          items: section.items.map((item: FormItem) => ({
            name: item.name,
            description: item.description || null,
            price: {
              amount: item.priceAmount,
              currency: item.priceCurrency,
              unit: item.priceUnit,
              discount: item.priceDiscount || 0,
            },
            image: null,
            ingredients: item.ingredients.map((ing: FormIngredient) => ({
              name: ing.name,
              isExcludable: ing.isExcludable,
            })),
          })),
        })),
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
