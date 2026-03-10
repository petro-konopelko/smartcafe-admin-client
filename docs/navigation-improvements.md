# Navigation Improvements Plan

## Overview

This document describes 10 navigation improvements for the SmartCafe Admin Angular application. Each improvement includes the problem analysis, the exact files to modify, the implementation steps, and the expected behavior. Use this as a task list — each improvement is independent and can be implemented in any order (unless noted).

---

## Current Navigation Map

```
┌─────────────────────────────────────────────────────────┐
│  TOOLBAR  (always visible)                              │
│  [Restaurant icon] → /cafes    [SmartCafe] → /cafes     │
│  [Language selector]  [Theme switcher]                  │
└─────────────────────────────────────────────────────────┘

/cafes ─── CafePageComponent
│   [+ Create Cafe]  → opens CafeFormDialog (dialog)
│   [View Menus ☰]   → /cafes/:cafeId/menus
│   [Delete 🗑]       → opens ConfirmDialog (dialog)
│
└──▸ /cafes/:cafeId/menus ─── MenuPageComponent
     │   [← Back]          → /cafes
     │   [+ Create Menu]   → /cafes/:cafeId/menus/new
     │   [⋮ Preview]       → /cafes/:cafeId/menus/:menuId/preview
     │   [⋮ Edit]          → /cafes/:cafeId/menus/:menuId/edit
     │   [⋮ Clone]         → opens MenuCloneDialog
     │   [⋮ Publish]       → opens ConfirmDialog (New menus only)
     │   [⋮ Activate]      → opens ConfirmDialog (Published menus only)
     │   [⋮ Delete]        → opens ConfirmDialog (non-Active only)
     │
     ├──▸ /cafes/:cafeId/menus/new ─── MenuEditPageComponent (create)
     │       [← Back]  → /cafes/:cafeId/menus
     │       [Save]    → /cafes/:cafeId/menus (on success)
     │
     ├──▸ /cafes/:cafeId/menus/:menuId/edit ─── MenuEditPageComponent (edit)
     │       [← Back]    → /cafes/:cafeId/menus
     │       [Preview]   → /cafes/:cafeId/menus/:menuId/preview
     │       [Save]      → /cafes/:cafeId/menus (on success)
     │
     └──▸ /cafes/:cafeId/menus/:menuId/preview ─── MenuPreviewPageComponent
             [← Back]  → /cafes/:cafeId/menus
             [Edit]    → /cafes/:cafeId/menus/:menuId/edit
```

**Total pages:** 5 routed pages + 3 dialog overlays

---

## Improvement 1: Add Breadcrumb Navigation Component

**Priority:** Medium  
**Affected pages:** All pages below `/cafes`

### Problem

The only way to know where you are in the hierarchy is the page title and a back arrow. On deeper pages (edit/preview), there is no visual trail showing the path: `Cafes > Cafe Name > Menus > Menu Name > Edit`.

### Implementation

#### 1.1 Create a new `BreadcrumbComponent` in shared/ui

**New files:**

- `libs/shared/ui/src/lib/breadcrumb/breadcrumb.component.ts`
- `libs/shared/ui/src/lib/breadcrumb/breadcrumb.component.html`
- `libs/shared/ui/src/lib/breadcrumb/breadcrumb.component.scss`
- `libs/shared/ui/src/lib/breadcrumb/breadcrumb.component.spec.ts`

**Component interface:**

```typescript
// breadcrumb.component.ts
export interface BreadcrumbItem {
  label: string; // Display text (e.g., "My Cafes", "Downtown Cafe", "Edit Menu")
  route?: string | string[]; // Router link — omit for the current/last item (not clickable)
}

@Component({
  selector: 'sc-breadcrumb'
  // ...
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
}
```

**Template structure:**

```html
<nav
  aria-label="Breadcrumb"
  class="breadcrumb"
>
  <ol>
    @for (item of items(); track $index; let last = $last) {
    <li>
      @if (!last && item.route) {
      <a [routerLink]="item.route">{{ item.label }}</a>
      } @else {
      <span aria-current="page">{{ item.label }}</span>
      } @if (!last) {
      <mat-icon class="separator">chevron_right</mat-icon>
      }
    </li>
    }
  </ol>
</nav>
```

