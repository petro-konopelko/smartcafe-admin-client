import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'sc-error-message',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  readonly title = input<string>('Error');
  readonly message = input<string>('An error occurred. Please try again.');
}
