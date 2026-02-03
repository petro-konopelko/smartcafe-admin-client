# Angular Application - Development Best Practices

## Overview
These instructions define coding standards, best practices, and architectural patterns for modern Angular applications (Angular 20+). These guidelines ensure maintainability, performance, accessibility, and code quality across any Angular project.

---

## TypeScript & Angular Version Requirements

- **Angular Version**: 20+ (latest stable)
- **TypeScript**: Latest version compatible with Angular 20+
- **Node.js**: LTS version (20.x or later)

---

## TypeScript Best Practices

### Strict Typing
```typescript
// ✅ Good - Strict typing
function processMenu(menu: MenuDto): string {
  return menu.name;
}

// ❌ Bad - Using any
function processMenu(menu: any): any {
  return menu.name;
}

// ✅ Good - Use unknown when type is uncertain
function parseResponse(response: unknown): MenuDto {
  if (isMenuDto(response)) {
    return response;
  }
  throw new Error('Invalid response');
}
```

### Type Inference
```typescript
// ✅ Good - Let TypeScript infer obvious types
const cafeName = 'SmartCafe Downtown';
const menuItems = [item1, item2];

// ❌ Bad - Redundant type annotation
const cafeName: string = 'SmartCafe Downtown';
```

### Configuration
- Enable strict mode in `tsconfig.json`
- Use `"strict": true` and all strict flags
- Configure path aliases for clean imports

### Avoid Magic Values
```typescript
// ❌ Bad - Magic strings and numbers
if (user.role === 'admin') {
  setTimeout(() => refresh(), 3000);
}

// ✅ Good - Use constants
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

const REFRESH_DELAY_MS = 3000;

if (user.role === USER_ROLES.ADMIN) {
  setTimeout(() => refresh(), REFRESH_DELAY_MS);
}

// ✅ Good - Component configuration
@Component({
  selector: 'sc-cafe-card'
})
export class CafeCardComponent {
  private readonly MAX_RETRIES = 3;
  private readonly API_TIMEOUT_MS = 5000;
  
  readonly CARD_STATES = {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  } as const;
}
```

---

## Angular Best Practices

### Standalone Components (Angular 20+)

```typescript
// ✅ Good - Standalone component (default in Angular 20+)
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sc-cafe-card',
  imports: [CommonModule],
  templateUrl: './cafe-card.component.html',
  styleUrl: './cafe-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CafeCardComponent {}

// ❌ Bad - Do NOT set standalone: true (it's default)
@Component({
  standalone: true, // ❌ Remove this
  selector: 'sc-cafe-card',
  // ...
})
```

**Component Prefix Convention:**
- **Use consistent prefix** for all application components (e.g., `app-`, `company-`, or project-specific like `sc-` for SmartCafe)
- **Use same prefix** for directives and pipes
- **Example with `app-` prefix**: `app-user-card`, `app-data-list`, `appAutoFocus`, `appSafeHtml`
- **Example with custom prefix**: `sc-cafe-card`, `sc-menu-list`, `scAutoFocus`, `scSafeHtml` (SmartCafe project)
- Avoid generic `app-` for reusable libraries - use library-specific prefix

### Signals for State Management

```typescript
import { Component, signal, computed, input, output } from '@angular/core';

@Component({
  selector: 'sc-menu-item',
  // ...
})
export class MenuItemComponent {
  // ✅ Use input() function
  menuItem = input.required<MenuItemDto>();
  
  // ✅ Use output() function
  itemSelected = output<MenuItemDto>();
  
  // ✅ Use signal for local state
  isExpanded = signal(false);
  
  // ✅ Use computed for derived state
  displayPrice = computed(() => {
    const item = this.menuItem();
    return `${item.price.amount} ${item.price.unit}`;
  });
  
  // ✅ Use update or set, NOT mutate
  toggle() {
    this.isExpanded.update(value => !value);
  }
}

// ❌ Bad - Using decorators
@Input() menuItem!: MenuItemDto;
@Output() itemSelected = new EventEmitter<MenuItemDto>();
```

### Change Detection

```typescript
// ✅ Always use OnPush
@Component({
  selector: 'sc-menu-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class MenuListComponent {}
```

### Zoneless Change Detection (Recommended)

**Angular 20+ supports zoneless change detection for better performance and smaller bundle size.**

```typescript
// app.config.ts
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), // ✅ Zoneless mode
    // ... other providers
  ]
};
```

