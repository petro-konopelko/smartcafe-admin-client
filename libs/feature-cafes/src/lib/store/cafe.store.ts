import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
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
  error: null,
};

export const CafeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ cafes }) => ({
    cafeCount: computed(() => cafes().length),
    hasCafes: computed(() => cafes().length > 0),
  })),
  withMethods((store, cafeApi = inject(CafeApiService)) => ({
    async loadCafes(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(cafeApi.listCafes());
        patchState(store, { cafes: response.cafes, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load cafes';
        console.error('Failed to load cafes:', error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
      }
    },

    async selectCafe(cafeId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const cafe = await firstValueFrom(cafeApi.getCafe(cafeId));
        patchState(store, { selectedCafe: cafe, loading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load cafe';
        console.error(`Failed to load cafe ${cafeId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
      }
    },

    async createCafe(request: CreateCafeRequest): Promise<string | null> {
      patchState(store, { loading: true, error: null });
      try {
        const response = await firstValueFrom(cafeApi.createCafe(request));
        // Reload the list after creating
        await firstValueFrom(cafeApi.listCafes()).then((list) => {
          patchState(store, { cafes: list.cafes, loading: false });
        });
        return response.cafeId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create cafe';
        console.error('Failed to create cafe:', error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return null;
      }
    },

    async deleteCafe(cafeId: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      try {
        await firstValueFrom(cafeApi.deleteCafe(cafeId));
        // Remove from local state
        patchState(store, {
          cafes: store.cafes().filter((c) => c.id !== cafeId),
          selectedCafe: store.selectedCafe()?.id === cafeId ? null : store.selectedCafe(),
          loading: false,
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete cafe';
        console.error(`Failed to delete cafe ${cafeId}:`, error);
        patchState(store, {
          error: errorMessage,
          loading: false,
        });
        return false;
      }
    },

    clearSelectedCafe(): void {
      patchState(store, { selectedCafe: null });
    },
  })),
);
