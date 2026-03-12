import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { ThemeService } from '../../services/theme.service';
import { WINDOW } from '@smartcafe/admin/shared/utils';
import { createMockWindow } from '../../../test-setup';

describe('ThemeSwitcherComponent', () => {
  let component: ThemeSwitcherComponent;
  let fixture: ComponentFixture<ThemeSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeSwitcherComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ThemeService,
        { provide: WINDOW, useValue: createMockWindow() }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute label for switching to dark when theme is light', () => {
    expect(component.label()).toBe('app.theme.switchToDark');
  });

  it('should compute label for switching to light when theme is dark', () => {
    component.toggleTheme();
    expect(component.label()).toBe('app.theme.switchToLight');
  });
});
