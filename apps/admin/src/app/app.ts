import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './shell/toolbar/toolbar.component';

@Component({
  selector: 'sc-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
