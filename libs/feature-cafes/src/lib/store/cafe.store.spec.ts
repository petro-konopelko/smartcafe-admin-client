import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CafeStore } from './cafe.store';
import { CafeApiService } from '../services/cafe-api.service';
import { CafeDto, CreateCafeRequest, ListCafesResponse } from '../models';

describe('CafeStore', () => {
  let store: InstanceType<typeof CafeStore>;
  let cafeApiServiceMock: {
    listCafes: ReturnType<typeof vi.fn>;
    getCafe: ReturnType<typeof vi.fn>;
    createCafe: ReturnType<typeof vi.fn>;
    deleteCafe: ReturnType<typeof vi.fn>;
  };

  const mockCafe: CafeDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Cafe',
    contactInfo: 'test@cafe.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null
  };

  const mockCafes: CafeDto[] = [
    mockCafe,
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Test Cafe 2',
      contactInfo: 'test2@cafe.com',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: null
    }
  ];

  beforeEach(() => {
    cafeApiServiceMock = {
      listCafes: vi.fn(),
      getCafe: vi.fn(),
      createCafe: vi.fn(),
      deleteCafe: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CafeStore,
        {
          provide: CafeApiService,
          useValue: cafeApiServiceMock
        }
      ]
    });

    store = TestBed.inject(CafeStore);
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
      cafeApiServiceMock.listCafes.mockReturnValue(of(response));

      await store.loadCafes();

      expect(store.cafes()).toEqual(mockCafes);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should call listCafes during load', async () => {
      cafeApiServiceMock.listCafes.mockReturnValue(of({ cafes: [] }));

      await store.loadCafes();

      expect(cafeApiServiceMock.listCafes).toHaveBeenCalledTimes(1);
    });

    it('should handle error when loading fails', async () => {
      const error = new Error('API Error');
      cafeApiServiceMock.listCafes.mockReturnValue(throwError(() => error));

      await store.loadCafes();

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('API Error');
    });
  });

  describe('selectCafe', () => {
    it('should select cafe successfully', async () => {
      cafeApiServiceMock.getCafe.mockReturnValue(of(mockCafe));

      await store.selectCafe(mockCafe.id);

      expect(store.selectedCafe()).toEqual(mockCafe);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle error when selecting fails', async () => {
      const error = new Error('Not found');
      cafeApiServiceMock.getCafe.mockReturnValue(throwError(() => error));

      await store.selectCafe(mockCafe.id);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Not found');
    });
  });

  describe('createCafe', () => {
    it('should create cafe successfully', async () => {
      const request: CreateCafeRequest = {
        name: 'New Cafe',
        contactInfo: 'new@cafe.com'
      };
      const newCafeId = '323e4567-e89b-12d3-a456-426614174002';
      const newCafe: CafeDto = {
        ...request,
        id: newCafeId,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: null
      };

      cafeApiServiceMock.createCafe.mockReturnValue(of({ cafeId: newCafeId }));
      cafeApiServiceMock.listCafes.mockReturnValue(of({ cafes: [newCafe] }));

      const result = await store.createCafe(request);

      expect(result).toBe(newCafeId);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should add created cafe to list', async () => {
      const request: CreateCafeRequest = {
        name: 'New Cafe',
        contactInfo: 'new@cafe.com'
      };
      const newCafeId = '323e4567-e89b-12d3-a456-426614174002';
      const newCafe: CafeDto = {
        ...request,
        id: newCafeId,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: null
      };

      cafeApiServiceMock.listCafes.mockReturnValueOnce(of({ cafes: mockCafes }));
      await store.loadCafes();

      cafeApiServiceMock.createCafe.mockReturnValue(of({ cafeId: newCafeId }));
      cafeApiServiceMock.listCafes.mockReturnValueOnce(of({ cafes: [...mockCafes, newCafe] }));

      await store.createCafe(request);

      expect(store.cafes().length).toBe(3);
      expect(store.cafes()).toContainEqual(newCafe);
    });

    it('should handle error when creation fails', async () => {
      const request: CreateCafeRequest = {
        name: 'Test',
        contactInfo: 'test@test.com'
      };
      const error = new Error('Creation failed');
      cafeApiServiceMock.createCafe.mockReturnValue(throwError(() => error));

      const result = await store.createCafe(request);

      expect(result).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Creation failed');
    });
  });

  describe('deleteCafe', () => {
    it('should delete cafe successfully', async () => {
      cafeApiServiceMock.listCafes.mockReturnValue(of({ cafes: mockCafes }));
      await store.loadCafes();

      cafeApiServiceMock.deleteCafe.mockReturnValue(of(void 0));

      const result = await store.deleteCafe(mockCafes[0].id);

      expect(result).toBe(true);
      expect(store.cafes().length).toBe(1);
      expect(store.cafes()).not.toContainEqual(mockCafes[0]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      cafeApiServiceMock.deleteCafe.mockReturnValue(throwError(() => error));

      const result = await store.deleteCafe(mockCafe.id);

      expect(result).toBe(false);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Deletion failed');
    });
  });

  describe('computed selectors', () => {
    it('should compute hasCafes correctly', async () => {
      expect(store.hasCafes()).toBe(false);

      cafeApiServiceMock.listCafes.mockReturnValue(of({ cafes: mockCafes }));
      await store.loadCafes();

      expect(store.hasCafes()).toBe(true);
    });

    it('should compute cafeCount correctly', async () => {
      expect(store.cafeCount()).toBe(0);

      cafeApiServiceMock.listCafes.mockReturnValue(of({ cafes: mockCafes }));
      await store.loadCafes();

      expect(store.cafeCount()).toBe(2);
    });
  });
});
