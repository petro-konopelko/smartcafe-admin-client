import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { MenuApiService } from '../services/menu-api.service';
import {
  MenuDto,
  MenuSummaryDto,
  CreateMenuRequest,
  UpdateMenuRequest,
  MenuState,
} from '../models';
import { firstValueFrom } from 'rxjs';

interface MenuStoreState {
  menus: MenuSummaryDto[];
  selectedMenu: MenuDto | null;
  activeMenu: MenuDto | null;
  currentCafeId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: MenuStoreState = {
  menus: [],
  selectedMenu: null,
  activeMenu: null,
  currentCafeId: null,
  loading: false,
  error: null,
};

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ menus }) => ({
    menuCount: computed(() => menus().length),
    hasMenus: computed(() => menus().length > 0),
    draftMenus: computed(() => menus().filter((m: MenuSummaryDto) => m.state === MenuState.Draft)),
    publishedMenus: computed(() => menus().filter((m: MenuSummaryDto) => m.state === MenuState.Published)),
    activeMenus: computed(() => menus().filter((m: MenuSummaryDto) => m.state === MenuState.Active)),
  })),
  withMethods((store, menuApi = inject(MenuApiService)) => ({
    async loadMenus(cafeId: string): Promise<void> {
      patchState(store, { loading: true, error: null, currentCafeId: cafeId });
      try {
        const response = await firstValueFrom(menuApi.listMenus(cafeId));
        patchState(store, { menus: response.menus, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load menus';
        console.error(`Failed to load menus for cafe ${cafeId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
      }
    },

    async selectMenu(cafeId: string, menuId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const menu = await firstValueFrom(menuApi.getMenu(cafeId, menuId));
        patchState(store, { selectedMenu: menu, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load menu';
        console.error(`Failed to load menu ${menuId} for cafe ${cafeId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
      }
    },

    async loadMenu(cafeId: string, menuId: string): Promise<void> {
      // Alias for selectMenu for backwards compatibility
      await this.selectMenu(cafeId, menuId);
    },

    async loadActiveMenu(cafeId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const menu = await firstValueFrom(menuApi.getActiveMenu(cafeId));
        patchState(store, { activeMenu: menu, loading: false });
      } catch (error) {
        console.info(`No active menu found for cafe ${cafeId}`, error);
        patchState(store, {
          activeMenu: null,
          loading: false,
        });
      }
    },

    async createMenu(cafeId: string, request: CreateMenuRequest): Promise<string | null> {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(menuApi.createMenu(cafeId, request));
        // Reload the list after creating
        const listResponse = await firstValueFrom(menuApi.listMenus(cafeId));
        patchState(store, { menus: listResponse.menus, loading: false });
        return response.menuId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create menu';
        console.error('Failed to create menu:', error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return null;
      }
    },

    async updateMenu(cafeId: string, menuId: string, request: UpdateMenuRequest): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuApi.updateMenu(cafeId, menuId, request));
        // Reload the menu and list
        const [menu, listResponse] = await Promise.all([
          firstValueFrom(menuApi.getMenu(cafeId, menuId)),
          firstValueFrom(menuApi.listMenus(cafeId)),
        ]);
        patchState(store, {
          selectedMenu: menu,
          menus: listResponse.menus,
          loading: false,
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update menu';
        console.error(`Failed to update menu ${menuId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return false;
      }
    },

    async deleteMenu(cafeId: string, menuId: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuApi.deleteMenu(cafeId, menuId));
        // Remove from local state
        patchState(store, {
          menus: store.menus().filter((m: MenuSummaryDto) => m.menuId !== menuId),
          selectedMenu: store.selectedMenu()?.id === menuId ? null : store.selectedMenu(),
          loading: false,
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu';
        console.error(`Failed to delete menu ${menuId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return false;
      }
    },

    async cloneMenu(cafeId: string, menuId: string, newName: string): Promise<string | null> {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(menuApi.cloneMenu(cafeId, menuId, { newName }));
        // Reload the list
        const listResponse = await firstValueFrom(menuApi.listMenus(cafeId));
        patchState(store, { menus: listResponse.menus, loading: false });
        return response.menuId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to clone menu';
        console.error(`Failed to clone menu ${menuId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return null;
      }
    },

    async publishMenu(cafeId: string, menuId: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuApi.publishMenu(cafeId, menuId));
        // Reload the menu and list
        const [menu, listResponse] = await Promise.all([
          firstValueFrom(menuApi.getMenu(cafeId, menuId)),
          firstValueFrom(menuApi.listMenus(cafeId)),
        ]);
        patchState(store, {
          selectedMenu: menu,
          menus: listResponse.menus,
          loading: false,
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to publish menu';
        console.error(`Failed to publish menu ${menuId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return false;
      }
    },

    async activateMenu(cafeId: string, menuId: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(menuApi.activateMenu(cafeId, menuId));
        // Reload the menu, active menu, and list
        const [menu, activeMenu, listResponse] = await Promise.all([
          firstValueFrom(menuApi.getMenu(cafeId, menuId)),
          firstValueFrom(menuApi.getActiveMenu(cafeId)),
          firstValueFrom(menuApi.listMenus(cafeId)),
        ]);
        patchState(store, {
          selectedMenu: menu,
          activeMenu,
          menus: listResponse.menus,
          loading: false,
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to activate menu';
        console.error(`Failed to activate menu ${menuId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return false;
      }
    },

    clearSelectedMenu(): void {
      patchState(store, { selectedMenu: null });
    },

    clearMenus(): void {
      patchState(store, initialState);
    },
  })),
);
