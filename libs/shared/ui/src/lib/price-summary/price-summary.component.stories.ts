import type { Meta, StoryObj } from '@storybook/angular';
import { PriceSummaryComponent } from './price-summary.component';

const meta: Meta<PriceSummaryComponent> = {
  title: 'Shared/UI/PriceSummary',
  component: PriceSummaryComponent,
  tags: ['autodocs'],
  argTypes: {
    originalPrice: {
      control: 'number',
      description: 'Original price before discount'
    },
    finalPrice: {
      control: 'number',
      description: 'Final price after discount'
    },
    discountPercent: {
      control: 'number',
      description: 'Discount percentage'
    },
    currencySymbol: {
      control: 'text',
      description: 'Currency symbol prefix'
    },
    unitLabel: {
      control: 'text',
      description: 'Unit label suffix'
    }
  }
};

export default meta;
type Story = StoryObj<PriceSummaryComponent>;

export const WithDiscount: Story = {
  args: {
    originalPrice: 12.5,
    finalPrice: 10,
    discountPercent: 20,
    currencySymbol: '$',
    unitLabel: 'item'
  }
};

export const WithoutDiscount: Story = {
  args: {
    originalPrice: 10,
    finalPrice: 10,
    discountPercent: 0,
    currencySymbol: '$',
    unitLabel: 'item'
  }
};