**Styling:** Horizontal list with `chevron_right` separators. Font size `0.875rem`. Links styled with primary color. Truncate long labels with ellipsis. On mobile, consider showing only the last 2 items and collapsing earlier ones into a `...` menu.

#### 1.2 Export from shared/ui

**File to modify:** `libs/shared/ui/src/index.ts`

Add:

```typescript
export * from './lib/breadcrumb/breadcrumb.component';
```

#### 1.3 Add breadcrumbs to each page component

For each page, build the breadcrumb items array based on the current route params and resolved data. Examples:

**MenuPageComponent** (`/cafes/:cafeId/menus`):

```typescript
breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: this.translate.instant('cafes.title'), route: ['/cafes'] },
  { label: this.cafeName() ?? '...', route: ['/cafes'] },
  { label: this.translate.instant('menus.title') }
]);
```

Note: The `cafeName` needs to be resolved — see Improvement 3.

**MenuEditPageComponent** (`/cafes/:cafeId/menus/:menuId/edit`):

```typescript
breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const cafeId = this.cafeId();
  const items: BreadcrumbItem[] = [
    { label: this.translate.instant('cafes.title'), route: ['/cafes'] },
    { label: this.cafeName() ?? '...', route: ['/cafes', cafeId, 'menus'] },
    {
      label: this.isEditMode()
        ? (this.menuStore.selectedMenu()?.name ?? '...')
        : this.translate.instant('menus.createTitle')
    }
  ];
  return items;
});
```

**MenuPreviewPageComponent** (`/cafes/:cafeId/menus/:menuId/preview`):

```typescript
breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const cafeId = this.cafeId();
  return [
    { label: this.translate.instant('cafes.title'), route: ['/cafes'] },
    { label: this.cafeName() ?? '...', route: ['/cafes', cafeId, 'menus'] },
    { label: this.menuStore.selectedMenu()?.name ?? this.translate.instant('menus.previewTitle') }
  ];
});
```

#### 1.4 Place breadcrumb in page headers

In each page template, add `<sc-breadcrumb [items]="breadcrumbs()" />` inside the `.page-header` area, below the back button row or replacing it.

#### 1.5 i18n

New translation keys are not needed if reusing existing keys (`cafes.title`, `menus.title`, etc.). Add `breadcrumb.aria` label key for the `<nav>` if desired:

- **en-US.json:** `"app.navigation.breadcrumb": "Breadcrumb"`
- **uk-UA.json:** `"app.navigation.breadcrumb": "Навігація"`

#### 1.6 Tests

- Unit test: Renders correct number of items, last item is not a link, other items are links with correct `routerLink`.
- Accessibility: `<nav>` has `aria-label`, last item has `aria-current="page"`.

---

## Improvement 2: Display Cafe Name on Menu Pages

**Priority:** High  
**Affected pages:** `MenuPageComponent`, `MenuEditPageComponent`, `MenuPreviewPageComponent`

### Problem

When the user is on any menu page, the page title just says "Menus" (or "Edit Menu" / "Menu Preview"). The user has no idea **which cafe's menus** they are looking at.

### Implementation

#### 2.1 Resolve the cafe name from `CafeStore`

The `CafeStore` already has a `selectCafe(cafeId)` method that fetches the cafe and stores it in `selectedCafe`. Use this on menu pages to get the cafe name.

**Option A — Use `CafeStore` directly in each menu page component:**

In `MenuPageComponent`, `MenuEditPageComponent`, and `MenuPreviewPageComponent`:

```typescript
private readonly cafeStore = inject(CafeStore);

// Inside the existing effect that reads cafeId:
constructor() {
  effect(() => {
    const cafeId = this.cafeId();
    if (cafeId) {
      untracked(() => {
        this.cafeStore.selectCafe(cafeId);
        // ... existing menu loading logic
      });
    }
  });
}

protected readonly cafeName = computed(() => this.cafeStore.selectedCafe()?.name ?? '');
```

**Option B (preferred) — Use a route resolver:**

Create a resolver at the `cafes/:cafeId/menus` route level that loads the cafe data and provides it to all child routes. This avoids duplicate API calls when navigating between menu sub-pages.

