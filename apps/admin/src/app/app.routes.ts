import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'cafes',
    pathMatch: 'full',
  },
  {
    path: 'cafes',
    loadChildren: () =>
      import('@smartcafe/admin/feature-cafes').then((m) => m.CAFE_ROUTES),
  },
  {
    path: 'cafes/:cafeId/menus',
    loadChildren: () =>
      import('@smartcafe/admin/feature-menus').then((m) => m.MENU_ROUTES),
  },
];