**Benefits:**
- **~30-40KB smaller bundle** (no Zone.js)
- **Better performance** (no monkey-patching)
- **More predictable** (explicit change detection)
- **Future-proof** (Angular's direction)

**Required Patterns for Zoneless:**

```typescript
// ✅ Use signals for all state (mandatory)
@Component({
  selector: 'sc-data-list',
  changeDetection: ChangeDetectionStrategy.OnPush // Still required
})
export class DataListComponent {
  // ✅ Signals work automatically
  items = signal<Item[]>([]);
  loading = signal(false);
  
  // ✅ Computed updates automatically
  itemCount = computed(() => this.items().length);
  
  // ✅ Event handlers trigger change detection automatically
  handleClick() {
    this.items.update(items => [...items, newItem]);
  }
  
  // ❌ Avoid: Async operations in components
  async loadData() {
    const data = await this.service.getData(); // ⚠️ Async logic should be in store
    this.data = data; // Wrong place for async operations
  }
  
  // ✅ Correct: Use store for async operations, component stays synchronous
  ngOnInit() {
    this.dataStore.loadData(); // No async/await in component!
  }
}
```

**What Works Automatically in Zoneless:**
- ✅ Signal updates (`set`, `update`)
- ✅ Event handlers (`(click)`, `(input)`, etc.)
- ✅ Async pipe
- ✅ Input changes

**What Requires Manual Handling:**
- ⚠️ `setTimeout`/`setInterval` callbacks → Use signals to update state
- ⚠️ Third-party callbacks → Wrap in signal updates
- ⚠️ HTTP without signals → Use `toSignal()` or update signals in `.subscribe()`

### View Encapsulation

```typescript
// ✅ Good - Use default (Emulated) or ShadowDom
@Component({
  selector: 'sc-menu-card',
  // encapsulation: ViewEncapsulation.Emulated (default, no need to specify)
  // ...
})
export class MenuCardComponent {}

// ❌ Bad - Avoid ViewEncapsulation.None
@Component({
  selector: 'sc-menu-card',
  encapsulation: ViewEncapsulation.None, // ❌ Leaks styles globally
  // ...
})
```

**Note:** Avoid `ViewEncapsulation.None` as it breaks style encapsulation and can cause global style pollution. Use the default `Emulated` encapsulation or `ShadowDom` when needed.

### Avoid Deprecated APIs

**Always use current Angular APIs. Never use deprecated methods or decorators:**

```typescript
// ✅ Good - Modern APIs
import { Component, input, output } from '@angular/core';

cafe = input.required<CafeDto>();
deleted = output<string>();

// ❌ Bad - Deprecated decorators
@Input() cafe!: CafeDto;
@Output() deleted = new EventEmitter<string>();

// ✅ Good - Modern control flow
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// ❌ Bad - Deprecated *ngFor
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>
```

**Check Angular deprecation guides** and update to modern equivalents immediately.

### Host Bindings

```typescript
// ✅ Good - Use host object
@Component({
  selector: 'sc-menu-card',
  host: {
    '[class.active]': 'isActive()',
    '(click)': 'handleClick($event)',
    'role': 'button',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class MenuCardComponent {
  isActive = signal(false);
  ariaLabel = signal('Menu card');
}

// ❌ Bad - Using decorators
@HostBinding('class.active') isActive = false;
@HostListener('click', ['$event']) handleClick(event: Event) {}
```

---

## Component Guidelines

### Single Responsibility
```typescript
// ✅ Good - Focused component
@Component({
  selector: 'sc-cafe-list-item',
  // ...
})
export class CafeListItemComponent {
  cafe = input.required<CafeDto>();
  selected = output<CafeDto>();
}

// ❌ Bad - Doing too much
@Component({
  selector: 'sc-cafe-manager',
  // Manages list, form, API calls, validation - too much!
})
```

### Template Size
```typescript
// ✅ Good - Inline template for small components
@Component({
  selector: 'sc-loading-spinner',
  template: `
    <div class="spinner" [class.small]="size() === 'small'">
      <mat-spinner [diameter]="diameter()"></mat-spinner>
    </div>
  `,
  styles: `
    .spinner {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `
})
export class LoadingSpinnerComponent {
  size = input<'small' | 'large'>('large');
  diameter = computed(() => this.size() === 'small' ? 24 : 48);
}

// ✅ For larger templates, use external file with relative path
@Component({
  selector: 'sc-menu-form',
  templateUrl: './menu-form.component.html',
  styleUrl: './menu-form.component.scss'
})
```

### Reactive Forms

```typescript
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
  selector: 'sc-cafe-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  // ...
})
export class CafeFormComponent {
  private fb = inject(FormBuilder);
  
  // ✅ Use Reactive Forms
  cafeForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    contactInfo: ['', [Validators.maxLength(200)]]
  });
  
  onSubmit() {
    if (this.cafeForm.valid) {
      const value = this.cafeForm.value as CreateCafeRequest;
      // ...
    }
  }
}

// ❌ Avoid Template-driven forms
```

---

## Templates

### Native Control Flow (Angular 20+)

```html
<!-- ✅ Good - Use @if, @for, @switch -->
@if (isLoading()) {
  <sc-loading-spinner />
} @else if (error()) {
  <sc-error-message [error]="error()" />
} @else {
  <div class="menu-list">
    @for (menu of menus(); track menu.id) {
      <sc-menu-card [menu]="menu" />
    }
  </div>
}

@switch (menuState()) {
  @case ('new') {
    <span class="badge new">New</span>
  }
  @case ('published') {
    <span class="badge published">Published</span>
  }
  @case ('active') {
    <span class="badge active">Active</span>
  }
}

<!-- ❌ Bad - Old structural directives -->
<div *ngIf="isLoading">...</div>
<div *ngFor="let menu of menus">...</div>
```

### Class and Style Bindings

```html
<!-- ✅ Good - Use class/style bindings -->
<div 
  [class.active]="isActive()"
  [class.disabled]="isDisabled()"
  [style.color]="textColor()"
  [style.font-size.px]="fontSize()">
</div>

<!-- ❌ Bad - Using ngClass/ngStyle -->
<div [ngClass]="{'active': isActive}"></div>
<div [ngStyle]="{'color': textColor}"></div>
```

### Keep Templates Simple

```html
<!-- ✅ Good - Simple logic, computation in component -->
<p>{{ displayPrice() }}</p>

<!-- ❌ Bad - Complex logic in template -->
<p>{{ item.price.amount * (1 - item.price.discount / 100) | currency }}</p>
```

### No Arrow Functions or Globals

```html
<!-- ❌ Bad - Arrow functions not supported -->
<button (click)="() => handleClick()">Click</button>

<!-- ❌ Bad - Assuming globals -->
<p>{{ new Date() }}</p>

<!-- ✅ Good - Use component methods/properties -->
<button (click)="handleClick()">Click</button>
<p>{{ currentDate() }}</p>
```

---

## Services

### Dependency Injection

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// ✅ Good - Use inject() function and providedIn
@Injectable({
  providedIn: 'root'
})
export class CafeService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_BASE_URL);
  
  getCafes() {
    return this.http.get<ListCafesResponse>(`${this.apiUrl}/cafes`);
  }
}

// ❌ Bad - Constructor injection
@Injectable()
export class CafeService {
  constructor(private http: HttpClient) {}
}
```

### Single Responsibility

```typescript
// ✅ Good - Focused service
@Injectable({ providedIn: 'root' })
export class CafeApiService {
  // Only handles Cafe API calls
}

@Injectable({ providedIn: 'root' })
export class CafeStateService {
  // Only handles Cafe state management
}

// ❌ Bad - Doing too much
@Injectable({ providedIn: 'root' })
export class CafeService {
  // API calls, state, validation, formatting - too much!
}
```

---

## State Management

### NgRx with Signals

**All async operations should stay in the store. Components just call store methods synchronously.**

```typescript
// Store
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface CafeState {
  cafes: CafeDto[];
  selectedCafe: CafeDto | null;
  loading: boolean;
  error: string | null;
}

export const CafeStore = signalStore(
  { providedIn: 'root' },
  withState<CafeState>({
    cafes: [],
    selectedCafe: null,
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    activeCafes: computed(() => 
      store.cafes().filter(cafe => !cafe.isDeleted)
    ),
    cafeCount: computed(() => store.cafes().length),
    hasError: computed(() => store.error() !== null)
  })),
  withMethods((store, cafeService = inject(CafeService)) => ({
    // ✅ Async operations in store, not in components
    async loadCafes() {
      patchState(store, { loading: true, error: null });
      try {
        const cafes = await firstValueFrom(cafeService.getCafes());
        patchState(store, { cafes, loading: false });
      } catch (error) {
        patchState(store, { 
          error: 'Failed to load cafes', 
          loading: false 
        });
      }
    },
    
    async createCafe(name: string, contactInfo: string) {
      patchState(store, { loading: true, error: null });
      try {
        const newCafe = await firstValueFrom(
          cafeService.createCafe({ name, contactInfo })
        );
        patchState(store, { 
          cafes: [...store.cafes(), newCafe],
          loading: false 
        });
      } catch (error) {
        patchState(store, { 
          error: 'Failed to create cafe', 
          loading: false 
        });
      }
    }
  }))
);
```

**Component Usage (No Async in Component):**

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CafeStore } from '../store/cafe.store';

@Component({
  selector: 'sc-cafe-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cafeStore.loading()) {
      <sc-loading-spinner />
    }
    
    @if (cafeStore.error()) {
      <sc-error-message [message]="cafeStore.error()" />
    }
    
    @for (cafe of cafeStore.cafes(); track cafe.id) {
      <sc-cafe-card [cafe]="cafe" />
    }
  `
})
export class CafeListComponent {
  cafeStore = inject(CafeStore);
  
  ngOnInit() {
    // ✅ Just call store method - no async/await in component!
    // Store handles async, updates signals, triggers UI updates automatically
    this.cafeStore.loadCafes();
  }
  
  onCreateCafe(name: string, contactInfo: string) {
    // ✅ Component stays synchronous
    this.cafeStore.createCafe(name, contactInfo);
  }
}
```

**Key Principles:**
- ✅ **All async operations in store** (HTTP calls, timers, etc.)
- ✅ **Components call store methods synchronously** (no async/await)
- ✅ **Store updates signals** (loading, data, error)
- ✅ **UI updates automatically** (signals trigger change detection)
- ❌ **Don't duplicate async logic** in components and store

### Pure State Transformations

```typescript
// ✅ Good - Pure function
const addCafe = (state: CafeState, cafe: CafeDto): CafeState => ({
  ...state,
  cafes: [...state.cafes, cafe]
});

