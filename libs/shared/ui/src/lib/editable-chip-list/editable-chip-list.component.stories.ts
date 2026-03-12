import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EditableChipListComponent, ChipItem } from './editable-chip-list.component';

const chip = (text: string, checked = false): ChipItem => ({ text, checked });

@Component({
  selector: 'sc-chip-list-wrapper',
  imports: [EditableChipListComponent, ReactiveFormsModule],
  template: `
    <div style="padding: 20px; max-width: 600px;">
      <sc-editable-chip-list
        [formControl]="control"
        [label]="label()"
        [placeholder]="placeholder()"
        [removeTooltip]="removeTooltip()"
        [checkboxTooltip]="checkboxTooltip()"
      />
      <p style="margin-top: 16px; font-size: 12px; color: #666;">
        Form value: {{ control.value | json }}
      </p>
    </div>
  `
})
class ChipListWrapperComponent {
  control = new FormControl<ChipItem[]>([]);
  label = signal('');
  placeholder = signal('Add item...');
  removeTooltip = signal('Remove');
  checkboxTooltip = signal('');
}

const meta: Meta<ChipListWrapperComponent> = {
  title: 'Shared/UI/EditableChipList',
  component: ChipListWrapperComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [EditableChipListComponent, ReactiveFormsModule]
    })
  ]
};

export default meta;
type Story = StoryObj<ChipListWrapperComponent>;

export const Empty: Story = {
  render: () => ({
    props: {
      control: new FormControl<ChipItem[]>([]),
      label: signal('Tags'),
      placeholder: signal('Add a tag...'),
      removeTooltip: signal('Remove'),
      checkboxTooltip: signal('')
    }
  })
};

export const WithItems: Story = {
  render: () => ({
    props: {
      control: new FormControl<ChipItem[]>([chip('Salmon'), chip('Asparagus'), chip('Tomato')]),
      label: signal('Ingredients'),
      placeholder: signal('Add ingredient...'),
      removeTooltip: signal('Remove'),
      checkboxTooltip: signal('Excludable')
    }
  })
};

export const WithCheckedItems: Story = {
  render: () => ({
    props: {
      control: new FormControl<ChipItem[]>([
        chip('Salmon', true),
        chip('Asparagus', false),
        chip('Tomato', true),
        chip('Lemon', false)
      ]),
      label: signal('Ingredients'),
      placeholder: signal('Add ingredient...'),
      removeTooltip: signal('Remove'),
      checkboxTooltip: signal('Excludable')
    }
  })
};

export const ManyItems: Story = {
  render: () => ({
    props: {
      control: new FormControl<ChipItem[]>([
        chip('Salt', true),
        chip('Pepper', true),
        chip('Olive Oil'),
        chip('Garlic', true),
        chip('Onion'),
        chip('Basil'),
        chip('Oregano'),
        chip('Parmesan', true),
        chip('Mozzarella'),
        chip('Tomato Sauce')
      ]),
      label: signal('Ingredients'),
      placeholder: signal('Add ingredient...'),
      removeTooltip: signal('Remove'),
      checkboxTooltip: signal('Excludable')
    }
  })
};

export const WithoutLabel: Story = {
  render: () => ({
    props: {
      control: new FormControl<ChipItem[]>([chip('Salmon'), chip('Asparagus')]),
      label: signal(''),
      placeholder: signal('Add item...'),
      removeTooltip: signal('Remove'),
      checkboxTooltip: signal('')
    }
  })
};

export const Disabled: Story = {
  render: () => {
    const control = new FormControl<ChipItem[]>([
      chip('Salmon', true),
      chip('Asparagus'),
      chip('Tomato', true)
    ]);
    control.disable();
    return {
      props: {
        control,
        label: signal('Ingredients (disabled)'),
        placeholder: signal('Add ingredient...'),
        removeTooltip: signal('Remove'),
        checkboxTooltip: signal('Excludable')
      }
    };
  }
};

export const SingleItem: Story = {
  render: () => ({
    props: {
      control: new FormControl<ChipItem[]>([chip('Salmon', true)]),
      label: signal('Allergens'),
      placeholder: signal('Add allergen...'),
      removeTooltip: signal('Remove'),
      checkboxTooltip: signal('Excludable')
    }
  })
};

export const LongValues: Story = {
  render: () => ({
    props: {
      control: new FormControl<ChipItem[]>([
        chip('Extra Virgin Olive Oil', true),
        chip('Worcestershire Sauce'),
        chip('Sun-Dried Tomatoes', true)
      ]),
      label: signal('Ingredients'),
      placeholder: signal('Add ingredient...'),
      removeTooltip: signal('Remove'),
      checkboxTooltip: signal('Excludable')
    }
  })
};
