import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@smartcafe/admin/shared/data-access';
import {
  CafeDto,
  CreateCafeRequest,
  CreateCafeResponse,
  ListCafesResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CafeApiService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private readonly baseUrl = `${this.apiUrl}/cafes`;

  listCafes(): Observable<ListCafesResponse> {
    return this.http.get<ListCafesResponse>(this.baseUrl);
  }

  getCafe(cafeId: string): Observable<CafeDto> {
    return this.http.get<CafeDto>(`${this.baseUrl}/${cafeId}`);
  }

  createCafe(request: CreateCafeRequest): Observable<CreateCafeResponse> {
    return this.http.post<CreateCafeResponse>(this.baseUrl, request);
  }

  deleteCafe(cafeId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${cafeId}`);
  }
}