// ❌ Bad - Mutating state
const addCafe = (state: CafeState, cafe: CafeDto): CafeState => {
  state.cafes.push(cafe); // Mutation!
  return state;
};
```

---

## Internationalization (i18n)

### Use Browser-Native Intl API

**Prefer browser-native `Intl` API over Angular pipes for formatting dates, numbers, and currency.**

**Benefits:**
- ✅ **Smaller bundle size** (no need to import locale data)
- ✅ **More flexible** (rich formatting options)
- ✅ **Native performance** (browser-optimized)
- ✅ **Future-proof** (standard web API)

```typescript
// ✅ Good - Custom pipe using Intl API
import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../services/locale.service';

@Pipe({
  name: 'scLocalDate',
  pure: false // Re-evaluate when locale changes
})
export class LocalDatePipe implements PipeTransform {
  private localeService = inject(LocaleService);
  
  transform(value: Date | string, options?: Intl.DateTimeFormatOptions): string {
    if (!value) return '';
    
    const date = value instanceof Date ? value : new Date(value);
    const locale = this.localeService.currentLocale();
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

// Usage in template
{{ orderDate | scLocalDate }}
{{ orderDate | scLocalDate:{ dateStyle: 'long' } }}
{{ orderDate | scLocalDate:{ year: 'numeric', month: 'short', day: 'numeric' } }}
```

```typescript
// ✅ Good - Currency formatting
@Pipe({
  name: 'scLocalCurrency',
  pure: false
})
export class LocalCurrencyPipe implements PipeTransform {
  private localeService = inject(LocaleService);
  
  transform(value: number, currency: string = 'USD'): string {
    if (value == null) return '';
    
    const locale = this.localeService.currentLocale();
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(value);
  }
}

// Usage
{{ price | scLocalCurrency:'UAH' }}
{{ price | scLocalCurrency:'EUR' }}
```

```typescript
// ✅ Good - Number formatting
@Pipe({
  name: 'scLocalNumber',
  pure: false
})
export class LocalNumberPipe implements PipeTransform {
  private localeService = inject(LocaleService);
  
  transform(value: number, options?: Intl.NumberFormatOptions): string {
    if (value == null) return '';
    
    const locale = this.localeService.currentLocale();
    
    return new Intl.NumberFormat(locale, options).format(value);
  }
}

// Usage
{{ count | scLocalNumber }}
{{ percentage | scLocalNumber:{ style: 'percent' } }}
{{ fileSize | scLocalNumber:{ style: 'unit', unit: 'megabyte' } }}
```

**Locale Service Pattern:**

```typescript
import { Injectable, signal } from '@angular/core';

type SupportedLocale = 'en-US' | 'uk-UA'; // BCP 47 standard

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly STORAGE_KEY = 'app-locale';
  private readonly DEFAULT_LOCALE: SupportedLocale = 'en-US';
  
  currentLocale = signal<SupportedLocale>(this.loadLocale());
  
  setLocale(locale: SupportedLocale): void {
    this.currentLocale.set(locale);
    localStorage.setItem(this.STORAGE_KEY, locale);
  }
  
  private loadLocale(): SupportedLocale {
    const stored = localStorage.getItem(this.STORAGE_KEY) as SupportedLocale;
    return stored || this.DEFAULT_LOCALE;
  }
}
```

**Text Translation:**

For translating text content, use a library like **ngx-translate** or **@angular/localize**.

```typescript
// ✅ ngx-translate for runtime language switching
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sc-greeting',
  imports: [TranslateModule],
  template: `
    <h1>{{ 'greeting.welcome' | translate }}</h1>
    <p>{{ 'greeting.message' | translate:{ name: userName() } }}</p>
  `
})
export class GreetingComponent {
  userName = signal('John');
}
```

**Best Practices:**
- ✅ Use **BCP 47 standard** locale codes (`en-US`, `uk-UA`, not `en`, `ua`)
- ✅ Store locale preference in localStorage
- ✅ Use signals for reactive locale changes
- ✅ Use Intl API for formatting (dates, numbers, currency)
- ✅ Use translation library for text content
- ❌ Don't use Angular's `registerLocaleData` (increases bundle size)
- ❌ Don't use Angular's DatePipe/CurrencyPipe for multi-locale apps

---

## Responsive Design

### Mobile-First Approach
**All components MUST be responsive and work seamlessly on mobile and desktop devices.**

```scss
// Use mobile-first media queries
.menu-grid {
  display: grid;
  grid-template-columns: 1fr; // Mobile: 1 column
  gap: 1rem;
  
  // Tablet: 2 columns
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // Desktop: 3 columns
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  // Large desktop: 4 columns
  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Breakpoints
```scss
// src/styles/_variables.scss
$breakpoints: (
  'mobile': 0,
  'tablet': 768px,
  'desktop': 1024px,
  'wide': 1440px
);
```

### Angular Material Breakpoints
```typescript
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, signal } from '@angular/core';

@Component({
  selector: 'sc-cafe-grid',
  // ...
})
export class CafeGridComponent {
  private breakpointObserver = inject(BreakpointObserver);
  
  isMobile = signal(false);
  isTablet = signal(false);
  
  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => this.isMobile.set(result.matches));
    
    this.breakpointObserver
      .observe([Breakpoints.Tablet])
      .subscribe(result => this.isTablet.set(result.matches));
  }
}
```

### Touch-Friendly Design
- Minimum tap target size: **44x44px** (WCAG 2.1 AA)
- Adequate spacing between interactive elements
- Swipe gestures for mobile navigation
- Pull-to-refresh for lists

### Responsive Images
```html
<!-- Use NgOptimizedImage with responsive sizes -->
<img 
  [ngSrc]="imageUrl()"
  [alt]="altText()"
  width="400"
  height="300"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw">
```

### Viewport Meta Tag
```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

---

## Accessibility (WCAG 2.1 AA)

### Requirements
- **MUST** pass all AXE checks
- **MUST** follow WCAG AA minimums
- Focus management for dialogs and navigation
- ARIA attributes for interactive elements
- Color contrast ratio minimum 4.5:1
- Keyboard navigation for all interactive elements

```html
<!-- ✅ Good - Accessible button -->
<button 
  type="button"
  [attr.aria-label]="'Delete ' + cafe().name"
  [attr.aria-disabled]="isDeleting()"
  (click)="onDelete()">
  <mat-icon aria-hidden="true">delete</mat-icon>
  <span class="visually-hidden">Delete cafe</span>
</button>

<!-- ✅ Good - Accessible form -->
<mat-form-field>
  <mat-label for="cafe-name">Cafe Name</mat-label>
  <input 
    matInput 
    id="cafe-name"
    formControlName="name"
    [attr.aria-required]="true"
    [attr.aria-invalid]="nameControl.invalid && nameControl.touched">
  @if (nameControl.hasError('required')) {
    <mat-error id="name-error" role="alert">
      Cafe name is required
    </mat-error>
  }
</mat-form-field>
```

### Focus Management

```typescript
import { inject, effect, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'sc-cafe-dialog',
  // ...
})
export class CafeDialogComponent {
  private firstFocusableElement = viewChild<ElementRef>('firstInput');
  
  constructor() {
    effect(() => {
      // Focus first input when dialog opens
      this.firstFocusableElement()?.nativeElement.focus();
    });
  }
}
```

---

## Performance Optimization

### OnPush Change Detection
```typescript
// ✅ Always use OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### TrackBy Functions
```typescript
@Component({
  selector: 'sc-menu-list',
  template: `
    @for (menu of menus(); track trackByMenuId($index, menu)) {
      <sc-menu-card [menu]="menu" />
    }
  `
})
export class MenuListComponent {
  menus = input.required<MenuDto[]>();
  
  trackByMenuId(index: number, menu: MenuDto): string {
    return menu.id;
  }
}
```

