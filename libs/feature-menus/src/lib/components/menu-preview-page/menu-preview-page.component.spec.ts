import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MenuPreviewPageComponent } from './menu-preview-page.component';
import { MenuStore } from '../../store/menu.store';
import { MenuDto, MenuState } from '../../models';
import { LocaleService, DEFAULT_LOCALE } from '@smartcafe/admin/shared/data-access';

const TEST_CAFE_ID = 'cafe-123';
const TEST_MENU_ID = 'menu-456';

const mockMenu: MenuDto = {
  id: TEST_MENU_ID,
  name: 'Preview Menu',
  state: MenuState.Published,
  sections: [
    {
      id: 'section-1',
      name: 'Main Course',
      availableFrom: '11:00',
      availableTo: '22:00',
      items: [
        {
          id: 'item-1',
          name: 'Pizza Margherita',
          description: 'Classic Italian pizza',
          price: { amount: 12.5, unit: 'PerItem', discountPercent: 10 },
          image: null,
          ingredients: [{ name: 'Mozzarella', isExcludable: true }]
        }
      ]
    }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('MenuPreviewPageComponent', () => {
  let component: MenuPreviewPageComponent;
  let fixture: ComponentFixture<MenuPreviewPageComponent>;
  let mockMenuStore: Partial<InstanceType<typeof MenuStore>>;

  beforeEach(async () => {
    mockMenuStore = {
      selectedMenu: signal(mockMenu),
      loading: signal(false),
      error: signal(null),
      selectMenu: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MenuPreviewPageComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MenuStore, useValue: mockMenuStore },
        {
          provide: LocaleService,
          useValue: { currentLocale: signal(DEFAULT_LOCALE) }
        },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(
              new Map([
                ['cafeId', TEST_CAFE_ID],
                ['menuId', TEST_MENU_ID]
              ])
            )
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPreviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display menu name', () => {
    const name = fixture.nativeElement.querySelector('.cafe-name');
    expect(name?.textContent).toContain('Preview Menu');
  });

  it('should display sections', () => {
    const sections = fixture.nativeElement.querySelectorAll('.menu-section');
    expect(sections).toHaveLength(1);
  });

  it('should display section title', () => {
    const title = fixture.nativeElement.querySelector('.section-title');
    expect(title?.textContent).toContain('Main Course');
  });

  it('should display menu items', () => {
    const items = fixture.nativeElement.querySelectorAll('.menu-item');
    expect(items).toHaveLength(1);
  });

  it('should display item name', () => {
    const name = fixture.nativeElement.querySelector('.item-name');
    expect(name?.textContent).toContain('Pizza Margherita');
  });

  it('should display item description', () => {
    const desc = fixture.nativeElement.querySelector('.item-description');
    expect(desc?.textContent).toContain('Classic Italian pizza');
  });

  it('should display back-to-edit button', () => {
    const button = fixture.nativeElement.querySelector('.back-to-edit-btn');
    expect(button).toBeTruthy();
  });

  it('should show loading state', () => {
    (mockMenuStore.loading as ReturnType<typeof signal>).set(true);
    (mockMenuStore.selectedMenu as ReturnType<typeof signal>).set(null);
    fixture.detectChanges();

    const loading = fixture.nativeElement.querySelector('.loading');
    expect(loading).toBeTruthy();
  });

  it('should show error state', () => {
    (mockMenuStore.error as ReturnType<typeof signal>).set('Something went wrong');
    (mockMenuStore.selectedMenu as ReturnType<typeof signal>).set(null);
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.error-card');
    expect(error).toBeTruthy();
  });
});