**File:** `libs/feature-menus/src/lib/resolvers/cafe.resolver.ts`

```typescript
import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { CafeStore } from '@smartcafe/admin/feature-cafes'; // Requires exporting CafeStore

export const cafeResolver: ResolveFn<void> = async (route: ActivatedRouteSnapshot) => {
  const cafeId = route.paramMap.get('cafeId');
  if (cafeId) {
    const cafeStore = inject(CafeStore);
    await cafeStore.selectCafe(cafeId);
  }
};
```

Then update `app.routes.ts`:

```typescript
{
  path: 'cafes/:cafeId/menus',
  resolve: { cafe: cafeResolver },
  loadChildren: () =>
    import('@smartcafe/admin/feature-menus').then((m) => m.MENU_ROUTES),
}
```

**Note on library boundaries:** If `CafeStore` should not be directly imported into `feature-menus`, an alternative approach is to expose a `CafeNameService` from `shared/data-access` that only fetches and caches the cafe name (using `CafeApiService.getCafe()`). This keeps the dependency graph clean:

```
feature-menus → shared/data-access (CafeNameService)
                 ↓
               feature-cafes API (GET /cafes/:cafeId)
```

#### 2.2 Update page titles to include cafe name

**MenuPageComponent template** (`menu-page.component.html`):

Change:

```html
<h1>{{ 'menus.title' | translate }}</h1>
```

To:

```html
<h1>
  @if (cafeName()) { {{ cafeName() }} — {{ 'menus.title' | translate }} } @else { {{ 'menus.title' |
  translate }} }
</h1>
```

Or if using breadcrumbs (Improvement 1), the cafe name appears in the breadcrumb trail and the page title can remain "Menus".

#### 2.3 Tests

- Verify cafe name appears in the page header or breadcrumb.
- Verify loading state (shows "..." or spinner while cafe is being fetched).

---

## Improvement 3: Add "Edit Cafe" Action to Cafe List

**Priority:** Medium  
**Affected files:** `CafePageComponent`, `CafeFormDialogComponent`, `CafeStore`, `CafeApiService`

### Problem

The cafe table in `CafePageComponent` only has "View Menus" and "Delete" actions. There is no way to edit a cafe's name or contact info — the user must delete and recreate it.

### Implementation

#### 3.1 Add `updateCafe` to CafeApiService

**File:** `libs/feature-cafes/src/lib/services/cafe-api.service.ts`

```typescript
updateCafe(cafeId: string, request: CreateCafeRequest): Observable<void> {
  return this.http.put<void>(`${this.baseUrl}/${cafeId}`, request);
}
```

**Note:** Confirm that the backend supports `PUT /api/cafes/:cafeId`. If the API uses a different DTO for updates, create an `UpdateCafeRequest` interface in `libs/feature-cafes/src/lib/models/`.

#### 3.2 Add `updateCafe` to CafeStore

**File:** `libs/feature-cafes/src/lib/store/cafe.store.ts`

```typescript
async updateCafe(cafeId: string, request: CreateCafeRequest): Promise<boolean> {
  const result = await store.withLoading(async () => {
    await firstValueFrom(cafeApi.updateCafe(cafeId, request));
    const list = await firstValueFrom(cafeApi.listCafes());
    patchState(store, { cafes: list.cafes });
    return true;
  });
  return result ?? false;
}
```

#### 3.3 Modify CafeFormDialogComponent to support edit mode

**File:** `libs/feature-cafes/src/lib/components/cafe-form-dialog/cafe-form-dialog.component.ts`

Add `MAT_DIALOG_DATA` injection to accept an optional existing cafe:

