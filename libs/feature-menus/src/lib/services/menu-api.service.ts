import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@smartcafe/admin/shared/data-access';
import {
  MenuDto,
  CreateMenuRequest,
  CreateMenuResponse,
  ListMenusResponse,
  CloneMenuRequest,
  PublishMenuResponse,
  UpdateMenuRequest,
  UploadImageResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class MenuApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private menuUrl(cafeId: string, menuId?: string): string {
    const base = `${this.apiUrl}/cafes/${cafeId}/menus`;
    return menuId ? `${base}/${menuId}` : base;
  }

  listMenus(cafeId: string): Observable<ListMenusResponse> {
    return this.http.get<ListMenusResponse>(this.menuUrl(cafeId));
  }

  getMenu(cafeId: string, menuId: string): Observable<MenuDto> {
    return this.http.get<MenuDto>(this.menuUrl(cafeId, menuId));
  }

  getActiveMenu(cafeId: string): Observable<MenuDto> {
    return this.http.get<MenuDto>(`${this.menuUrl(cafeId)}/active`);
  }

  createMenu(cafeId: string, request: CreateMenuRequest): Observable<CreateMenuResponse> {
    return this.http.post<CreateMenuResponse>(this.menuUrl(cafeId), request);
  }

  updateMenu(cafeId: string, menuId: string, request: UpdateMenuRequest): Observable<void> {
    return this.http.put<void>(this.menuUrl(cafeId, menuId), request);
  }

  deleteMenu(cafeId: string, menuId: string): Observable<void> {
    return this.http.delete<void>(this.menuUrl(cafeId, menuId));
  }

  cloneMenu(
    cafeId: string,
    menuId: string,
    request: CloneMenuRequest
  ): Observable<CreateMenuResponse> {
    return this.http.post<CreateMenuResponse>(`${this.menuUrl(cafeId, menuId)}/clone`, request);
  }

  publishMenu(cafeId: string, menuId: string): Observable<PublishMenuResponse> {
    return this.http.post<PublishMenuResponse>(`${this.menuUrl(cafeId, menuId)}/publish`, {});
  }

  activateMenu(cafeId: string, menuId: string): Observable<void> {
    return this.http.post<void>(`${this.menuUrl(cafeId, menuId)}/activate`, {});
  }

  uploadImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadImageResponse>(`${this.apiUrl}/images/upload`, formData);
  }
}
