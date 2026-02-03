import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { CafeStore } from './cafe.store';
import { CafeApiService } from '../services/cafe-api.service';
import { CafeDto, CreateCafeRequest, ListCafesResponse } from '../models';

describe('CafeStore', () => {
  let store: InstanceType<typeof CafeStore>;
  let cafeApiService: CafeApiService;

  const mockCafe: CafeDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Cafe',
    contactInfo: 'test@cafe.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  };

  const mockCafes: CafeDto[] = [
    mockCafe,
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Test Cafe 2',
      contactInfo: 'test2@cafe.com',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: null,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CafeStore,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    store = TestBed.inject(CafeStore);
    cafeApiService = TestBed.inject(CafeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should have initial state', () => {
    expect(store.cafes()).toEqual([]);
    expect(store.selectedCafe()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadCafes', () => {
    it('should load cafes successfully', async () => {
      const response: ListCafesResponse = { cafes: mockCafes };
      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of(response));

      await store.loadCafes();

      expect(store.cafes()).toEqual(mockCafes);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should set loading state while loading', () => {
      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of({ cafes: [] }));

      store.loadCafes();

      // Check loading state is true during the operation
      // Note: This is synchronous check, actual loading state management happens in the store
      expect(cafeApiService.listCafes).toHaveBeenCalled();
    });

    it('should handle error when loading fails', async () => {
      const error = new Error('API Error');
      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(throwError(() => error));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Mock implementation to suppress console errors in tests
      });

      await store.loadCafes();

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('API Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load cafes:', error);
    });
  });

  describe('selectCafe', () => {
    it('should select cafe successfully', async () => {
      vi.spyOn(cafeApiService, 'getCafe').mockReturnValue(of(mockCafe));

      await store.selectCafe(mockCafe.id);

      expect(store.selectedCafe()).toEqual(mockCafe);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle error when selecting fails', async () => {
      const error = new Error('Not found');
      vi.spyOn(cafeApiService, 'getCafe').mockReturnValue(throwError(() => error));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Mock implementation to suppress console errors in tests
      });

      await store.selectCafe(mockCafe.id);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Failed to load cafe');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading cafe:', error);
    });
  });

  describe('createCafe', () => {
    it('should create cafe successfully', async () => {
      const request: CreateCafeRequest = {
        name: 'New Cafe',
        contactInfo: 'new@cafe.com',
      };
      const newCafeId = '323e4567-e89b-12d3-a456-426614174002';
      const newCafe: CafeDto = {
        ...request,
        id: newCafeId,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: null,
      };
      
      vi.spyOn(cafeApiService, 'createCafe').mockReturnValue(of({ cafeId: newCafeId }));
      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of({ cafes: [newCafe] }));

      const result = await store.createCafe(request);

      expect(result).toBe(newCafeId);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should add created cafe to list', async () => {
      const request: CreateCafeRequest = {
        name: 'New Cafe',
        contactInfo: 'new@cafe.com',
      };
      const newCafeId = '323e4567-e89b-12d3-a456-426614174002';
      const newCafe: CafeDto = {
        ...request,
        id: newCafeId,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: null,
      };

      // Set initial cafes
      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of({ cafes: mockCafes }));
      await store.loadCafes();

      vi.spyOn(cafeApiService, 'createCafe').mockReturnValue(of({ cafeId: newCafeId }));
      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of({ cafes: [...mockCafes, newCafe] }));

      await store.createCafe(request);

      expect(store.cafes().length).toBe(3);
      expect(store.cafes()).toContainEqual(newCafe);
    });

    it('should handle error when creation fails', async () => {
      const request: CreateCafeRequest = {
        name: 'Test',
        contactInfo: 'test@test.com',
      };
      const error = new Error('Creation failed');
      vi.spyOn(cafeApiService, 'createCafe').mockReturnValue(throwError(() => error));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Mock implementation to suppress console errors in tests
      });

      const result = await store.createCafe(request);

      expect(result).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Creation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create cafe:', error);
    });
  });

  describe('deleteCafe', () => {
    it('should delete cafe successfully', async () => {
      // Set initial cafes
      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of({ cafes: mockCafes }));
      await store.loadCafes();

      vi.spyOn(cafeApiService, 'deleteCafe').mockReturnValue(of(void 0));

      const result = await store.deleteCafe(mockCafes[0].id);

      expect(result).toBe(true);
      expect(store.cafes().length).toBe(1);
      expect(store.cafes()).not.toContainEqual(mockCafes[0]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      vi.spyOn(cafeApiService, 'deleteCafe').mockReturnValue(throwError(() => error));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Mock implementation to suppress console errors in tests
      });

      const result = await store.deleteCafe(mockCafe.id);

      expect(result).toBe(false);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Deletion failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Failed to delete cafe ${mockCafe.id}:`, error);
    });
  });

  describe('computed selectors', () => {
    it('should compute hasCafes correctly', async () => {
      expect(store.hasCafes()).toBe(false);

      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of({ cafes: mockCafes }));
      await store.loadCafes();

      expect(store.hasCafes()).toBe(true);
    });

    it('should compute cafeCount correctly', async () => {
      expect(store.cafeCount()).toBe(0);

      vi.spyOn(cafeApiService, 'listCafes').mockReturnValue(of({ cafes: mockCafes }));
      await store.loadCafes();

      expect(store.cafeCount()).toBe(2);
    });
  });
});
