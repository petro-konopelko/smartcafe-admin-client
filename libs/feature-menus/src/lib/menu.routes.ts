import { Routes } from '@angular/router';

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
      )
  },
  {
    path: ':menuId/edit',
    loadComponent: () =>
      import('./components/menu-edit-page/menu-edit-page.component').then(
        (m) => m.MenuEditPageComponent
      )
  },
  {
    path: ':menuId/preview',
    loadComponent: () =>
      import('./components/menu-preview-page/menu-preview-page.component').then(
        (m) => m.MenuPreviewPageComponent
      )
  }
];
