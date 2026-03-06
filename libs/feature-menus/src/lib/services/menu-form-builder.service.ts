import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ChipItem } from '@smartcafe/admin/shared/ui';
import { PriceUnit, MenuFormSection, MenuFormItem } from '../models';
import { CreateMenuRequest } from '../models';
import { MenuDto } from '../models';

/**
 * Builds and manages reactive form groups for menu editing.
 *
 * Responsible for creating the menu form structure, populating it from
 * a MenuDto, and converting form values back to API request DTOs.
 */
@Injectable({
  providedIn: 'root'
})
export class MenuFormBuilderService {
  private readonly fb = inject(FormBuilder);

  createMenuForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(500)]],
      sections: this.fb.array([])
    });
  }

  createSectionGroup(): FormGroup {
    return this.fb.group({
      id: [null as string | null],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      availableFrom: [''],
      availableTo: [''],
      items: this.fb.array([])
    });
  }

  createItemGroup(): FormGroup {
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

  /**
   * Populates a menu form from a MenuDto.
   * Clears existing sections and rebuilds them from the DTO.
   *
   * @returns Set of expanded section indices.
   */
  populateFormFromMenu(form: FormGroup, menu: MenuDto): Set<number> {
    form.patchValue({
      name: menu.name,
      description: ''
    });

    const sections = form.get('sections') as FormArray;
    sections.clear();

    const expandedIndices = new Set<number>();

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

      sections.push(sectionGroup);
      expandedIndices.add(index);
    });

    return expandedIndices;
  }

  /**
   * Converts form values to a CreateMenuRequest DTO suitable for the API.
   */
  buildMenuRequest(formValue: Record<string, unknown>): CreateMenuRequest {
    return {
      name: formValue['name'] as string,
      sections: (formValue['sections'] as MenuFormSection[]).map((section) => ({
        id: section.id ?? null,
        name: section.name,
        availableFrom: section.availableFrom || null,
        availableTo: section.availableTo || null,
        items: section.items.map((item: MenuFormItem) => ({
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
  }
}
