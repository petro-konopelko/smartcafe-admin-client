import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { withRequestStatus } from '@smartcafe/admin/shared/data-access';
import { CafeApiService } from '../services/cafe-api.service';
import { CafeDto, CreateCafeRequest } from '../models';
import { firstValueFrom } from 'rxjs';

interface CafeState {
  cafes: CafeDto[];
  selectedCafe: CafeDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: CafeState = {
  cafes: [],
  selectedCafe: null,
  loading: false,
  error: null
};

export const CafeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withRequestStatus(),
  withComputed(({ cafes }) => ({
    cafeCount: computed(() => cafes().length),
    hasCafes: computed(() => cafes().length > 0)
  })),
  withMethods((store, cafeApi = inject(CafeApiService)) => ({
    async loadCafes(): Promise<void> {
      await store.withLoading(async () => {
        const response = await firstValueFrom(cafeApi.listCafes());
        patchState(store, { cafes: response.cafes });
      });
    },

    async selectCafe(cafeId: string): Promise<void> {
      await store.withLoading(async () => {
        const cafe = await firstValueFrom(cafeApi.getCafe(cafeId));
        patchState(store, { selectedCafe: cafe });
      });
    },

    async createCafe(request: CreateCafeRequest): Promise<string | null> {
      const result = await store.withLoading(async () => {
        const response = await firstValueFrom(cafeApi.createCafe(request));
        const list = await firstValueFrom(cafeApi.listCafes());
        patchState(store, { cafes: list.cafes });
        return response.cafeId;
      });
      return result ?? null;
    },

    async deleteCafe(cafeId: string): Promise<boolean> {
      const result = await store.withLoading(async () => {
        await firstValueFrom(cafeApi.deleteCafe(cafeId));
        patchState(store, {
          cafes: store.cafes().filter((c) => c.id !== cafeId),
          selectedCafe: store.selectedCafe()?.id === cafeId ? null : store.selectedCafe()
        });
        return true;
      });
      return result ?? false;
    },

    clearSelectedCafe(): void {
      patchState(store, { selectedCafe: null });
    }
  }))
);
