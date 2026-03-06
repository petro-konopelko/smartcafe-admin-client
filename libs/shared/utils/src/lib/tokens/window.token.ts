import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('Window', {
  providedIn: 'root',
  factory: () => inject(DOCUMENT).defaultView ?? ({} as Window)
});
