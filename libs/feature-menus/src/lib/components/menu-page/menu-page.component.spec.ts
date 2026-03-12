import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MenuPageComponent } from './menu-page.component';
import { MenuStore } from '../../store/menu.store';
import { MenuState, MenuSummaryDto } from '../../models';

const TEST_CAFE_ID = 'cafe-123';

const mockMenuSummary: MenuSummaryDto = {
  menuId: 'menu-456',
  name: 'Test Menu',
  state: MenuState.New,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('MenuPageComponent', () => {
  let component: MenuPageComponent;
  let fixture: ComponentFixture<MenuPageComponent>;
  let mockMenuStore: Partial<InstanceType<typeof MenuStore>>;

  beforeEach(async () => {
    mockMenuStore = {
      menus: signal([mockMenuSummary]),
      loading: signal(false),
      error: signal(null),
      hasMenus: signal(true),
      menuCount: signal(1),
      loadMenus: vi.fn(),
      deleteMenu: vi.fn().mockResolvedValue(true),
      publishMenu: vi.fn().mockResolvedValue(true),
      activateMenu: vi.fn().mockResolvedValue(true),
      cloneMenu: vi.fn().mockResolvedValue('cloned-id')
    };

    await TestBed.configureTestingModule({
      imports: [MenuPageComponent, TranslateModule.forRoot()],
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

    fixture = TestBed.createComponent(MenuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display menus title', () => {
    const title = fixture.nativeElement.querySelector('h1');
    expect(title).toBeTruthy();
  });

  it('should display create menu button', () => {
    const createButton = fixture.nativeElement.querySelector('[data-testid="create-menu-button"]');
    expect(createButton).toBeTruthy();
  });

  it('should display back button', () => {
    const backButton = fixture.nativeElement.querySelector('[data-testid="back-button"]');
    expect(backButton).toBeTruthy();
  });
});