```typescript
export interface CafeFormDialogData {
  cafe?: CafeDto; // undefined = create mode, defined = edit mode
}

// In the component:
protected readonly data = inject<CafeFormDialogData>(MAT_DIALOG_DATA, { optional: true });
protected readonly isEditMode = !!this.data?.cafe;

// Pre-populate the form in constructor or ngOnInit:
constructor() {
  if (this.data?.cafe) {
    this.cafeForm.patchValue({
      name: this.data.cafe.name,
      contactInfo: this.data.cafe.contactInfo ?? ''
    });
  }
}

// Modify onSubmit to handle both create and update:
protected async onSubmit(): Promise<void> {
  if (this.cafeForm.valid) {
    const formValue = this.cafeForm.value;
    if (!formValue.name) return;

    if (this.isEditMode && this.data?.cafe) {
      const result = await this.cafeStore.updateCafe(this.data.cafe.id, {
        name: formValue.name,
        contactInfo: formValue.contactInfo || null,
      });
      if (result) {
        this.dialogRef.close(result);
      }
    } else {
      const result = await this.cafeStore.createCafe({
        name: formValue.name,
        contactInfo: formValue.contactInfo || null,
      });
      if (result) {
        this.dialogRef.close(result);
      }
    }
  }
}
```

**File:** `libs/feature-cafes/src/lib/components/cafe-form-dialog/cafe-form-dialog.component.html`

Change the dialog title to be dynamic:

```html
<h2 mat-dialog-title>{{ (isEditMode ? 'cafes.editTitle' : 'cafes.createTitle') | translate }}</h2>
```

And the submit button text:

```html
{{ (isEditMode ? 'common.actions.save' : 'common.actions.create') | translate }}
```

#### 3.4 Add edit button to CafePageComponent

**File:** `libs/feature-cafes/src/lib/components/cafe-page/cafe-page.component.html`

In the actions cell, add an edit button between the "View Menus" and "Delete" buttons:

```html
<button
  matIconButton
  (click)="onEditCafe(cafe)"
  [attr.aria-label]="'common.actions.edit' | translate"
  [matTooltip]="'common.actions.edit' | translate"
  data-testid="edit-cafe-button"
>
  <mat-icon>edit</mat-icon>
</button>
```

**File:** `libs/feature-cafes/src/lib/components/cafe-page/cafe-page.component.ts`

Add the edit handler:

```typescript
protected onEditCafe(cafe: CafeDto): void {
  this.dialog.open(CafeFormDialogComponent, {
    width: '500px',
    disableClose: true,
    data: { cafe } as CafeFormDialogData
  });
}
```

#### 3.5 i18n

Add to both `en-US.json` and `uk-UA.json`:

```json
"cafes": {
  "editTitle": "Edit Cafe"
}
```

#### 3.6 Tests

- Test `CafeFormDialogComponent` in edit mode: form pre-populated, calls `updateCafe`.
- Test `CafePageComponent`: edit button renders, opens dialog with cafe data.
- Test `CafeStore.updateCafe`: API call, state update.

---

## Improvement 4: Wire the Cancel Button on Menu Edit Page

**Priority:** Low  
**Affected files:** `MenuEditPageComponent`

### Problem

`MenuEditPageComponent` has an `onCancel()` method that navigates back to the menu list, but **no button in the template calls it**. The only way to leave without saving is the back arrow.

### Implementation

#### 4.1 Add Cancel button to the template

**File:** `libs/feature-menus/src/lib/components/menu-edit-page/menu-edit-page.component.html`

In the `.page-header-actions` div, add a Cancel button before the Save button:

```html
<div class="page-header-actions">
  @if (isEditMode()) {
  <button
    matButton
    (click)="onPreview()"
    [disabled]="isSubmitting()"
    data-testid="preview-button"
  >
    <mat-icon>visibility</mat-icon>
    {{ 'common.actions.preview' | translate }}
  </button>
  }
  <button
    matButton
    (click)="onCancel()"
    [disabled]="isSubmitting()"
    data-testid="cancel-button"
  >
    {{ 'common.actions.cancel' | translate }}
  </button>
  <button
    matButton="elevated"
    (click)="onSubmit()"
    [disabled]="isFormInvalid() || isSubmitting()"
    data-testid="save-button"
  >
    <mat-icon>save</mat-icon>
    {{ 'common.actions.save' | translate }}
  </button>
</div>
```

#### 4.2 Tests

- Verify Cancel button exists and calls `onCancel()`.
- Verify navigation goes to `/cafes/:cafeId/menus`.

---

## Improvement 5: Add Unsaved Changes Guard to Menu Edit

**Priority:** High  
**Affected files:** New guard file, `menu.routes.ts`, `MenuEditPageComponent`

