import type { Meta, StoryObj } from '@storybook/angular';
import { LoadingSpinnerComponent } from './loading-spinner.component';

const meta: Meta<LoadingSpinnerComponent> = {
  title: 'Shared/UI/LoadingSpinner',
  component: LoadingSpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the spinner',
    },
    message: {
      control: 'text',
      description: 'Optional message to display below the spinner',
    },
  },
};

export default meta;
type Story = StoryObj<LoadingSpinnerComponent>;

export const Small: Story = {
  args: {
    size: 'small',
    message: 'Loading...',
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    message: 'Loading...',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    message: 'Please wait...',
  },
};

export const WithoutMessage: Story = {
  args: {
    size: 'medium',
    message: '',
  },
};
