import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CafeApiService } from './cafe-api.service';
import { CreateCafeRequest, CafeDto, ListCafesResponse } from '../models';

describe('CafeApiService', () => {
  let service: CafeApiService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/cafes';

  const mockCafe: CafeDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Cafe',
    contactInfo: 'test@cafe.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CafeApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CafeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('listCafes', () => {
    it('should fetch all cafes', async () => {
      const mockResponse: ListCafesResponse = {
        cafes: [mockCafe],
      };

      const result = await new Promise<ListCafesResponse>((resolve) => {
        service.listCafes().subscribe(resolve);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
      expect(result.cafes.length).toBe(1);
    });

    it('should handle error when API call fails', async () => {
      const promise = new Promise<void>((resolve, reject) => {
        service.listCafes().subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            expect(error.status).toBe(500);
            resolve();
          },
        });
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await promise;
    });
  });

  describe('getCafe', () => {
    it('should fetch cafe by id', async () => {
      const cafeId = mockCafe.id;

      const result = await new Promise<CafeDto>((resolve) => {
        service.getCafe(cafeId).subscribe(resolve);
      });

      const req = httpMock.expectOne(`${baseUrl}/${cafeId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCafe);

      expect(result).toEqual(mockCafe);
      expect(result.id).toBe(cafeId);
    });

    it('should handle error when API call fails', async () => {
      const cafeId = 'non-existent-id';

      const promise = new Promise<void>((resolve, reject) => {
        service.getCafe(cafeId).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            expect(error.status).toBe(404);
            resolve();
          },
        });
      });

      const req = httpMock.expectOne(`${baseUrl}/${cafeId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      await promise;
    });
  });

  describe('createCafe', () => {
    it('should create a cafe', async () => {
      const request: CreateCafeRequest = {
        name: 'New Cafe',
        contactInfo: 'new@cafe.com',
      };
      const mockResponse = { cafeId: '123e4567-e89b-12d3-a456-426614174001' };

      const result = await new Promise<{ cafeId: string }>((resolve) => {
        service.createCafe(request).subscribe(resolve);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('should handle validation error', async () => {
      const request: CreateCafeRequest = {
        name: '',
        contactInfo: 'test@cafe.com',
      };

      const promise = new Promise<void>((resolve, reject) => {
        service.createCafe(request).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            expect(error.status).toBe(400);
            resolve();
          },
        });
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Invalid request', { status: 400, statusText: 'Bad Request' });

      await promise;
    });
  });

  describe('deleteCafe', () => {
    it('should delete a cafe', async () => {
      const cafeId = mockCafe.id;

      const result = await new Promise<void>((resolve) => {
        service.deleteCafe(cafeId).subscribe(() => resolve());
      });

      const req = httpMock.expectOne(`${baseUrl}/${cafeId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(result).toBeUndefined();
    });

    it('should handle error when deletion fails', async () => {
      const cafeId = mockCafe.id;

      const promise = new Promise<void>((resolve, reject) => {
        service.deleteCafe(cafeId).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            expect(error.status).toBe(500);
            resolve();
          },
        });
      });

      const req = httpMock.expectOne(`${baseUrl}/${cafeId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await promise;
    });
  });
});