### Problem

There are no route guards. If a user edits a menu and accidentally clicks the back arrow, toolbar home, or browser back button — all changes are silently lost.

### Implementation

#### 5.1 Create the guard

**New file:** `libs/shared/data-access/src/lib/guards/unsaved-changes.guard.ts`

```typescript
import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '@smartcafe/admin/shared/ui';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  const dialog = inject(MatDialog);
  const dialogRef = dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
    ConfirmDialogComponent,
    {
      data: {
        title: 'Unsaved Changes', // Use i18n key in production
        message: 'You have unsaved changes. Are you sure you want to leave?',
        confirmText: 'Leave',
        cancelText: 'Stay',
        isDangerous: true
      }
    }
  );
  const result = await firstValueFrom(dialogRef.afterClosed());
  return result ?? false;
};
```

#### 5.2 Export from shared/data-access

**File:** `libs/shared/data-access/src/index.ts`

Add:

```typescript
export * from './lib/guards/unsaved-changes.guard';
```

#### 5.3 Implement `HasUnsavedChanges` in `MenuEditPageComponent`

**File:** `libs/feature-menus/src/lib/components/menu-edit-page/menu-edit-page.component.ts`

```typescript
import { HasUnsavedChanges } from '@smartcafe/admin/shared/data-access';

export class MenuEditPageComponent implements HasUnsavedChanges {
  // ... existing code ...

  hasUnsavedChanges(): boolean {
    return this.menuForm.dirty && !this.isSubmitting();
  }
}
```

#### 5.4 Apply guard to the menu edit routes

**File:** `libs/feature-menus/src/lib/menu.routes.ts`

```typescript
import { unsavedChangesGuard } from '@smartcafe/admin/shared/data-access';

export const MENU_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/menu-page/menu-page.component').then((m) => m.MenuPageComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/menu-edit-page/menu-edit-page.component').then(
        (m) => m.MenuEditPageComponent
      ),
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: ':menuId/edit',
    loadComponent: () =>
      import('./components/menu-edit-page/menu-edit-page.component').then(
        (m) => m.MenuEditPageComponent
      ),
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: ':menuId/preview',
    loadComponent: () =>
      import('./components/menu-preview-page/menu-preview-page.component').then(
        (m) => m.MenuPreviewPageComponent
      )
  }
];
```

#### 5.5 i18n

Add to both `en-US.json` and `uk-UA.json`:

```json
"common": {
  "unsavedChanges": {
    "title": "Unsaved Changes",
    "message": "You have unsaved changes. Are you sure you want to leave?",
    "leave": "Leave",
    "stay": "Stay"
  }
}
```

#### 5.6 Tests

- Test guard: returns `true` when `hasUnsavedChanges()` is `false`.
- Test guard: opens dialog when `hasUnsavedChanges()` is `true`, returns dialog result.
- Test `MenuEditPageComponent.hasUnsavedChanges()`: returns `true` when form is dirty.

---

## Improvement 6: Fix Preview "Back" Button to Return to Edit Page When Coming from Edit

**Priority:** Medium  
**Affected files:** `MenuPreviewPageComponent`

### Problem

When the user navigates **Edit → Preview** to check their work, pressing "Back" on the preview page goes to the **menu list** (`/cafes/:cafeId/menus`), not back to the edit page. This breaks the expected Edit → Preview → Edit round-trip.

### Implementation

#### 6.1 Track navigation source

**File:** `libs/feature-menus/src/lib/components/menu-preview-page/menu-preview-page.component.ts`

Use `router.getCurrentNavigation()` or a query parameter to detect the source:

**Option A — Query parameter approach (simpler):**

When navigating to preview from the edit page, add a query param:

In `MenuEditPageComponent.onPreview()`:

```typescript
protected onPreview(): void {
  const cafeId = this.cafeId();
  const menuId = this.menuId();
  if (cafeId && menuId) {
    this.router.navigate(['/cafes', cafeId, 'menus', menuId, 'preview'], {
      queryParams: { from: 'edit' }
    });
  }
}
```

In `MenuPreviewPageComponent`:

