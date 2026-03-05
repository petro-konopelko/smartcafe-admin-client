import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { CafePageComponent } from './cafe-page.component';
import { CafeStore } from '../../store/cafe.store';

describe('CafePageComponent', () => {
  let component: CafePageComponent;
  let fixture: ComponentFixture<CafePageComponent>;
  let mockCafeStore: {
    cafes: ReturnType<typeof signal<unknown[]>>;
    selectedCafe: ReturnType<typeof signal<unknown | null>>;
    loading: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string | null>>;
    hasCafes: ReturnType<typeof signal<boolean>>;
    loadCafes: ReturnType<typeof vi.fn>;
    deleteCafe: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockCafeStore = {
      cafes: signal([]),
      selectedCafe: signal(null),
      loading: signal(false),
      error: signal(null),
      hasCafes: signal(false),
      loadCafes: vi.fn(),
      deleteCafe: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CafePageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: CafeStore, useValue: mockCafeStore },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CafePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cafes on init', () => {
    expect(mockCafeStore.loadCafes).toHaveBeenCalledTimes(1);
  });
});
