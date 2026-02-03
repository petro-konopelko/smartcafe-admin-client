import { Routes } from '@angular/router';

export const MENU_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/menu-list/menu-list.component').then(
        (m) => m.MenuListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/menu-form-page/menu-form-page.component').then(
        (m) => m.MenuFormPageComponent
      ),
  },
  {
    path: ':menuId/edit',
    loadComponent: () =>
      import('./components/menu-form-page/menu-form-page.component').then(
        (m) => m.MenuFormPageComponent
      ),
  },
  {
    path: ':menuId/preview',
    loadComponent: () =>
      import('./components/menu-preview-page/menu-preview-page.component').then(
        (m) => m.MenuPreviewPageComponent
      ),
  },
];
