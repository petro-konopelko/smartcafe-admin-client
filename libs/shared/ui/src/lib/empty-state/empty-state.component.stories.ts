import type { Meta, StoryObj } from '@storybook/angular';
import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Shared/UI/EmptyState',
  component: EmptyStateComponent,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Material icon name to display',
    },
    title: {
      control: 'text',
      description: 'Main heading text',
    },
    message: {
      control: 'text',
      description: 'Optional descriptive message',
    },
  },
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
  args: {
    icon: 'inbox',
    title: 'No items found',
    message: '',
  },
};

export const NoCafes: Story = {
  args: {
    icon: 'store',
    title: 'No cafes available',
    message: 'Create your first cafe to get started',
  },
};

export const NoMenus: Story = {
  args: {
    icon: 'restaurant_menu',
    title: 'No menus available',
    message: 'Create a menu to start managing your offerings',
  },
};

export const NoSearchResults: Story = {
  args: {
    icon: 'search_off',
    title: 'No results found',
    message: 'Try adjusting your search criteria',
  },
};

export const NoData: Story = {
  args: {
    icon: 'data_usage',
    title: 'No data available',
    message: 'Data will appear here once available',
  },
};

export const EmptyCart: Story = {
  args: {
    icon: 'shopping_cart',
    title: 'Your cart is empty',
    message: 'Add items to your cart to continue',
  },
};
