import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  untracked,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MenuStore } from '../../store/menu.store';
import {
  LoadingSpinnerComponent,
  ErrorMessageComponent,
} from '@smartcafe/admin/shared/ui';

@Component({
  selector: 'sc-menu-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './menu-form.component.html',
  styleUrl: './menu-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly menuStore = inject(MenuStore);

  readonly cafeId = toSignal(this.route.paramMap.pipe(map((params) => params.get('cafeId') ?? '')));
  readonly menuId = toSignal(this.route.paramMap.pipe(map((params) => params.get('menuId'))));

  protected readonly isEditMode = signal(false);
  protected readonly form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
    });

    effect(() => {
      const menuId = this.menuId();
      const cafeId = this.cafeId();

      if (menuId && cafeId) {
        this.isEditMode.set(true);
        untracked(() => {
          this.loadMenu(cafeId, menuId);
        });
      } else {
        this.isEditMode.set(false);
      }
    });
  }

  private async loadMenu(cafeId: string, menuId: string): Promise<void> {
    await this.menuStore.selectMenu(cafeId, menuId);
    const menu = this.menuStore.selectedMenu();
    if (menu) {
      this.form.patchValue({
        name: menu.name,
      });
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cafeId = this.cafeId();
    if (!cafeId) return;

    const formValue = this.form.value;

    if (this.isEditMode()) {
      const menuId = this.menuId();
      if (menuId) {
        await this.menuStore.updateMenu(cafeId, menuId, {
          name: formValue.name,
          sections: [],
        });
      }
    } else {
      await this.menuStore.createMenu(cafeId, {
        name: formValue.name,
        sections: [],
      });
    }

    this.onCancel();
  }

  protected onCancel(): void {
    const cafeId = this.cafeId();
    this.router.navigate(['/cafes', cafeId, 'menus']);
  }

  protected getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    return '';
  }
}
