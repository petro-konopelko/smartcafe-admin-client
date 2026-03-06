import { signalStoreFeature, withState, withMethods, patchState } from '@ngrx/signals';

/**
 * State shape added by `withRequestStatus()`.
 */
export interface RequestStatusState {
  loading: boolean;
  error: string | null;
}

const initialRequestStatusState: RequestStatusState = {
  loading: false,
  error: null
};

/**
 * A reusable @ngrx/signals feature that manages `loading` and `error` state.
 *
 * Provides `setLoading()`, `setLoaded()`, `setError(msg)`, and a
 * `withLoading(fn)` helper that wraps any async function with consistent
 * loading/error state transitions.
 *
 * @example
 * ```ts
 * export const CafeStore = signalStore(
 *   withState({ cafes: [] }),
 *   withRequestStatus(),
 *   withMethods((store) => ({
 *     async loadCafes() {
 *       return store.withLoading(async () => {
 *         const response = await firstValueFrom(api.listCafes());
 *         patchState(store, { cafes: response.cafes });
 *       });
 *     },
 *   }))
 * );
 * ```
 */
export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>(initialRequestStatusState),
    withMethods((store) => ({
      setLoading(): void {
        patchState(store, { loading: true, error: null });
      },

      setLoaded(): void {
        patchState(store, { loading: false });
      },

      setError(error: string): void {
        patchState(store, { error, loading: false });
      },

      /**
       * Wraps an async operation with loading/error state management.
       * Sets `loading: true` before execution and `loading: false` after.
       * On error, sets the error message from the caught exception.
       *
       * @returns The value returned by `fn`, or `undefined` on error.
       */
      async withLoading<T>(fn: () => Promise<T>): Promise<T | undefined> {
        patchState(store, { loading: true, error: null });
        try {
          const result = await fn();
          patchState(store, { loading: false });
          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';
          patchState(store, { error: errorMessage, loading: false });
          return undefined;
        }
      }
    }))
  );
}