### Virtual Scrolling
```typescript
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'sc-cafe-grid',
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport [itemSize]="120" class="cafe-list">
      @for (cafe of cafes(); track cafe.id) {
        <sc-cafe-card [cafe]="cafe" />
      }
    </cdk-virtual-scroll-viewport>
  `
})
export class CafeGridComponent {}
```

### Image Optimization
```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'sc-menu-item-image',
  imports: [NgOptimizedImage],
  template: `
    <img 
      [ngSrc]="imageUrl()"
      [alt]="altText()"
      width="400"
      height="300"
      priority="false">
  `
})
export class MenuItemImageComponent {
  imageUrl = input.required<string>();
  altText = input.required<string>();
}
```

---

## Testing Requirements

### Testing Mandate
**ALL application functionality MUST be covered with comprehensive tests:**
- ✅ **Unit Tests**: Components, services, pipes, directives, validators
- ✅ **Integration Tests**: Feature workflows, store interactions, API integration
- ✅ **Minimum Coverage**: 80% code coverage
- ✅ **Test Framework**: Vitest for unit and integration tests
- ✅ **E2E Tests**: Playwright for end-to-end scenarios

### Test File Organization

**Co-locate test files with source files (mandatory):**

```
libs/feature-cafes/src/lib/
├── cafe-card/
│   ├── cafe-card.component.ts
│   ├── cafe-card.component.html
│   ├── cafe-card.component.scss
│   └── cafe-card.component.spec.ts      ← Test file next to component
├── services/
│   ├── cafe-api.service.ts
│   └── cafe-api.service.spec.ts          ← Test file next to service
└── store/
    ├── cafe.store.ts
    └── cafe.store.spec.ts                ← Test file next to store
```

**Naming Convention:**
- Unit tests: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`
- Test helpers: `*.mock.ts` or `*.fake.ts`

### What to Test

#### Components
```typescript
// Test all aspects:
- Component creation
- Input/output bindings
- Computed values
- Signal updates
- User interactions
- Conditional rendering
- Accessibility (ARIA attributes)
- Responsive behavior
```

#### Services
```typescript
// Test all methods:
- API calls (HTTP methods, URLs, payloads)
- Error handling
- State management
- Side effects
```

#### Stores (NgRx Signals)
```typescript
// Test state management:
- Initial state
- State updates (methods)
- Computed selectors
- Side effects
```

#### Forms
```typescript
// Test validation:
- Required fields
- Field validators (maxLength, pattern, custom)
- Form validity
- Error messages
- Submit behavior
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.config.ts',
        '**/main.ts',
        '**/*.routes.ts'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
```

### Testing with Zoneless Change Detection

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { DataComponent } from './data.component';

describe('DataComponent (Zoneless)', () => {
  let component: DataComponent;
  let fixture: ComponentFixture<DataComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataComponent],
      providers: [
        provideExperimentalZonelessChangeDetection() // ✅ Zoneless in tests
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(DataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should update UI when signal changes', () => {
    component.count.set(5);
    fixture.detectChanges(); // ✅ Manual change detection in tests
    
    const element = fixture.nativeElement.querySelector('[data-testid="count"]');
    expect(element?.textContent).toBe('5');
  });
});
```

### Unit Test Examples

#### Component Test
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CafeCardComponent } from './cafe-card.component';
import { CafeDto } from '../../../shared/models/api.models';

describe('CafeCardComponent', () => {
  let component: CafeCardComponent;
  let fixture: ComponentFixture<CafeCardComponent>;
  
  const mockCafe: CafeDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Cafe',
    contactInfo: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null
  };
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeCardComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CafeCardComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('cafe', mockCafe);
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should display cafe name', () => {
    const compiled = fixture.nativeElement;
    const nameElement = compiled.querySelector('[data-testid="cafe-name"]');
    expect(nameElement?.textContent).toBe(mockCafe.name);
  });
  
  it('should emit edit event when edit button clicked', () => {
    const editSpy = vi.fn();
    component.edit.subscribe(editSpy);
    
    const editButton = fixture.nativeElement.querySelector('[data-testid="edit-button"]');
    editButton.click();
    
    expect(editSpy).toHaveBeenCalledWith(mockCafe);
  });
  
  it('should have correct ARIA labels', () => {
    const deleteButton = fixture.nativeElement.querySelector('[data-testid="delete-button"]');
    expect(deleteButton.getAttribute('aria-label')).toBe(`Delete ${mockCafe.name}`);
  });
});
```

#### Service Test
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CafeApiService } from './cafe-api.service';
import { CreateCafeRequest, CafeDto } from '../../../shared/models/api.models';

describe('CafeApiService', () => {
  let service: CafeApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5000/api/cafes';
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CafeApiService]
    });
    
    service = TestBed.inject(CafeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it.each([
    {
      method: 'GET',
      description: 'fetch all cafes',
      serviceMethod: 'getCafes',
      requestBody: undefined,
      mockResponse: { cafes: [mockCafe] }
    },
    {
      method: 'POST',
      description: 'create a cafe',
      serviceMethod: 'createCafe',
      requestBody: { name: 'New Cafe', contactInfo: 'contact@cafe.com' },
      mockResponse: { cafeId: '123' }
    }
  ])('should $description when API call succeeds', ({ method, serviceMethod, requestBody, mockResponse }, done) => {
    const args = requestBody ? [requestBody] : [];
    service[serviceMethod](...args).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });
    
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe(method);
    if (requestBody) {
      expect(req.request.body).toEqual(requestBody);
    }
    req.flush(mockResponse);
  });
  
  it('should handle error when API call fails', (done) => {
    service.getCafes().subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
        done();
      }
    });
    
    const req = httpMock.expectOne(baseUrl);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

#### Store Test
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CafeStore } from './cafe.store';
import { CafeApiService } from '../services/cafe-api.service';

describe('CafeStore', () => {
  let store: InstanceType<typeof CafeStore>;
  let cafeApiService: CafeApiService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CafeStore,
        {
          provide: CafeApiService,
          useValue: {
            getCafes: vi.fn(),
            createCafe: vi.fn(),
            deleteCafe: vi.fn()
          }
        }
      ]
    });
    
    store = TestBed.inject(CafeStore);
    cafeApiService = TestBed.inject(CafeApiService);
  });
  
  it('should have initial state when store is created', () => {
    expect(store.cafes()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
  
  it.each([
    {
      scenario: 'load cafes successfully when API returns data',
      mockReturn: () => of({ cafes: [mockCafe] }),
      expectedCafes: [mockCafe],
      expectedError: null
    },
    {
      scenario: 'set error state when API call fails',
      mockReturn: () => throwError(() => new Error('API Error')),
      expectedCafes: [],
      expectedError: 'Failed to load cafes'
    }
  ])('should $scenario', async ({ mockReturn, expectedCafes, expectedError }) => {
    vi.mocked(cafeApiService.getCafes).mockReturnValue(mockReturn());
    
    await store.loadCafes();
    
    expect(store.cafes()).toEqual(expectedCafes);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe(expectedError);
  });
  
  it('should compute active cafes correctly', async () => {
    const mockCafes = [mockCafe, { ...mockCafe, id: '456', name: 'Cafe 2' }];
    vi.mocked(cafeApiService.getCafes).mockReturnValue(of({ cafes: mockCafes }));
    
    await store.loadCafes();
    
    expect(store.activeCafes()).toHaveLength(2);
    expect(store.cafeCount()).toBe(2);
  });
});
```

#### Form Validation Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CafeFormComponent } from './cafe-form.component';

describe('CafeFormComponent', () => {
  let component: CafeFormComponent;
  let fixture: ComponentFixture<CafeFormComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeFormComponent, ReactiveFormsModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CafeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it.each([
    { value: '', error: 'required', description: 'empty' },
    { value: 'a'.repeat(101), error: 'maxlength', description: 'exceeds max length' }
  ])('should mark name as invalid when $description', ({ value, error }) => {
    const nameControl = component.cafeForm.get('name');
    nameControl?.setValue(value);
    if (error === 'required') nameControl?.markAsTouched();
    
    expect(nameControl?.invalid).toBe(true);
    expect(nameControl?.hasError(error)).toBe(true);
  });
  
  it('should mark form as valid when all fields have valid data', () => {
    component.cafeForm.patchValue({
      name: 'Valid Cafe Name',
      contactInfo: 'contact@cafe.com'
    });
    
    expect(component.cafeForm.valid).toBe(true);
  });
  
  it('should emit submit event when form is valid and submitted', () => {
    const submitSpy = vi.fn();
    component.formSubmit.subscribe(submitSpy);
    
    component.cafeForm.patchValue({
      name: 'Test Cafe',
      contactInfo: 'test@cafe.com'
    });
    
    component.onSubmit();
    
    expect(submitSpy).toHaveBeenCalledWith({
      name: 'Test Cafe',
      contactInfo: 'test@cafe.com'
    });
  });
});
```

### Integration Test Examples

#### Feature Workflow Test
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CafeGridPageComponent } from './cafe-grid-page.component';
import { CafeStore } from '../../store/cafe.store';
import { CafeApiService } from '../../services/cafe-api.service';

