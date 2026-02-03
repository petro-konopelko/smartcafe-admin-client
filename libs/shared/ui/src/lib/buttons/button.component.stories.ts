import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Shared/UI/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text', 'icon'],
      description: 'Button variant style'
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled'
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for screen readers'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether button should take full width'
    }
  }
};

export default meta;
type Story = StoryObj<ButtonComponent>;

/**
 * Default filled button - primary action style
 */
export const Filled: Story = {
  args: {
    variant: 'filled'
  },
  render: (args) => ({
    props: args,
    template: `<sc-button [variant]="variant" [disabled]="disabled">Save Changes</sc-button>`
  })
};

/**
 * Outlined button - secondary action style
 */
export const Outlined: Story = {
  args: {
    variant: 'outlined'
  },
  render: (args) => ({
    props: args,
    template: `<sc-button [variant]="variant" [disabled]="disabled">Cancel</sc-button>`
  })
};

/**
 * Text button - tertiary action style with minimal emphasis
 */
export const Text: Story = {
  args: {
    variant: 'text'
  },
  render: (args) => ({
    props: args,
    template: `<sc-button [variant]="variant" [disabled]="disabled">Learn More</sc-button>`
  })
};

/**
 * Icon button - for actions represented by icons only
 */
export const Icon: Story = {
  args: {
    variant: 'icon',
    ariaLabel: 'Delete'
  },
  render: (args) => ({
    props: args,
    template: `
      <sc-button [variant]="variant" [disabled]="disabled" [ariaLabel]="ariaLabel">
        <span class="material-symbols-rounded">delete</span>
      </sc-button>
    `
  })
};

/**
 * Button with icon and text
 */
export const WithIcon: Story = {
  args: {
    variant: 'filled'
  },
  render: (args) => ({
    props: args,
    template: `
      <sc-button [variant]="variant" [disabled]="disabled">
        <span class="material-symbols-rounded">add</span>
        Add Item
      </sc-button>
    `
  })
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    variant: 'filled',
    disabled: true
  },
  render: (args) => ({
    props: args,
    template: `<sc-button [variant]="variant" [disabled]="disabled">Disabled Button</sc-button>`
  })
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    variant: 'filled',
    fullWidth: true
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 400px; padding: 20px;">
        <sc-button [variant]="variant" [fullWidth]="fullWidth">Submit Form</sc-button>
      </div>
    `
  })
};

/**
 * All button variants together
 */
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center; padding: 20px; flex-wrap: wrap;">
        <sc-button variant="filled">Filled</sc-button>
        <sc-button variant="outlined">Outlined</sc-button>
        <sc-button variant="text">Text</sc-button>
        <sc-button variant="icon" ariaLabel="Delete">
          <span class="material-symbols-rounded">delete</span>
        </sc-button>
      </div>
    `
  })
};

/**
 * Button group example
 */
export const ButtonGroup: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; padding: 20px;">
        <sc-button variant="outlined">Cancel</sc-button>
        <sc-button variant="filled">Save</sc-button>
      </div>
    `
  })
};

/**
 * Icon buttons group (toolbar example)
 */
export const IconButtonGroup: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 4px; padding: 20px;">
        <sc-button variant="icon" ariaLabel="Edit">
          <span class="material-symbols-rounded">edit</span>
        </sc-button>
        <sc-button variant="icon" ariaLabel="Share">
          <span class="material-symbols-rounded">share</span>
        </sc-button>
        <sc-button variant="icon" ariaLabel="Delete">
          <span class="material-symbols-rounded">delete</span>
        </sc-button>
      </div>
    `
  })
};

/**
 * Dark theme example
 */
export const DarkTheme: Story = {
  render: () => ({
    template: `
      <div class="dark-theme" style="background: #111318; padding: 20px; display: flex; gap: 12px; align-items: center;">
        <sc-button variant="filled">Filled</sc-button>
        <sc-button variant="outlined">Outlined</sc-button>
        <sc-button variant="text">Text</sc-button>
        <sc-button variant="icon" ariaLabel="Settings">
          <span class="material-symbols-rounded">settings</span>
        </sc-button>
      </div>
    `
  })
};
