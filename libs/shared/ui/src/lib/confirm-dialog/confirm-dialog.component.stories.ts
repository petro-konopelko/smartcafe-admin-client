import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Component({
  selector: 'sc-dialog-wrapper',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div style="padding: 20px;">
      <button 
        mat-raised-button 
        color="primary" 
        (click)="openDialog()">
        Open Dialog
      </button>
      <p style="margin-top: 16px; color: #666;">Click the button to see the dialog</p>
    </div>
  `,
})
class DialogWrapperComponent {
  private dialog = inject(MatDialog);
  
  dialogData = signal<ConfirmDialogData>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDangerous: false,
  });

  openDialog() {
    this.dialog.open(ConfirmDialogComponent, {
      data: this.dialogData(),
      width: '400px',
    });
  }
}

const meta: Meta<DialogWrapperComponent> = {
  title: 'Shared/UI/ConfirmDialog',
  component: DialogWrapperComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimationsAsync()],
    }),
    moduleMetadata({
      imports: [MatDialogModule, MatButtonModule, ConfirmDialogComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<DialogWrapperComponent>;

export const Default: Story = {
  render: () => ({
    props: {
      dialogData: signal<ConfirmDialogData>({
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        isDangerous: false,
      }),
    },
  }),
};

export const DeleteCafe: Story = {
  render: () => ({
    props: {
      dialogData: signal<ConfirmDialogData>({
        title: 'Delete Cafe',
        message: 'Are you sure you want to delete "Downtown Cafe"? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDangerous: true,
      }),
    },
  }),
};

export const DeleteMenu: Story = {
  render: () => ({
    props: {
      dialogData: signal<ConfirmDialogData>({
        title: 'Delete Menu',
        message: 'Are you sure you want to delete "Summer Menu 2024"? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDangerous: true,
      }),
    },
  }),
};

export const PublishMenu: Story = {
  render: () => ({
    props: {
      dialogData: signal<ConfirmDialogData>({
        title: 'Publish Menu',
        message: 'Are you sure you want to publish this menu? It will be visible to customers.',
        confirmText: 'Publish',
        cancelText: 'Cancel',
        isDangerous: false,
      }),
    },
  }),
};

export const ActivateMenu: Story = {
  render: () => ({
    props: {
      dialogData: signal<ConfirmDialogData>({
        title: 'Activate Menu',
        message: 'This will deactivate the current active menu. Do you want to continue?',
        confirmText: 'Activate',
        cancelText: 'Cancel',
        isDangerous: false,
      }),
    },
  }),
};

export const DiscardChanges: Story = {
  render: () => ({
    props: {
      dialogData: signal<ConfirmDialogData>({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to leave without saving?',
        confirmText: 'Discard',
        cancelText: 'Keep Editing',
        isDangerous: true,
      }),
    },
  }),
};
