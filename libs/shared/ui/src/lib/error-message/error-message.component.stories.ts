import type { Meta, StoryObj } from '@storybook/angular';
import { ErrorMessageComponent } from './error-message.component';

const meta: Meta<ErrorMessageComponent> = {
  title: 'Shared/UI/ErrorMessage',
  component: ErrorMessageComponent,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Error title',
    },
    message: {
      control: 'text',
      description: 'Error message details',
    },
  },
};

export default meta;
type Story = StoryObj<ErrorMessageComponent>;

export const Default: Story = {
  args: {
    title: 'Error',
    message: 'An error occurred. Please try again.',
  },
};

export const NetworkError: Story = {
  args: {
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
  },
};

export const ValidationError: Story = {
  args: {
    title: 'Validation Error',
    message: 'Please fill in all required fields correctly.',
  },
};

export const NotFound: Story = {
  args: {
    title: 'Not Found',
    message: 'The requested resource was not found.',
  },
};
