import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
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
});