describe('Cafe Creation Workflow (Integration)', () => {
  let fixture: ComponentFixture<CafeGridPageComponent>;
  let store: InstanceType<typeof CafeStore>;
  let cafeApiService: CafeApiService;
  let router: Router;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeGridPageComponent],
      providers: [
        CafeStore,
        {
          provide: CafeApiService,
          useValue: {
            getCafes: vi.fn().mockReturnValue(of({ cafes: [] })),
            createCafe: vi.fn()
          }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() }
        }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CafeGridPageComponent);
    store = TestBed.inject(CafeStore);
    cafeApiService = TestBed.inject(CafeApiService);
    router = TestBed.inject(Router);
    
    fixture.detectChanges();
  });
  
  it('should complete full cafe creation workflow', async () => {
    // 1. Initial state - no cafes
    expect(store.cafes()).toEqual([]);
    
    // 2. User creates a cafe
    const cafeId = '123';
    const newCafe = { name: 'New Cafe', contactInfo: 'new@cafe.com' };
    const createdCafe = { ...newCafe, id: cafeId, createdAt: new Date().toISOString(), updatedAt: null };
    
    vi.mocked(cafeApiService.createCafe).mockReturnValue(of({ cafeId }));
    vi.mocked(cafeApiService.getCafes).mockReturnValue(of({ cafes: [createdCafe] }));
    
    await store.createCafe(newCafe.name, newCafe.contactInfo);
    
    // 3. Cafe appears in list
    expect(store.cafes()).toHaveLength(1);
    expect(store.cafes()[0].name).toBe(newCafe.name);
    
    // 4. Navigate to cafe menus
    const expectedRoute = ['/cafes', cafeId, 'menus'];
    await router.navigate(expectedRoute);
    expect(router.navigate).toHaveBeenCalledWith(expectedRoute);
  });
});
```

### Test Helpers and Mocks

```typescript
// src/app/testing/mocks/cafe.mocks.ts
export const mockCafe: CafeDto = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Cafe',
  contactInfo: 'test@cafe.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: null
};

export const mockMenu: MenuDto = {
  id: '987e4567-e89b-12d3-a456-426614174000',
  name: 'Test Menu',
  state: MenuState.New,
  sections: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

// Mock factory functions
export function createMockCafe(overrides?: Partial<CafeDto>): CafeDto {
  return { ...mockCafe, ...overrides };
}
```

### Test Data Attributes

```html
<!-- Use data-testid for reliable element selection -->
<div class="cafe-card" [attr.data-testid]="'cafe-card-' + cafe().id">
  <h2 data-testid="cafe-name">{{ cafe().name }}</h2>
  <button data-testid="edit-button" (click)="onEdit()">Edit</button>
  <button data-testid="delete-button" (click)="onDelete()">Delete</button>
</div>
```

### Coverage Requirements

**Minimum Coverage Thresholds:**
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

**Run coverage report:**
```bash
npm run test:coverage
```

### Playwright E2E Testing

**Setup Playwright:**

```typescript
// apps/admin-e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI
  }
});
```

**E2E Test Example:**

```typescript
// apps/admin-e2e/src/cafe-management.e2e-spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cafe Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display cafe list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cafes' })).toBeVisible();
    await expect(page.getByTestId('cafe-card')).toHaveCount(3);
  });

  test('should create new cafe', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Cafe' }).click();
    await page.getByLabel('Cafe Name').fill('New Cafe');
    await page.getByLabel('Contact Info').fill('contact@cafe.com');
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('Cafe created successfully')).toBeVisible();
    await expect(page.getByTestId('cafe-card')).toHaveCount(4);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('mobile-menu')).toBeVisible();
    await expect(page.getByTestId('cafe-grid')).toHaveCSS('grid-template-columns', '1fr');
  });
});
```

**Page Object Pattern:**

```typescript
// apps/admin-e2e/src/pages/cafe-page.ts
import { Page } from '@playwright/test';

export class CafePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/cafes');
  }

  async createCafe(name: string, contact: string) {
    await this.page.getByRole('button', { name: 'Add Cafe' }).click();
    await this.page.getByLabel('Cafe Name').fill(name);
    await this.page.getByLabel('Contact Info').fill(contact);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async getCafeCards() {
    return this.page.getByTestId('cafe-card');
  }
}
```

### Accessibility Testing

**Install @axe-core/playwright:**

```powershell
npm install -D @axe-core/playwright
```

**Accessibility Test Example:**

```typescript
// apps/admin-e2e/src/accessibility.e2e-spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/cafes');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus management in dialog', async ({ page }) => {
    await page.goto('/cafes');
    await page.getByRole('button', { name: 'Add Cafe' }).click();
    
    // First focusable element should be focused
    await expect(page.getByLabel('Cafe Name')).toBeFocused();
    
    // Tab trapping
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Contact Info')).toBeFocused();
    
    // Escape closes dialog
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
```

**Unit Test Accessibility:**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/angular';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = await render(CafeCardComponent, {
    componentInputs: { cafe: mockCafe }
  });
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Testing Best Practices

✅ **DO:**
- Test behavior, not implementation
- Use descriptive test names following "should [what] when [condition]" pattern
- Use `it.each` for tests with the same flow to avoid code duplication
- Arrange-Act-Assert pattern
- Test edge cases and error scenarios
- Mock external dependencies
- Use data-testid for element selection
- Test accessibility (ARIA attributes)
- **Store test values in variables** - avoid duplicating values between method calls and assertions
- **Use constants for magic values** - no hardcoded strings/numbers in tests
- **Run accessibility tests** - Use @axe-core/playwright for E2E and jest-axe for unit tests
- **Test responsive behavior** - Use Playwright viewport sizes

❌ **DON'T:**
- Test private methods
- Test framework internals
- Duplicate code - use `it.each` instead
- Duplicate values in calls and assertions - use variables
- Use magic values - define constants
- Write flaky tests
- Skip error cases
- Use vague test names like "should work" or "test function"
- Skip accessibility testing

---

## SCSS Architecture

### File Structure

```
apps/admin/src/styles/
├── _variables.scss          # Design tokens (colors, spacing, typography)
├── _mixins.scss             # Reusable SCSS mixins
├── _themes.scss             # Material theming
├── _typography.scss         # Font definitions
├── _responsive.scss         # Breakpoint mixins
└── styles.scss              # Main entry point

