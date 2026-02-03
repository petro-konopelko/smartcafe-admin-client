import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CafeListComponent } from './cafe-list.component';
import { CafeStore } from '../../store/cafe.store';

describe('CafeListComponent', () => {
  let component: CafeListComponent;
  let fixture: ComponentFixture<CafeListComponent>;
  let cafeStore: InstanceType<typeof CafeStore>;

  beforeEach(async () => {
    const mockRouter = {
      navigate: vi.fn(),
    };

    const mockDialog = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CafeListComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CafeStore,
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CafeListComponent);
    component = fixture.componentInstance;
    cafeStore = TestBed.inject(CafeStore);
    
    // Mock loadCafes to prevent actual API calls
    vi.spyOn(cafeStore, 'loadCafes').mockResolvedValue();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cafes on initialization', () => {
    expect(cafeStore.loadCafes).toHaveBeenCalled();
  });
});
