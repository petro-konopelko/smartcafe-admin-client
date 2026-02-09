import { Routes } from '@angular/router';

export const CAFE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/cafe-page/cafe-page.component').then((m) => m.CafePageComponent)
  }
];