libs/shared/ui/src/lib/
├── loading-spinner/
│   ├── loading-spinner.component.ts
│   ├── loading-spinner.component.scss    ← Component-specific styles
│   └── loading-spinner.component.spec.ts
```

### Design Tokens (_variables.scss)

```scss
// Colors (Material Design 3)
$primary-color: #6750A4;
$secondary-color: #625B71;
$tertiary-color: #7D5260;
$error-color: #B3261E;
$success-color: #4CAF50;
$warning-color: #FF9800;

// Spacing scale (8px base)
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;

// Typography
$font-family: 'Roboto', sans-serif;
$font-size-sm: 0.875rem;   // 14px
$font-size-md: 1rem;       // 16px
$font-size-lg: 1.25rem;    // 20px
$font-size-xl: 1.5rem;     // 24px

// Breakpoints
$breakpoint-mobile: 0;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
$breakpoint-wide: 1440px;

// Z-index layers
$z-dropdown: 1000;
$z-sticky: 1020;
$z-fixed: 1030;
$z-modal-backdrop: 1040;
$z-modal: 1050;
$z-popover: 1060;
$z-tooltip: 1070;
```

### Responsive Mixins (_responsive.scss)

```scss
@mixin mobile-only {
  @media (max-width: #{$breakpoint-tablet - 1px}) {
    @content;
  }
}

@mixin tablet-up {
  @media (min-width: $breakpoint-tablet) {
    @content;
  }
}

@mixin desktop-up {
  @media (min-width: $breakpoint-desktop) {
    @content;
  }
}

@mixin wide-up {
  @media (min-width: $breakpoint-wide) {
    @content;
  }
}

// Mobile-first approach
@mixin responsive-grid($mobile-cols, $tablet-cols, $desktop-cols) {
  display: grid;
  gap: $spacing-md;
  grid-template-columns: repeat($mobile-cols, 1fr);

  @include tablet-up {
    grid-template-columns: repeat($tablet-cols, 1fr);
  }

  @include desktop-up {
    grid-template-columns: repeat($desktop-cols, 1fr);
  }
}
```

### Component Styles Best Practices

```scss
// ✅ Good - Use variables and mixins
.cafe-card {
  padding: $spacing-md;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @include tablet-up {
    padding: $spacing-lg;
  }

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

// ❌ Bad - Magic values
.cafe-card {
  padding: 16px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Material Theming (_themes.scss)

```scss
@use '@angular/material' as mat;

@include mat.core();

$primary-palette: mat.define-palette(mat.$indigo-palette);
$accent-palette: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$warn-palette: mat.define-palette(mat.$red-palette);

$light-theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($light-theme);

// Dark theme
$dark-theme: mat.define-dark-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  )
));

.dark-theme {
  @include mat.all-component-colors($dark-theme);
}
```

---

## Asset Organization

### Directory Structure

```
apps/admin/public/
├── i18n/                    # Translation files
│   ├── en-US.json
│   └── uk-UA.json
├── images/
│   ├── logo.svg
│   ├── icons/               # Custom SVG icons
│   │   ├── cafe.svg
│   │   ├── menu.svg
│   │   └── logout.svg
│   └── placeholders/        # Placeholder images
│       ├── no-image.svg
│       └── empty-state.svg
└── fonts/                   # Custom fonts (if any)
    └── README.md
```

### Image Optimization

**Use NgOptimizedImage for all images:**

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'sc-cafe-card',
  imports: [NgOptimizedImage],
  template: `
    <img 
      [ngSrc]="cafe().imageUrl"
      [alt]="cafe().name"
      width="300"
      height="200"
      priority
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw">
  `
})
export class CafeCardComponent {}
```

### Icon Strategy

**Use Material Icons for common UI elements:**

```typescript
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'sc-toolbar',
  imports: [MatIconModule],
  template: `
    <button mat-icon-button>
      <mat-icon>menu</mat-icon>
    </button>
    <button mat-icon-button>
      <mat-icon>settings</mat-icon>
    </button>
  `
})
export class ToolbarComponent {}
```

**Use custom SVG for brand-specific icons:**

```typescript
@Component({
  selector: 'sc-cafe-icon',
  template: `
    <img [src]="iconPath" [alt]="altText" class="icon">
  `,
  styles: [`
    .icon {
      width: 24px;
      height: 24px;
    }
  `]
})
export class CafeIconComponent {
  iconPath = 'images/icons/cafe.svg';
  altText = 'Cafe icon';
}
```

---

## File Organization Rules

**Each file should contain ONE class, interface, or enum. Multiple constants and type aliases are allowed per file.**

### One Class Per File

```typescript
// ✅ Good - One class per file
// cafe-card.component.ts
@Component({
  selector: 'sc-cafe-card',
  // ...
})
export class CafeCardComponent {}

// ❌ Bad - Multiple classes in one file
// cafe-components.ts
export class CafeCardComponent {}
export class CafeListComponent {}
export class CafeFormComponent {}
```

### One Interface Per File

```typescript
// ✅ Good - One interface per file
// cafe.model.ts
export interface CafeDto {
  id: string;
  name: string;
  contactInfo: string;
}

// ❌ Bad - Multiple interfaces in one file
// models.ts
export interface CafeDto { /* ... */ }
export interface MenuDto { /* ... */ }
export interface MenuItemDto { /* ... */ }
```

### One Enum Per File

```typescript
// ✅ Good - One enum per file
// menu-state.enum.ts
export enum MenuState {
  New = 'New',
  Published = 'Published',
  Active = 'Active'
}

// ❌ Bad - Multiple enums in one file
// enums.ts
export enum MenuState { /* ... */ }
export enum PriceUnit { /* ... */ }
export enum ImageType { /* ... */ }
```

### Multiple Constants Allowed

```typescript
// ✅ Good - Multiple related constants in one file
// validation-messages.constants.ts
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  MAX_LENGTH: 'Maximum length exceeded',
  INVALID_FORMAT: 'Invalid format'
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DEFAULT_PAGE_SIZE = 20;
```

### Multiple Type Aliases Allowed

```typescript
// ✅ Good - Multiple related type aliases in one file
// common.types.ts
export type CafeId = string;
export type MenuId = string;
export type MenuItemId = string;
export type Timestamp = string; // ISO 8601

export type FormStatus = 'valid' | 'invalid' | 'pending';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

### Combined Constants and Types

```typescript
// ✅ Good - Constants and types together when related
// api.config.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.smartcafe.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
} as const;

export type ApiEndpoint = 'cafes' | 'menus' | 'menu-items' | 'images';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
```

### Barrel Exports

```typescript
// ✅ Good - index.ts for re-exporting related files
// models/index.ts
export * from './cafe.model';
export * from './menu.model';
export * from './menu-item.model';
export * from './section.model';
export * from './common.types';
```

**Benefits:**
- 📁 **Easier Navigation**: Find files by class/interface name
- 🔍 **Better IDE Support**: Jump to definition works seamlessly
- 🧩 **Clearer Dependencies**: Import statements show exact relationships
- ♻️ **Easier Refactoring**: Move or rename single entities without conflicts
- 📦 **Smaller PRs**: Changes to one entity don't affect unrelated code

---

## Code Quality Tools

