import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MenuApiService } from './menu-api.service';
import { API_URL } from '@smartcafe/admin/shared/data-access';
import { CreateMenuRequest, MenuDto, MenuState, PriceUnit } from '../models';

const TEST_API_URL = 'http://localhost:5000/api';
const TEST_CAFE_ID = 'cafe-123';
const TEST_MENU_ID = 'menu-456';

const mockMenuDto: MenuDto = {
  id: TEST_MENU_ID,
  name: 'Test Menu',
  state: MenuState.New,
  sections: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const mockCreateRequest: CreateMenuRequest = {
  name: 'New Menu',
  sections: [
    {
      name: 'Main Course',
      availableFrom: null,
      availableTo: null,
      items: [
        {
          name: 'Pizza',
          description: 'Classic pizza',
          price: { amount: 12.5, unit: PriceUnit.PerItem, discountPercent: 0 },
          image: null,
          ingredients: [{ name: 'Cheese', isExcludable: true }]
        }
      ]
    }
  ]
};

describe('MenuApiService', () => {
  let service: MenuApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: TEST_API_URL }
      ]
    });

    service = TestBed.inject(MenuApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listMenus', () => {
    it('should fetch menus for a cafe', () => {
      const mockResponse = {
        menus: [{ menuId: TEST_MENU_ID, name: 'Test', state: MenuState.New, createdAt: '' }]
      };

      service.listMenus(TEST_CAFE_ID).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMenu', () => {
    it('should fetch a single menu', () => {
      service.getMenu(TEST_CAFE_ID, TEST_MENU_ID).subscribe((response) => {
        expect(response).toEqual(mockMenuDto);
      });

      const req = httpMock.expectOne(`${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus/${TEST_MENU_ID}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMenuDto);
    });
  });

  describe('getActiveMenu', () => {
    it('should fetch the active menu', () => {
      service.getActiveMenu(TEST_CAFE_ID).subscribe((response) => {
        expect(response).toEqual(mockMenuDto);
      });

      const req = httpMock.expectOne(`${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus/active`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMenuDto);
    });
  });

  describe('createMenu', () => {
    it('should create a menu with correct payload', () => {
      const mockResponse = { menuId: 'new-menu-id' };

      service.createMenu(TEST_CAFE_ID, mockCreateRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateRequest);
      req.flush(mockResponse);
    });
  });

  describe('updateMenu', () => {
    it('should update a menu with PUT', () => {
      service.updateMenu(TEST_CAFE_ID, TEST_MENU_ID, mockCreateRequest).subscribe();

      const req = httpMock.expectOne(`${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus/${TEST_MENU_ID}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockCreateRequest);
      req.flush(null);
    });
  });

  describe('deleteMenu', () => {
    it('should delete a menu', () => {
      service.deleteMenu(TEST_CAFE_ID, TEST_MENU_ID).subscribe();

      const req = httpMock.expectOne(`${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus/${TEST_MENU_ID}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('cloneMenu', () => {
    it('should clone a menu with new name', () => {
      const cloneRequest = { newName: 'Cloned Menu' };
      const mockResponse = { menuId: 'cloned-id' };

      service.cloneMenu(TEST_CAFE_ID, TEST_MENU_ID, cloneRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus/${TEST_MENU_ID}/clone`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(cloneRequest);
      req.flush(mockResponse);
    });
  });

  describe('publishMenu', () => {
    it('should publish a menu', () => {
      const mockResponse = { menuId: TEST_MENU_ID };

      service.publishMenu(TEST_CAFE_ID, TEST_MENU_ID).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus/${TEST_MENU_ID}/publish`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('activateMenu', () => {
    it('should activate a menu', () => {
      service.activateMenu(TEST_CAFE_ID, TEST_MENU_ID).subscribe();

      const req = httpMock.expectOne(
        `${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus/${TEST_MENU_ID}/activate`
      );
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('uploadImage', () => {
    it('should upload an image as FormData', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const mockResponse = { imageId: 'img-123', url: 'http://example.com/img.png' };

      service.uploadImage(file).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${TEST_API_URL}/images/upload`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate HTTP errors', () => {
      service.listMenus(TEST_CAFE_ID).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${TEST_API_URL}/cafes/${TEST_CAFE_ID}/menus`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
