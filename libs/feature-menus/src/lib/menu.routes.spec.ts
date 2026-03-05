import { describe, it, expect } from 'vitest';
import { MENU_ROUTES } from './menu.routes';

describe('MENU_ROUTES', () => {
  it('should define menu feature routes', () => {
    expect(MENU_ROUTES.length).toBe(4);
    expect(MENU_ROUTES.map((route) => route.path)).toEqual([
      '',
      'new',
      ':menuId/edit',
      ':menuId/preview'
    ]);
  });

  it('should lazy load all routes via loadComponent', () => {
    expect(MENU_ROUTES.every((route) => typeof route.loadComponent === 'function')).toBe(true);
  });
});
