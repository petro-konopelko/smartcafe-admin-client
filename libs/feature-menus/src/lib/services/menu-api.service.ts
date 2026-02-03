import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@smartcafe/admin/shared/data-access';
import {
  MenuDto,
  CreateMenuRequest,
  UpdateMenuRequest,
  CreateMenuResponse,
  ListMenusResponse,
  CloneMenuRequest,
  PublishMenuResponse,
  UploadImageResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class MenuApiService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly baseUrl = this.apiUrl;

  listMenus(cafeId: string): Observable<ListMenusResponse> {
    return this.http.get<ListMenusResponse>(`${this.baseUrl}/cafes/${cafeId}/menus`);
  }

  getMenu(cafeId: string, menuId: string): Observable<MenuDto> {
    return this.http.get<MenuDto>(`${this.baseUrl}/cafes/${cafeId}/menus/${menuId}`);
  }

  getActiveMenu(cafeId: string): Observable<MenuDto> {
    return this.http.get<MenuDto>(`${this.baseUrl}/cafes/${cafeId}/menus/active`);
  }

  createMenu(cafeId: string, request: CreateMenuRequest): Observable<CreateMenuResponse> {
    return this.http.post<CreateMenuResponse>(`${this.baseUrl}/cafes/${cafeId}/menus`, request);
  }

  updateMenu(cafeId: string, menuId: string, request: UpdateMenuRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/cafes/${cafeId}/menus/${menuId}`, request);
  }

  deleteMenu(cafeId: string, menuId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cafes/${cafeId}/menus/${menuId}`);
  }

  cloneMenu(
    cafeId: string,
    menuId: string,
    request: CloneMenuRequest,
  ): Observable<CreateMenuResponse> {
    return this.http.post<CreateMenuResponse>(
      `${this.baseUrl}/cafes/${cafeId}/menus/${menuId}/clone`,
      request,
    );
  }

  publishMenu(cafeId: string, menuId: string): Observable<PublishMenuResponse> {
    return this.http.post<PublishMenuResponse>(
      `${this.baseUrl}/cafes/${cafeId}/menus/${menuId}/publish`,
      {},
    );
  }

  activateMenu(cafeId: string, menuId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/cafes/${cafeId}/menus/${menuId}/activate`, {});
  }

  uploadImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadImageResponse>(`${this.baseUrl}/images/upload`, formData);
  }
}