```typescript
private readonly queryParams = toSignal(this.route.queryParamMap);
protected readonly cameFromEdit = computed(() => this.queryParams()?.get('from') === 'edit');

protected onBack(): void {
  const cafeId = this.cafeId();
  const menuId = this.menuId();
  if (cafeId && menuId && this.cameFromEdit()) {
    this.router.navigate(['/cafes', cafeId, 'menus', menuId, 'edit']);
  } else if (cafeId) {
    this.router.navigate(['/cafes', cafeId, 'menus']);
  }
}
```

**Option B — "Back to Edit" is always a separate button:**

Keep the current "Back" → menu list behavior, but add a second button "Back to Edit" that is always visible:

```html
<div class="page-header-actions">
  <button
    matButton
    (click)="onBackToEdit()"
    data-testid="back-to-edit-button"
  >
    <mat-icon>edit</mat-icon>
    {{ 'menus.preview.backToEdit' | translate }}
  </button>
</div>
```

The translation key `menus.preview.backToEdit` already exists in `en-US.json` as `"Back to Edit"`.

**Recommended: Option A** — It's more intuitive. When the user came from edit, back should go to edit. When the user came from the menu list (via the "Preview" action in the `⋮` menu), back should go to the list.

#### 6.2 Tests

- When `from=edit` query param is present, back navigates to the edit page.
- When no query param, back navigates to the menu list.

---

## Improvement 7: Make Table Rows Clickable

**Priority:** Medium  
**Affected files:** `CafePageComponent`, `MenuPageComponent`

### Problem

Cafe rows and menu rows are not clickable. Users must find small icon buttons to navigate. Most users expect clicking a row to navigate into it.

### Implementation

#### 7.1 Cafe table — row click navigates to menus

**File:** `libs/feature-cafes/src/lib/components/cafe-page/cafe-page.component.html`

Add a click handler to the row definition:

```html
<tr
  mat-row
  *matRowDef="let row; columns: displayedColumns"
  class="clickable-row"
  (click)="onViewMenus(row)"
  [attr.data-testid]="'cafe-row-' + row.id"
></tr>
```

**File:** `libs/feature-cafes/src/lib/components/cafe-page/cafe-page.component.scss`

```scss
.clickable-row {
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

// Prevent row click when clicking action buttons
.action-buttons {
  pointer-events: auto;
}
```

**File:** `libs/feature-cafes/src/lib/components/cafe-page/cafe-page.component.ts`

The `onViewMenus` method already exists — no changes needed. However, the action buttons (edit, delete) need `$event.stopPropagation()` to prevent the row click from firing:

```html
<button
  matIconButton
  (click)="onEditCafe(cafe); $event.stopPropagation()"
  ...
></button>
```

```html
<button
  matIconButton
  (click)="onDeleteCafe(cafe); $event.stopPropagation()"
  ...
></button>
```

```html
<button
  matIconButton
  (click)="onViewMenus(cafe); $event.stopPropagation()"
  ...
></button>
```

#### 7.2 Menu table — row click navigates to preview

**File:** `libs/feature-menus/src/lib/components/menu-page/menu-page.component.html`

```html
<tr
  mat-row
  *matRowDef="let row; columns: displayedColumns"
  class="clickable-row"
  (click)="onPreview(row)"
></tr>
```

**Same SCSS and `$event.stopPropagation()` pattern** as for the cafe table — add `stopPropagation` to all action buttons in the `⋮` menu trigger and menu items.

#### 7.3 Accessibility

Add keyboard support for row navigation:

```html
<tr
  mat-row
  *matRowDef="let row; columns: displayedColumns"
  class="clickable-row"
  tabindex="0"
  role="link"
  (click)="onViewMenus(row)"
  (keydown.enter)="onViewMenus(row)"
  (keydown.space)="onViewMenus(row); $event.preventDefault()"
></tr>
```

#### 7.4 Tests

- Clicking a cafe row navigates to `/cafes/:cafeId/menus`.
- Clicking action buttons does NOT trigger row navigation.
- Pressing Enter/Space on a focused row triggers navigation.

---

## Improvement 8: Add Toolbar Breadcrumb Context (Optional Enhancement)

**Priority:** Low  
**Affected files:** `ToolbarComponent`, `AppComponent`

