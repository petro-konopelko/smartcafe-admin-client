import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { withRequestStatus } from './with-request-status';

const TestStore = signalStore(
  withState({ items: [] as string[] }),
  withRequestStatus(),
  withMethods((store) => ({
    async loadItems(): Promise<string[] | undefined> {
      return store.withLoading(async () => {
        const items = ['a', 'b', 'c'];
        patchState(store, { items });
        return items;
      });
    },

    async failingOperation(): Promise<void> {
      await store.withLoading(async () => {
        throw new Error('Something went wrong');
      });
    },

    async failingWithNonError(): Promise<void> {
      await store.withLoading(async () => {
        throw 'string error';
      });
    }
  }))
);

describe('withRequestStatus', () => {
  let store: InstanceType<typeof TestStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestStore]
    });
    store = TestBed.inject(TestStore);
  });

  it('should have initial loading false and error null', () => {
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set loading to true via setLoading()', () => {
    store.setLoading();

    expect(store.loading()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('should set loading to false via setLoaded()', () => {
    store.setLoading();
    store.setLoaded();

    expect(store.loading()).toBe(false);
  });

  it('should set error and loading false via setError()', () => {
    store.setLoading();
    store.setError('Test error');

    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Test error');
  });

  describe('withLoading', () => {
    it('should set loading false and return result on success', async () => {
      const result = await store.loadItems();

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.items()).toEqual(['a', 'b', 'c']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should set error message on Error instance failure', async () => {
      await store.failingOperation();

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Something went wrong');
    });

    it('should set generic error message on non-Error failure', async () => {
      await store.failingWithNonError();

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('An unexpected error occurred');
    });

    it('should return undefined on failure', async () => {
      const result = await store.failingOperation();

      expect(result).toBeUndefined();
    });

    it('should clear previous error on new request', async () => {
      await store.failingOperation();
      expect(store.error()).toBe('Something went wrong');

      await store.loadItems();
      expect(store.error()).toBeNull();
    });
  });
});
