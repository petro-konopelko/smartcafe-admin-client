import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CafePageComponent } from './cafe-page.component';
import { CafeStore } from '../../store/cafe.store';

describe('CafePageComponent', () => {
  let component: CafePageComponent;
  let fixture: ComponentFixture<CafePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafePageComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CafeStore,
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CafePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