### Problem

The toolbar only shows "SmartCafe" and links back to home. When the user is deep in menu editing, there's no persistent context indicator showing which cafe they're working with.

### Implementation

This improvement is simplified if Improvement 1 (breadcrumb component) is implemented first, as the breadcrumb already provides this context within the page. However, a lighter alternative is to show a subtitle in the toolbar:

#### 8.1 Show current cafe name in the toolbar

**File:** `apps/admin/src/app/shell/toolbar/toolbar.component.ts`

Inject `CafeStore` and compute the current context:

```typescript
import { Router, NavigationEnd } from '@angular/router';
import { CafeStore } from '@smartcafe/admin/feature-cafes'; // Or a shared service

@Component({ ... })
export class ToolbarComponent {
  private readonly cafeStore = inject(CafeStore);
  protected readonly currentCafeName = computed(() => this.cafeStore.selectedCafe()?.name ?? null);
}
```

**File:** `apps/admin/src/app/shell/toolbar/toolbar.component.html`

```html
<mat-toolbar class="toolbar">
  <button
    matIconButton
    routerLink="/"
    [attr.aria-label]="'app.navigation.home' | translate"
  >
    <mat-icon class="home-icon">restaurant</mat-icon>
  </button>
  <span
    class="app-title"
    routerLink="/"
    >SmartCafe</span
  >
  @if (currentCafeName()) {
  <span class="context-separator">/</span>
  <span class="context-name">{{ currentCafeName() }}</span>
  }
  <span class="spacer"></span>
  <sc-language-selector />
  <sc-theme-switcher />
</mat-toolbar>
```

**Note on library boundaries:** The toolbar lives in `apps/admin/` and can import from feature libraries. However, importing `CafeStore` directly couples the shell to a feature. A cleaner option is to create a lightweight `NavigationContextService` in `shared/data-access` that any feature can push breadcrumb/context data into.

---

## Improvement 9: No Quick Cafe Switching from Menu Pages

**Priority:** Low  
**Affected pages:** `MenuPageComponent`

### Problem

To switch from one cafe's menus to another, the user must go: Back → Cafe list → Select another cafe → View Menus (3 clicks).

### Implementation

#### 9.1 Add a cafe selector dropdown on the menu list page

**File:** `libs/feature-menus/src/lib/components/menu-page/menu-page.component.html`

Add a dropdown next to the page title:

```html
<div class="page-header-left">
  <button
    matIconButton
    (click)="onBack()"
    ...
  >
    <mat-icon>arrow_back</mat-icon>
  </button>
  <h1>{{ 'menus.title' | translate }}</h1>
  <button
    matButton
    [matMenuTriggerFor]="cafeSelector"
    class="cafe-selector-button"
  >
    <span>{{ cafeName() }}</span>
    <mat-icon>arrow_drop_down</mat-icon>
  </button>
  <mat-menu #cafeSelector="matMenu">
    @for (cafe of allCafes(); track cafe.id) {
    <button
      mat-menu-item
      (click)="switchCafe(cafe.id)"
      [class.active]="cafe.id === cafeId()"
    >
      {{ cafe.name }}
    </button>
    }
  </mat-menu>
</div>
```

**File:** `libs/feature-menus/src/lib/components/menu-page/menu-page.component.ts`

```typescript
private readonly cafeStore = inject(CafeStore);

protected readonly allCafes = this.cafeStore.cafes;
protected readonly cafeName = computed(() =>
  this.cafeStore.cafes().find(c => c.id === this.cafeId())?.name ?? ''
);

constructor() {
  // Load cafes if not already loaded
  if (!this.cafeStore.hasCafes()) {
    this.cafeStore.loadCafes();
  }
  // ... existing effect
}

protected switchCafe(cafeId: string): void {
  this.router.navigate(['/cafes', cafeId, 'menus']);
}
```

**Note:** This improvement depends on `CafeStore` being accessible from `feature-menus`. If library boundaries prevent this, use a shared service as described in Improvement 2.

---

## Improvement 10: "Save & Create Another" on Menu Edit Page

**Priority:** Low  
**Affected files:** `MenuEditPageComponent`

### Problem