### ESLint Configuration
```json
{
  "extends": [
    "plugin:@angular-eslint/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@angular-eslint/component-class-suffix": "error"
  }
}
```

### Prettier
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Husky Pre-commit
```bash
# .husky/pre-commit
npm run lint
npm run format:check
npm run test:ci
```

---

## Project Structure (Nx Workspace)

**This project uses Nx monorepo with library-based architecture for scalability and clean boundaries.**

```
smartcafe-admin-client/
├── apps/
│   ├── admin/                               # Main application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts          # Route to feature libraries
│   │   │   ├── assets/
│   │   │   │   ├── i18n/
│   │   │   │   │   ├── en.json
│   │   │   │   │   └── uk.json
│   │   │   │   └── images/
│   │   │   ├── styles/
│   │   │   │   ├── _variables.scss
│   │   │   │   ├── _themes.scss
│   │   │   │   └── styles.scss
│   │   │   ├── environments/
│   │   │   │   ├── environment.ts
│   │   │   │   ├── environment.staging.ts
│   │   │   │   └── environment.production.ts
│   │   │   └── main.ts
│   │   ├── project.json
│   │   └── tsconfig.app.json
│   └── admin-e2e/                           # E2E tests (Playwright)
│       └── src/
├── libs/
│   ├── feature-cafes/                        # Cafe feature (complete vertical slice)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── pages/                   # Smart components
│   │   │   │   │   ├── cafe-grid-page/
│   │   │   │   │   │   ├── cafe-grid-page.component.ts
│   │   │   │   │   │   ├── cafe-grid-page.component.html
│   │   │   │   │   │   ├── cafe-grid-page.component.scss
│   │   │   │   │   │   └── cafe-grid-page.component.spec.ts
│   │   │   │   │   └── cafe-create-page/
│   │   │   │   ├── components/              # Cafe-specific UI components
│   │   │   │   │   ├── cafe-card/
│   │   │   │   │   ├── cafe-form/
│   │   │   │   │   └── cafe-list-item/
│   │   │   │   ├── services/                # Cafe API service
│   │   │   │   │   ├── cafe-api.service.ts
│   │   │   │   │   └── cafe-api.service.spec.ts
│   │   │   │   ├── store/                   # Cafe state management
│   │   │   │   │   ├── cafe.store.ts
│   │   │   │   │   └── cafe.store.spec.ts
│   │   │   │   └── cafe.routes.ts
│   │   │   └── index.ts                     # Public API
│   │   └── project.json
│   ├── feature-menus/                        # Menu feature (complete vertical slice)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── pages/                   # Smart components
│   │   │   │   │   ├── menu-grid-page/
│   │   │   │   │   ├── menu-create-page/
│   │   │   │   │   ├── menu-edit-page/
│   │   │   │   │   └── menu-preview-page/
│   │   │   │   ├── components/              # Menu-specific UI components
│   │   │   │   │   ├── menu-card/
│   │   │   │   │   ├── menu-form/
│   │   │   │   │   ├── section-form/
│   │   │   │   │   ├── menu-item-form/
│   │   │   │   │   └── menu-preview/
│   │   │   │   ├── services/                # Menu & Image API services
│   │   │   │   │   ├── menu-api.service.ts
│   │   │   │   │   ├── menu-api.service.spec.ts
│   │   │   │   │   ├── image-api.service.ts
│   │   │   │   │   └── image-api.service.spec.ts
│   │   │   │   ├── store/                   # Menu state management
│   │   │   │   │   ├── menu.store.ts
│   │   │   │   │   └── menu.store.spec.ts
│   │   │   │   └── menu.routes.ts
│   │   │   └── index.ts
│   │   └── project.json
│   ├── shared/                               # Shared between Cafe & Menu features
│   │   ├── ui/                               # Reusable UI components
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── loading-spinner/
│   │   │   │   │   ├── error-message/
│   │   │   │   │   ├── confirmation-dialog/
│   │   │   │   │   ├── empty-state/
│   │   │   │   │   ├── layout/              # Header, navigation, footer
│   │   │   │   │   └── theme-toggle/
│   │   │   │   └── index.ts
│   │   │   └── project.json
│   │   ├── models/                           # Shared DTOs & interfaces
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── cafe.models.ts       # CafeDto, CreateCafeRequest
│   │   │   │   │   ├── menu.models.ts       # MenuDto, MenuItemDto, SectionDto
│   │   │   │   │   └── common.models.ts     # Shared types (Price, Image, etc.)
│   │   │   │   └── index.ts
│   │   │   └── project.json
│   │   ├── data-access/                      # Shared services & interceptors
│   │   │   ├── src/
│   │   │   │   ├── lib/
│   │   │   │   │   ├── interceptors/
│   │   │   │   │   │   ├── error.interceptor.ts
│   │   │   │   │   │   ├── loading.interceptor.ts
│   │   │   │   │   │   └── retry.interceptor.ts
│   │   │   │   │   ├── guards/
│   │   │   │   │   │   └── unsaved-changes.guard.ts
│   │   │   │   │   └── services/
│   │   │   │   │       ├── theme.service.ts
│   │   │   │   │       ├── notification.service.ts
│   │   │   │   │       └── error-handler.service.ts
│   │   │   │   └── index.ts
│   │   │   └── project.json
│   │   └── utils/                            # Shared utilities, pipes, directives
│   │       ├── src/
│   │       │   ├── lib/
│   │       │   │   ├── pipes/
│   │       │   │   │   └── safe-html.pipe.ts
│   │       │   │   ├── directives/
│   │       │   │   │   └── auto-focus.directive.ts
│   │       │   │   └── helpers/
│   │       │   └── index.ts
│   │       └── project.json
│   └── testing/
│       └── test-helpers/                     # Test utilities, mocks, factories
│           ├── src/
│           │   ├── lib/
│           │   │   ├── mocks/
│           │   │   │   ├── cafe.mocks.ts
│           │   │   │   └── menu.mocks.ts
│           │   │   └── factories/
│           │   └── index.ts
│           └── project.json
├── nx.json                                   # Nx configuration
├── package.json
├── tsconfig.base.json                        # Path aliases (@smartcafe/admin/*)
└── README.md
```

### Path Aliases (tsconfig.base.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@smartcafe/admin/feature-cafes": ["libs/feature-cafes/src/index.ts"],
      "@smartcafe/admin/feature-menus": ["libs/feature-menus/src/index.ts"],
      "@smartcafe/admin/data-access-cafes": ["libs/data-access-cafes/src/index.ts"],
      "@smartcafe/admin/data-access-menus": ["libs/data-access-menus/src/index.ts"],
      "@smartcafe/admin/shared/ui": ["libs/shared/ui/src/index.ts"],
      "@smartcafe/admin/shared/models": ["libs/shared/models/src/index.ts"],
      "@smartcafe/admin/shared/data-access": ["libs/shared/data-access/src/index.ts"],
      "@smartcafe/admin/shared/utils": ["libs/shared/utils/src/index.ts"],
      "@smartcafe/admin/testing/test-helpers": ["libs/testing/test-helpers/src/index.ts"]
    }
  }
}
```

### Import Examples

```typescript
// ✅ Import feature library (app routes)
import { CAFE_ROUTES } from '@smartcafe/admin/feature-cafes';
import { MENU_ROUTES } from '@smartcafe/admin/feature-menus';

// ✅ Import shared models (used across features)
import { CafeDto, MenuDto, MenuItemDto } from '@smartcafe/admin/shared/models';

// ✅ Import shared UI components
import { LoadingSpinnerComponent, ErrorMessageComponent } from '@smartcafe/admin/shared/ui';

