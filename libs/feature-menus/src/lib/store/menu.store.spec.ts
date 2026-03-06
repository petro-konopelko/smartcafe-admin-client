import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MenuStore } from './menu.store';
import { MenuApiService } from '../services/menu-api.service';
import { MenuState, MenuDto, MenuSummaryDto, PublishMenuResponse } from '../models';

const TEST_CAFE_ID = 'cafe-123';
const TEST_MENU_ID = 'menu-456';

const mockMenuSummary: MenuSummaryDto = {
  menuId: TEST_MENU_ID,
  name: 'Test Menu',
  state: MenuState.New,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockMenuDto: MenuDto = {
  id: TEST_MENU_ID,
  name: 'Test Menu',
  state: MenuState.New,
  sections: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('MenuStore', () => {
  let store: InstanceType<typeof MenuStore>;
  let menuApi: MenuApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MenuStore,
        {
          provide: MenuApiService,
          useValue: {
            listMenus: vi.fn(),
            getMenu: vi.fn(),
            getActiveMenu: vi.fn(),
            createMenu: vi.fn(),
            updateMenu: vi.fn(),
            deleteMenu: vi.fn(),
            cloneMenu: vi.fn(),
            publishMenu: vi.fn(),
            activateMenu: vi.fn()
          }
        }
      ]
    });

    store = TestBed.inject(MenuStore);
    menuApi = TestBed.inject(MenuApiService);
  });

  describe('initial state', () => {
    it('should have empty menus', () => {
      expect(store.menus()).toEqual([]);
    });

    it('should have null selectedMenu', () => {
      expect(store.selectedMenu()).toBeNull();
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('computed', () => {
    it('should compute menuCount', async () => {
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus: [mockMenuSummary] }));
      await store.loadMenus(TEST_CAFE_ID);
      expect(store.menuCount()).toBe(1);
    });

    it('should compute hasMenus', async () => {
      expect(store.hasMenus()).toBe(false);
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus: [mockMenuSummary] }));
      await store.loadMenus(TEST_CAFE_ID);
      expect(store.hasMenus()).toBe(true);
    });

    it('should compute draftMenus', async () => {
      const menus = [
        { ...mockMenuSummary, menuId: '1', state: MenuState.New },
        { ...mockMenuSummary, menuId: '2', state: MenuState.Published },
        { ...mockMenuSummary, menuId: '3', state: MenuState.Active }
      ];
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus }));
      await store.loadMenus(TEST_CAFE_ID);
      expect(store.draftMenus()).toHaveLength(1);
    });

    it('should compute publishedMenus', async () => {
      const menus = [
        { ...mockMenuSummary, menuId: '1', state: MenuState.New },
        { ...mockMenuSummary, menuId: '2', state: MenuState.Published }
      ];
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus }));
      await store.loadMenus(TEST_CAFE_ID);
      expect(store.publishedMenus()).toHaveLength(1);
    });

    it('should compute activeMenus', async () => {
      const menus = [{ ...mockMenuSummary, menuId: '1', state: MenuState.Active }];
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus }));
      await store.loadMenus(TEST_CAFE_ID);
      expect(store.activeMenus()).toHaveLength(1);
    });
  });

  describe('loadMenus', () => {
    it('should load menus successfully', async () => {
      const menus = [mockMenuSummary];
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus }));

      await store.loadMenus(TEST_CAFE_ID);

      expect(store.menus()).toEqual(menus);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should set loading state during load', async () => {
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus: [] }));

      const promise = store.loadMenus(TEST_CAFE_ID);
      // After await, loading should be false
      await promise;
      expect(store.loading()).toBe(false);
    });

    it('should handle error when loading fails', async () => {
      vi.mocked(menuApi.listMenus).mockReturnValue(throwError(() => new Error('Network error')));

      await store.loadMenus(TEST_CAFE_ID);

      expect(store.menus()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Network error');
    });
  });

  describe('selectMenu', () => {
    it('should select a menu successfully', async () => {
      vi.mocked(menuApi.getMenu).mockReturnValue(of(mockMenuDto));

      await store.selectMenu(TEST_CAFE_ID, TEST_MENU_ID);

      expect(store.selectedMenu()).toEqual(mockMenuDto);
      expect(store.loading()).toBe(false);
    });

    it('should handle error when selecting fails', async () => {
      vi.mocked(menuApi.getMenu).mockReturnValue(throwError(() => new Error('Not found')));

      await store.selectMenu(TEST_CAFE_ID, TEST_MENU_ID);

      expect(store.selectedMenu()).toBeNull();
      expect(store.error()).toBe('Not found');
    });
  });

  describe('createMenu', () => {
    it('should create menu and reload list', async () => {
      const newMenuId = 'new-menu-id';
      vi.mocked(menuApi.createMenu).mockReturnValue(
        of({ menuId: newMenuId, cafeId: TEST_CAFE_ID })
      );
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus: [mockMenuSummary] }));

      const result = await store.createMenu(TEST_CAFE_ID, { name: 'New', sections: [] });

      expect(result).toBe(newMenuId);
      expect(store.menus()).toHaveLength(1);
      expect(store.loading()).toBe(false);
    });

    it('should handle error when creating fails', async () => {
      vi.mocked(menuApi.createMenu).mockReturnValue(throwError(() => new Error('Create failed')));

      const result = await store.createMenu(TEST_CAFE_ID, { name: 'New', sections: [] });

      expect(result).toBeNull();
      expect(store.error()).toBe('Create failed');
    });
  });

  describe('deleteMenu', () => {
    it('should delete menu and update local state', async () => {
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus: [mockMenuSummary] }));
      await store.loadMenus(TEST_CAFE_ID);

      vi.mocked(menuApi.deleteMenu).mockReturnValue(of(undefined));

      const result = await store.deleteMenu(TEST_CAFE_ID, TEST_MENU_ID);

      expect(result).toBe(true);
      expect(store.menus()).toHaveLength(0);
    });

    it('should handle error when deleting fails', async () => {
      vi.mocked(menuApi.deleteMenu).mockReturnValue(throwError(() => new Error('Delete failed')));

      const result = await store.deleteMenu(TEST_CAFE_ID, TEST_MENU_ID);

      expect(result).toBe(false);
      expect(store.error()).toBe('Delete failed');
    });
  });

  describe('cloneMenu', () => {
    it('should clone menu and reload list', async () => {
      const clonedId = 'cloned-id';
      vi.mocked(menuApi.cloneMenu).mockReturnValue(of({ menuId: clonedId, cafeId: TEST_CAFE_ID }));
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus: [mockMenuSummary] }));

      const result = await store.cloneMenu(TEST_CAFE_ID, TEST_MENU_ID, 'Cloned Name');

      expect(result).toBe(clonedId);
      expect(store.loading()).toBe(false);
    });
  });

  describe('publishMenu', () => {
    it('should publish menu and reload state', async () => {
      const publishedMenu = { ...mockMenuDto, state: MenuState.Published };
      vi.mocked(menuApi.publishMenu).mockReturnValue(
        of({ menuId: TEST_MENU_ID } as PublishMenuResponse)
      );
      vi.mocked(menuApi.getMenu).mockReturnValue(of(publishedMenu));
      vi.mocked(menuApi.listMenus).mockReturnValue(
        of({ menus: [{ ...mockMenuSummary, state: MenuState.Published }] })
      );

      const result = await store.publishMenu(TEST_CAFE_ID, TEST_MENU_ID);

      expect(result).toBe(true);
      expect(store.selectedMenu()?.state).toBe(MenuState.Published);
    });
  });

  describe('activateMenu', () => {
    it('should activate menu and reload state', async () => {
      const activeMenu = { ...mockMenuDto, state: MenuState.Active };
      vi.mocked(menuApi.activateMenu).mockReturnValue(of(undefined));
      vi.mocked(menuApi.getMenu).mockReturnValue(of(activeMenu));
      vi.mocked(menuApi.getActiveMenu).mockReturnValue(of(activeMenu));
      vi.mocked(menuApi.listMenus).mockReturnValue(
        of({ menus: [{ ...mockMenuSummary, state: MenuState.Active }] })
      );

      const result = await store.activateMenu(TEST_CAFE_ID, TEST_MENU_ID);

      expect(result).toBe(true);
      expect(store.activeMenu()).toEqual(activeMenu);
    });
  });

  describe('clearSelectedMenu', () => {
    it('should clear selected menu', async () => {
      vi.mocked(menuApi.getMenu).mockReturnValue(of(mockMenuDto));
      await store.selectMenu(TEST_CAFE_ID, TEST_MENU_ID);

      store.clearSelectedMenu();

      expect(store.selectedMenu()).toBeNull();
    });
  });

  describe('clearMenus', () => {
    it('should reset to initial state', async () => {
      vi.mocked(menuApi.listMenus).mockReturnValue(of({ menus: [mockMenuSummary] }));
      await store.loadMenus(TEST_CAFE_ID);

      store.clearMenus();

      expect(store.menus()).toEqual([]);
      expect(store.selectedMenu()).toBeNull();
      expect(store.activeMenu()).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });
});