After saving a new menu, the user is redirected to the menu list. If they want to create another menu immediately, they must click "Create Menu" again.

### Implementation

#### 10.1 Add "Save & Create Another" button (create mode only)

**File:** `libs/feature-menus/src/lib/components/menu-edit-page/menu-edit-page.component.html`

In the `.page-header-actions` div, add the button (only in create mode):

```html
@if (!isEditMode()) {
<button
  matButton
  (click)="onSubmitAndCreateAnother()"
  [disabled]="isFormInvalid() || isSubmitting()"
  data-testid="save-and-new-button"
>
  <mat-icon>add</mat-icon>
  {{ 'menus.form.saveAndCreateAnother' | translate }}
</button>
}
```

#### 10.2 Add handler

**File:** `libs/feature-menus/src/lib/components/menu-edit-page/menu-edit-page.component.ts`

```typescript
protected async onSubmitAndCreateAnother(): Promise<void> {
  if (this.menuForm.invalid || this.isSubmitting()) {
    this.menuForm.markAllAsTouched();
    return;
  }

  const cafeId = this.cafeId();
  if (!cafeId) return;

  this.isSubmitting.set(true);

  try {
    const menuData = this.formBuilder.buildMenuRequest(this.menuForm.value);
    await this.menuStore.createMenu(cafeId, menuData);

    if (!this.menuStore.error()) {
      // Reset form for another creation instead of navigating away
      this.menuForm.reset();
      this.sections.clear();
      this.addSection();
      this.menuForm.markAsPristine();
    }
  } finally {
    this.isSubmitting.set(false);
  }
}
```

#### 10.3 i18n

Add to both `en-US.json` and `uk-UA.json`:

```json
"menus": {
  "form": {
    "saveAndCreateAnother": "Save & New"
  }
}
```

#### 10.4 Tests

- Clicking "Save & New" saves the menu, resets the form, does NOT navigate away.

---

## Implementation Priority Order

Based on impact and effort:

| Order | Improvement                    | Priority | Effort |
| ----- | ------------------------------ | -------- | ------ |
| 1     | **#5** Unsaved changes guard   | High     | Small  |
| 2     | **#2** Cafe name on menu pages | High     | Small  |
| 3     | **#4** Wire Cancel button      | Low      | Tiny   |
| 4     | **#6** Fix Preview back button | Medium   | Small  |
| 5     | **#7** Clickable table rows    | Medium   | Small  |
| 6     | **#3** Edit Cafe action        | Medium   | Medium |
| 7     | **#1** Breadcrumb component    | Medium   | Medium |
| 8     | **#8** Toolbar context         | Low      | Small  |
| 9     | **#9** Quick cafe switching    | Low      | Medium |
| 10    | **#10** Save & Create Another  | Low      | Small  |

---

## Cross-Cutting Concerns

### i18n

All user-facing text must be added to both translation files:

- `apps/admin/public/i18n/en-US.json`
- `apps/admin/public/i18n/uk-UA.json`

### Testing

Every improvement must include:

- Unit tests for new components/services/guards
- Updated tests for modified components
- Accessibility validation (ARIA attributes, keyboard navigation)

Use the patterns established in the existing test files (Vitest, `provideZonelessChangeDetection()`, `fixture.componentRef.setInput()`, `vi.fn()` for mocks).

### Library Boundaries

Respect the Nx library dependency rules:

- `feature-menus` **cannot** import directly from `feature-cafes`
- If cafe data is needed in `feature-menus`, either:
  - Create a shared service in `shared/data-access`
  - Use a route resolver at the `app.routes.ts` level (which is in `apps/`) where cross-feature imports are allowed
  - Pass data through route `data` or `resolve` properties

### Angular Best Practices (from copilot-instructions.md)

- Use `ChangeDetectionStrategy.OnPush` on all new components
- Use signals (`signal`, `computed`, `input`, `output`) for state
- Use `inject()` instead of constructor injection
- Use `@if` / `@for` / `@switch` template syntax (not `*ngIf`, `*ngFor`)
- Use `host: {}` instead of `@HostBinding` / `@HostListener`
- Keep async operations in stores, not components
- Use `data-testid` attributes for test element selection
