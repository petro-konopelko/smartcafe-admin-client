import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { withRequestStatus } from '@smartcafe/admin/shared/data-access';
import { MenuApiService } from '../services/menu-api.service';
import {
  MenuDto,
  MenuSummaryDto,
  CreateMenuRequest,
  UpdateMenuRequest,
  MenuState
} from '../models';
import { firstValueFrom } from 'rxjs';

interface MenuStoreState {
  menus: MenuSummaryDto[];
  selectedMenu: MenuDto | null;
  activeMenu: MenuDto | null;
  currentCafeId: string | null;
}

const initialState: MenuStoreState = {
  menus: [],
  selectedMenu: null,
  activeMenu: null,
  currentCafeId: null
};

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withRequestStatus(),
  withComputed(({ menus }) => ({
    menuCount: computed(() => menus().length),
    hasMenus: computed(() => menus().length > 0),
    draftMenus: computed(() => menus().filter((m: MenuSummaryDto) => m.state === MenuState.New)),
    publishedMenus: computed(() =>
      menus().filter((m: MenuSummaryDto) => m.state === MenuState.Published)
    ),
    activeMenus: computed(() => menus().filter((m: MenuSummaryDto) => m.state === MenuState.Active))
  })),
  withMethods((store, menuApi = inject(MenuApiService)) => ({
    async loadMenus(cafeId: string): Promise<void> {
      patchState(store, { currentCafeId: cafeId });
      await store.withLoading(async () => {
        const response = await firstValueFrom(menuApi.listMenus(cafeId));
        patchState(store, { menus: response.menus });
      });
    },

    async selectMenu(cafeId: string, menuId: string): Promise<void> {
      await store.withLoading(async () => {
        const menu = await firstValueFrom(menuApi.getMenu(cafeId, menuId));
        patchState(store, { selectedMenu: menu });
      });
    },

    async loadActiveMenu(cafeId: string): Promise<void> {
      await store.withLoading(async () => {
        try {
          const menu = await firstValueFrom(menuApi.getActiveMenu(cafeId));
          patchState(store, { activeMenu: menu });
        } catch {
          // No active menu is a valid state, not an error
          patchState(store, { activeMenu: null });
        }
      });
    },

    async createMenu(cafeId: string, request: CreateMenuRequest): Promise<string | null> {
      const result = await store.withLoading(async () => {
        const response = await firstValueFrom(menuApi.createMenu(cafeId, request));
        const listResponse = await firstValueFrom(menuApi.listMenus(cafeId));
        patchState(store, { menus: listResponse.menus });
        return response.menuId;
      });
      return result ?? null;
    },

    async updateMenu(cafeId: string, menuId: string, request: UpdateMenuRequest): Promise<boolean> {
      const result = await store.withLoading(async () => {
        await firstValueFrom(menuApi.updateMenu(cafeId, menuId, request));
        const [menu, listResponse] = await Promise.all([
          firstValueFrom(menuApi.getMenu(cafeId, menuId)),
          firstValueFrom(menuApi.listMenus(cafeId))
        ]);
        patchState(store, { selectedMenu: menu, menus: listResponse.menus });
        return true;
      });
      return result ?? false;
    },

    async deleteMenu(cafeId: string, menuId: string): Promise<boolean> {
      const result = await store.withLoading(async () => {
        await firstValueFrom(menuApi.deleteMenu(cafeId, menuId));
        patchState(store, {
          menus: store.menus().filter((m: MenuSummaryDto) => m.menuId !== menuId),
          selectedMenu: store.selectedMenu()?.id === menuId ? null : store.selectedMenu()
        });
        return true;
      });
      return result ?? false;
    },

    async cloneMenu(cafeId: string, menuId: string, newName: string): Promise<string | null> {
      const result = await store.withLoading(async () => {
        const response = await firstValueFrom(menuApi.cloneMenu(cafeId, menuId, { newName }));
        const listResponse = await firstValueFrom(menuApi.listMenus(cafeId));
        patchState(store, { menus: listResponse.menus });
        return response.menuId;
      });
      return result ?? null;
    },

    async publishMenu(cafeId: string, menuId: string): Promise<boolean> {
      const result = await store.withLoading(async () => {
        await firstValueFrom(menuApi.publishMenu(cafeId, menuId));
        const [menu, listResponse] = await Promise.all([
          firstValueFrom(menuApi.getMenu(cafeId, menuId)),
          firstValueFrom(menuApi.listMenus(cafeId))
        ]);
        patchState(store, { selectedMenu: menu, menus: listResponse.menus });
        return true;
      });
      return result ?? false;
    },

    async activateMenu(cafeId: string, menuId: string): Promise<boolean> {
      const result = await store.withLoading(async () => {
        await firstValueFrom(menuApi.activateMenu(cafeId, menuId));
        const [menu, activeMenu, listResponse] = await Promise.all([
          firstValueFrom(menuApi.getMenu(cafeId, menuId)),
          firstValueFrom(menuApi.getActiveMenu(cafeId)),
          firstValueFrom(menuApi.listMenus(cafeId))
        ]);
        patchState(store, { selectedMenu: menu, activeMenu, menus: listResponse.menus });
        return true;
      });
      return result ?? false;
    },

    clearSelectedMenu(): void {
      patchState(store, { selectedMenu: null });
    },

    clearMenus(): void {
      patchState(store, { ...initialState, loading: false, error: null });
    }
  }))
);