// ✅ Import shared services
import { ThemeService, NotificationService } from '@smartcafe/admin/shared/data-access';

// ✅ Import test helpers
import { mockCafe, mockMenu } from '@smartcafe/admin/testing/test-helpers';

// ❌ Don't import from other features directly
import { CafeStore } from '@smartcafe/admin/feature-cafes'; // ❌ Internal to feature

// ❌ Don't use relative imports across libraries
```

### Library Dependency Rules

1. **Feature libraries** (e.g., `feature-cafes`, `feature-menus`) can depend on:
   - Shared libraries only (`shared/*`)
   - **Cannot depend on other features** (no cross-feature dependencies)

2. **Shared libraries** (`shared/*`) can depend on:
   - Other shared libraries only
   - **Cannot depend on feature libraries**

3. **Apps** can depend on:
   - Feature libraries only (for routing)
   - Shared libraries (for layout, theme toggle)

4. **Feature internal structure**:
   - Pages → Components, Services, Store
   - Components → Services, Store
   - Services → Models (from shared)
   - Store → Services, Models

5. **No circular dependencies** allowed (enforced by Nx)

**Example valid dependencies:**
```
admin
  ↓
feature-cafes
  ↓
shared/models, shared/ui, shared/data-access

feature-menus
  ↓
shared/models, shared/ui, shared/data-access
```

---

## File Naming Conventions

- **Components**: `kebab-case.component.ts`
- **Services**: `kebab-case.service.ts`
- **Stores**: `feature-name.store.ts`
- **Guards**: `feature-name.guard.ts`
- **Interceptors**: `feature-name.interceptor.ts`
- **Models**: `feature-name.models.ts`
- **Routes**: `feature-name.routes.ts`

---

## Git Commit Conventions

Use Conventional Commits:
```
feat(cafes): add cafe creation form
fix(menus): resolve image upload issue
docs(readme): update setup instructions
test(cafes): add cafe service tests
refactor(menus): extract menu item component
style(app): apply prettier formatting
chore(deps): update Angular to v20.1
```

---

## Storybook for Shared Components

**All shared UI components MUST have Storybook stories for documentation and testing.**

### What to Document

- **Shared UI Components**: `libs/shared/ui/*` - Every component needs a story
- **Component States**: All variations (loading, error, empty, success)
- **Responsive Behavior**: Mobile, tablet, desktop views
- **Accessibility**: Keyboard navigation, screen reader states
- **Interactions**: User actions (click, hover, focus)

### Story Structure

```typescript
// libs/shared/ui/src/lib/loading-spinner/loading-spinner.stories.ts
import { Meta, StoryObj } from '@storybook/angular';
import { LoadingSpinnerComponent } from './loading-spinner.component';

const meta: Meta<LoadingSpinnerComponent> = {
  title: 'Shared/UI/LoadingSpinner',
  component: LoadingSpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'large'],
      description: 'Size of the spinner'
    }
  }
};

export default meta;
type Story = StoryObj<LoadingSpinnerComponent>;

export const Small: Story = {
  args: {
    size: 'small'
  }
};

export const Large: Story = {
  args: {
    size: 'large'
  }
};
```

### Story Best Practices

✅ **DO:**
- Write stories for all shared components in `libs/shared/ui/`
- Use `argTypes` for interactive controls
- Document all `@Input()` properties and `@Output()` events
- Show all component states (loading, error, empty, success)
- Include accessibility annotations
- Use `play` functions for interaction testing
- Organize stories by domain: `Shared/UI/`, `Shared/Forms/`, etc.

❌ **DON'T:**
- Skip stories for shared components
- Write stories for feature-specific components (they stay in feature libs)
- Duplicate component logic in stories
- Hardcode data - use mock factories

### Example: Complex Component Story

```typescript
// libs/shared/ui/src/lib/confirmation-dialog/confirmation-dialog.stories.ts
import { Meta, StoryObj } from '@storybook/angular';
import { within, userEvent, expect } from '@storybook/test';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

const meta: Meta<ConfirmationDialogComponent> = {
  title: 'Shared/UI/ConfirmationDialog',
  component: ConfirmationDialogComponent,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    confirmText: { control: 'text' },
    cancelText: { control: 'text' },
    confirmColor: {
      control: 'select',
      options: ['primary', 'accent', 'warn']
    }
  }
};

export default meta;
type Story = StoryObj<ConfirmationDialogComponent>;

export const Default: Story = {
  args: {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Yes',
    cancelText: 'No'
  }
};

export const DeleteWarning: Story = {
  args: {
    title: 'Delete Cafe',
    message: 'This action cannot be undone. All menus will be deleted.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmColor: 'warn'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const confirmButton = canvas.getByRole('button', { name: /delete/i });
    
    // Verify button exists and has correct color
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveClass('mat-warn');
  }
};

export const LongMessage: Story = {
  args: {
    title: 'Important Notice',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
    confirmText: 'I Understand',
    cancelText: 'Cancel'
  }
};
```

### Running Storybook

```bash
# Start Storybook
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

---

## Documentation Requirements

- **Component**: JSDoc with @description, @example
- **Service**: Document public methods
- **Store**: Document state shape and key methods
- **Complex Logic**: Inline comments explaining why, not what
- **Shared Components**: Storybook stories (mandatory)

```typescript
/**
 * Displays a cafe card with name, contact info, and action buttons.
 * 
 * @example
 * ```html
 * <sc-cafe-card 
 *   [cafe]="cafe" 
 *   (edit)="onEdit($event)" 
 *   (delete)="onDelete($event)" />
 * ```
 */
@Component({
  selector: 'sc-cafe-card',
  // ...
})
export class CafeCardComponent {}
```

---

## Summary Checklist

### Core Angular
- ✅ Use Angular 20+ with standalone components
- ✅ Use signals, computed, input(), output()
- ✅ **Use zoneless change detection** (provideExperimentalZonelessChangeDetection)
- ✅ Use OnPush change detection everywhere
- ✅ Use inject() instead of constructor injection
- ✅ Use @if, @for, @switch (not *ngIf, *ngFor, *ngSwitch)
- ✅ Use class/style bindings (not ngClass/ngStyle)

### State Management
- ✅ **Use signals for all state** (mandatory for zoneless)
- ✅ **Keep async operations in stores, not components**
- ✅ **Use NgRx Signal Store** for complex state
- ✅ Use pure state transformations

### Forms & Data
- ✅ Use Reactive Forms (not Template-driven)
- ✅ Use NgOptimizedImage for images
- ✅ Use trackBy for loops
- ✅ Implement virtual scrolling for large lists

### Internationalization
- ✅ **Use Intl API for formatting** (dates, numbers, currency)
- ✅ **Use BCP 47 locale codes** (en-US, uk-UA)
- ✅ **Don't use registerLocaleData** (bundle size optimization)
- ✅ Use translation library for text content (ngx-translate or @angular/localize)

### Testing
- ✅ **Write comprehensive unit tests for all components, services, stores**
- ✅ **Write integration tests for feature workflows**
- ✅ **Maintain minimum 80% code coverage**
- ✅ **Use zoneless in test configuration**
- ✅ Use it.each for tests with same flow

### Accessibility & UX
- ✅ Follow WCAG 2.1 AA accessibility standards
- ✅ **Implement responsive design (mobile-first)**
- ✅ **Auto-detect and apply system theme preference**

### Code Quality
- ✅ Use strict TypeScript typing
- ✅ Keep components small and focused
- ✅ Document public APIs
- ✅ **Use constants for magic values**
- ✅ **Store test values in variables** (avoid duplication)

---

**These instructions are mandatory for all development work on the SmartCafe Angular application.**
