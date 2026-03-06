import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { MenuFormBuilderService } from './menu-form-builder.service';
import { MenuDto, MenuState, PriceUnit } from '../models';

describe('MenuFormBuilderService', () => {
  let service: MenuFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule]
    });

    service = TestBed.inject(MenuFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createMenuForm', () => {
    it('should create a form with name, description, and sections', () => {
      const form = service.createMenuForm();

      expect(form.get('name')).toBeTruthy();
      expect(form.get('description')).toBeTruthy();
      expect(form.get('sections')).toBeTruthy();
    });

    it('should have required validator on name', () => {
      const form = service.createMenuForm();
      const name = form.get('name');

      name?.setValue('');
      expect(name?.hasError('required')).toBe(true);
    });

    it('should have maxLength validator on name', () => {
      const form = service.createMenuForm();
      const name = form.get('name');

      name?.setValue('a'.repeat(201));
      expect(name?.hasError('maxlength')).toBe(true);
    });

    it('should start with an empty sections array', () => {
      const form = service.createMenuForm();
      const sections = form.get('sections') as FormArray;
      expect(sections.length).toBe(0);
    });
  });

  describe('createSectionGroup', () => {
    it('should create a group with id, name, time fields, and items array', () => {
      const group = service.createSectionGroup();

      expect(group.get('id')).toBeTruthy();
      expect(group.get('name')).toBeTruthy();
      expect(group.get('availableFrom')).toBeTruthy();
      expect(group.get('availableTo')).toBeTruthy();
      expect(group.get('items')).toBeTruthy();
    });

    it('should have required validator on section name', () => {
      const group = service.createSectionGroup();
      const name = group.get('name');

      name?.setValue('');
      expect(name?.hasError('required')).toBe(true);
    });
  });

  describe('createItemGroup', () => {
    it('should create a group with all item fields', () => {
      const group = service.createItemGroup();

      expect(group.get('id')).toBeTruthy();
      expect(group.get('name')).toBeTruthy();
      expect(group.get('description')).toBeTruthy();
      expect(group.get('priceAmount')).toBeTruthy();
      expect(group.get('priceUnit')).toBeTruthy();
      expect(group.get('discountPercent')).toBeTruthy();
      expect(group.get('ingredients')).toBeTruthy();
    });

    it('should default priceUnit to PerItem', () => {
      const group = service.createItemGroup();
      expect(group.get('priceUnit')?.value).toBe(PriceUnit.PerItem);
    });

    it('should have min validator on priceAmount', () => {
      const group = service.createItemGroup();
      const price = group.get('priceAmount');

      price?.setValue(-1);
      expect(price?.hasError('min')).toBe(true);
    });

    it.each([
      { value: -1, hasError: true, description: 'below 0' },
      { value: 101, hasError: true, description: 'above 100' },
      { value: 50, hasError: false, description: 'valid value' }
    ])('should validate discountPercent when $description', ({ value, hasError }) => {
      const group = service.createItemGroup();
      const discount = group.get('discountPercent');

      discount?.setValue(value);
      const hasMin = discount?.hasError('min') ?? false;
      const hasMax = discount?.hasError('max') ?? false;
      expect(hasMin || hasMax).toBe(hasError);
    });
  });

  describe('populateFormFromMenu', () => {
    const mockMenu: MenuDto = {
      id: 'menu-1',
      name: 'Test Menu',
      state: MenuState.New,
      sections: [
        {
          id: 'section-1',
          name: 'Appetizers',
          availableFrom: '11:00',
          availableTo: '22:00',
          items: [
            {
              id: 'item-1',
              name: 'Salad',
              description: 'Fresh salad',
              price: { amount: 10, unit: PriceUnit.PerItem, discountPercent: 5 },
              ingredients: [
                { name: 'Lettuce', isExcludable: false },
                { name: 'Tomato', isExcludable: true }
              ]
            }
          ]
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    it('should populate form name from menu', () => {
      const form = service.createMenuForm();
      service.populateFormFromMenu(form, mockMenu);

      expect(form.get('name')?.value).toBe(mockMenu.name);
    });

    it('should create section groups matching menu sections', () => {
      const form = service.createMenuForm();
      service.populateFormFromMenu(form, mockMenu);

      const sections = form.get('sections') as FormArray;
      expect(sections.length).toBe(1);
      expect(sections.at(0).get('name')?.value).toBe('Appetizers');
    });

    it('should populate item groups within sections', () => {
      const form = service.createMenuForm();
      service.populateFormFromMenu(form, mockMenu);

      const sections = form.get('sections') as FormArray;
      const items = sections.at(0).get('items') as FormArray;
      expect(items.length).toBe(1);
      expect(items.at(0).get('name')?.value).toBe('Salad');
      expect(items.at(0).get('priceAmount')?.value).toBe(10);
    });

    it('should map ingredients to ChipItem format', () => {
      const form = service.createMenuForm();
      service.populateFormFromMenu(form, mockMenu);

      const sections = form.get('sections') as FormArray;
      const items = sections.at(0).get('items') as FormArray;
      const ingredients = items.at(0).get('ingredients')?.value;

      expect(ingredients).toHaveLength(2);
      expect(ingredients[0]).toEqual({ text: 'Lettuce', checked: false });
      expect(ingredients[1]).toEqual({ text: 'Tomato', checked: true });
    });

    it('should return expanded indices for all loaded sections', () => {
      const form = service.createMenuForm();
      const expandedIndices = service.populateFormFromMenu(form, mockMenu);

      expect(expandedIndices.has(0)).toBe(true);
      expect(expandedIndices.size).toBe(1);
    });

    it('should clear existing sections before populating', () => {
      const form = service.createMenuForm();
      const sections = form.get('sections') as FormArray;
      sections.push(service.createSectionGroup());
      sections.push(service.createSectionGroup());
      expect(sections.length).toBe(2);

      service.populateFormFromMenu(form, mockMenu);
      expect(sections.length).toBe(1);
    });
  });

  describe('buildMenuRequest', () => {
    it('should convert form values to CreateMenuRequest DTO', () => {
      const formValue = {
        name: 'My Menu',
        sections: [
          {
            id: 'sec-1',
            name: 'Main',
            availableFrom: '10:00',
            availableTo: '20:00',
            items: [
              {
                id: 'item-1',
                name: 'Burger',
                description: 'Tasty',
                priceAmount: 15,
                priceUnit: PriceUnit.PerItem,
                discountPercent: 10,
                ingredients: [{ text: 'Bun', checked: false }]
              }
            ]
          }
        ]
      };

      const result = service.buildMenuRequest(formValue);

      expect(result.name).toBe('My Menu');
      expect(result.sections).toHaveLength(1);

      const section = result.sections[0];
      expect(section.name).toBe('Main');
      expect(section.availableFrom).toBe('10:00');

      const item = section.items[0];
      expect(item.name).toBe('Burger');
      expect(item.price.amount).toBe(15);
      expect(item.price.discountPercent).toBe(10);
      expect(item.ingredients).toEqual([{ name: 'Bun', isExcludable: false }]);
    });

    it('should handle null optional fields', () => {
      const formValue = {
        name: 'Menu',
        sections: [
          {
            id: null,
            name: 'Section',
            availableFrom: '',
            availableTo: '',
            items: [
              {
                id: null,
                name: 'Item',
                description: '',
                priceAmount: 5,
                priceUnit: PriceUnit.PerItem,
                discountPercent: 0,
                ingredients: []
              }
            ]
          }
        ]
      };

      const result = service.buildMenuRequest(formValue);

      expect(result.sections[0].id).toBeNull();
      expect(result.sections[0].availableFrom).toBeNull();
      expect(result.sections[0].items[0].id).toBeNull();
      expect(result.sections[0].items[0].description).toBeNull();
    });
  });
});
