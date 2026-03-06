import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MenuEditPageComponent } from './menu-edit-page.component';
import { MenuStore } from '../../store/menu.store';
import { MenuDto, MenuState } from '../../models';

const TEST_CAFE_ID = 'cafe-123';

describe('MenuEditPageComponent', () => {
  let component: MenuEditPageComponent;
  let fixture: ComponentFixture<MenuEditPageComponent>;
  let mockMenuStore: Partial<InstanceType<typeof MenuStore>>;

  beforeEach(async () => {
    mockMenuStore = {
      selectedMenu: signal(null),
      loading: signal(false),
      error: signal(null),
      selectMenu: vi.fn(),
      createMenu: vi.fn().mockResolvedValue('new-id'),
      updateMenu: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [MenuEditPageComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MenuStore, useValue: mockMenuStore },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['cafeId', TEST_CAFE_ID]]))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode when no menuId param', () => {
    expect(component['isEditMode']()).toBe(false);
  });

  it('should have an initial section for new menus', () => {
    expect(component['sections'].length).toBeGreaterThanOrEqual(1);
  });

  it('should have a menu form with required fields', () => {
    expect(component['menuForm']).toBeTruthy();
    expect(component['menuForm'].get('name')).toBeTruthy();
    expect(component['menuForm'].get('sections')).toBeTruthy();
  });

  it('should mark form as invalid when name is empty', () => {
    component['menuForm'].get('name')?.setValue('');
    component['menuForm'].get('name')?.markAsTouched();
    expect(component['menuForm'].get('name')?.hasError('required')).toBe(true);
  });

  it('should mark form as valid when name is provided', () => {
    component['menuForm'].get('name')?.setValue('Test Menu');
    expect(component['menuForm'].get('name')?.valid).toBe(true);
  });

  describe('section management', () => {
    it('should add a new section', () => {
      const initialCount = component['sections'].length;
      component['addSection']();
      expect(component['sections'].length).toBe(initialCount + 1);
    });

    it('should expand newly added section', () => {
      component['addSection']();
      const newIndex = component['sections'].length - 1;
      expect(component['isSectionExpanded'](newIndex)).toBe(true);
    });

    it('should remove a section at given index', () => {
      component['addSection']();
      const countAfterAdd = component['sections'].length;
      component['removeSection'](0);
      expect(component['sections'].length).toBe(countAfterAdd - 1);
    });

    it('should toggle section expanded state', () => {
      const index = 0;
      const initialState = component['isSectionExpanded'](index);
      component['toggleSection'](index);
      expect(component['isSectionExpanded'](index)).toBe(!initialState);
    });

    it('should collapse expanded section on toggle', () => {
      const index = 0;
      expect(component['isSectionExpanded'](index)).toBe(true);
      component['toggleSection'](index);
      expect(component['isSectionExpanded'](index)).toBe(false);
    });
  });

  describe('item management', () => {
    it('should add an item to a section', () => {
      const sectionIndex = 0;
      const initialCount = component['getSectionItems'](sectionIndex).length;
      component['addItem'](sectionIndex);
      expect(component['getSectionItems'](sectionIndex).length).toBe(initialCount + 1);
    });

    it('should remove an item from a section', () => {
      const sectionIndex = 0;
      component['addItem'](sectionIndex);
      const countAfterAdd = component['getSectionItems'](sectionIndex).length;
      component['removeItem'](sectionIndex, 0);
      expect(component['getSectionItems'](sectionIndex).length).toBe(countAfterAdd - 1);
    });
  });

  describe('onSubmit (create mode)', () => {
    it('should not submit when form is invalid', async () => {
      component['menuForm'].get('name')?.setValue('');
      component['menuForm'].markAllAsTouched();

      await component['onSubmit']();

      expect(mockMenuStore.createMenu).not.toHaveBeenCalled();
    });

    it('should call createMenu on valid submit', async () => {
      component['menuForm'].get('name')?.setValue('New Menu');
      // Fill in the auto-added section's required name field
      component['sections'].at(0).get('name')?.setValue('Section 1');

      await component['onSubmit']();

      expect(mockMenuStore.createMenu).toHaveBeenCalledWith(
        TEST_CAFE_ID,
        expect.objectContaining({ name: 'New Menu' })
      );
    });

    it('should set isSubmitting during submit', async () => {
      component['menuForm'].get('name')?.setValue('New Menu');
      expect(component['isSubmitting']()).toBe(false);

      const submitPromise = component['onSubmit']();
      // isSubmitting is reset in finally block after await
      await submitPromise;

      expect(component['isSubmitting']()).toBe(false);
    });

    it('should not submit when already submitting', async () => {
      component['menuForm'].get('name')?.setValue('New Menu');
      component['isSubmitting'].set(true);

      await component['onSubmit']();

      expect(mockMenuStore.createMenu).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should navigate back to menus list', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component['onCancel']();

      expect(navigateSpy).toHaveBeenCalledWith(['/cafes', TEST_CAFE_ID, 'menus']);
    });
  });
});

describe('MenuEditPageComponent (edit mode)', () => {
  let component: MenuEditPageComponent;
  let fixture: ComponentFixture<MenuEditPageComponent>;
  let mockMenuStore: Partial<InstanceType<typeof MenuStore>>;

  const mockMenu: MenuDto = {
    id: 'menu-456',
    name: 'Existing Menu',
    state: MenuState.New,
    sections: [
      {
        id: 'section-1',
        name: 'Appetizers',
        availableFrom: '11:00',
        availableTo: '22:00',
        items: []
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    mockMenuStore = {
      selectedMenu: signal(mockMenu),
      loading: signal(false),
      error: signal(null),
      selectMenu: vi.fn(),
      createMenu: vi.fn(),
      updateMenu: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [MenuEditPageComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MenuStore, useValue: mockMenuStore },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(
              new Map([
                ['cafeId', TEST_CAFE_ID],
                ['menuId', 'menu-456']
              ])
            )
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in edit mode', () => {
    expect(component).toBeTruthy();
    expect(component['isEditMode']()).toBe(true);
  });

  it('should load menu data on init in edit mode', () => {
    expect(mockMenuStore.selectMenu).toHaveBeenCalled();
  });

  it('should call updateMenu on submit in edit mode', async () => {
    component['menuForm'].get('name')?.setValue('Updated Menu');
    await fixture.whenStable();

    await component['onSubmit']();

    expect(mockMenuStore.updateMenu).toHaveBeenCalledWith(
      TEST_CAFE_ID,
      'menu-456',
      expect.objectContaining({ name: 'Updated Menu' })
    );
  });

  it('should navigate to preview in edit mode', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component['onPreview']();

    expect(navigateSpy).toHaveBeenCalledWith([
      '/cafes',
      TEST_CAFE_ID,
      'menus',
      'menu-456',
      'preview'
    ]);
  });
});
