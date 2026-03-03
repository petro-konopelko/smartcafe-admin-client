import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EditableChipListComponent, ChipItem } from './editable-chip-list.component';

const chip = (text: string, checked = false): ChipItem => ({ text, checked });

describe('EditableChipListComponent', () => {
  let component: EditableChipListComponent;
  let fixture: ComponentFixture<EditableChipListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableChipListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditableChipListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default inputs', () => {
    it('should have empty label by default', () => {
      expect(component.label()).toBe('');
    });

    it('should have default placeholder', () => {
      expect(component.placeholder()).toBe('Add item...');
    });

    it('should have default remove tooltip', () => {
      expect(component.removeTooltip()).toBe('Remove');
    });

    it('should start with empty chips', () => {
      expect(component.chips()).toEqual([]);
    });

    it('should not be disabled by default', () => {
      expect(component.isDisabled()).toBe(false);
    });
  });

  describe('writeValue', () => {
    it('should set chips when value is provided', () => {
      const values = [chip('Salmon'), chip('Asparagus')];
      component.writeValue(values);

      expect(component.chips()).toEqual(values);
    });

    it('should set empty array when null is provided', () => {
      component.writeValue(null as unknown as ChipItem[]);

      expect(component.chips()).toEqual([]);
    });

    it('should set empty array when undefined is provided', () => {
      component.writeValue(undefined as unknown as ChipItem[]);

      expect(component.chips()).toEqual([]);
    });
  });

  describe('addChip', () => {
    it('should add a chip when input has value', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.addInputControl.setValue('Salmon');

      component.addChip();

      const expectedChips = [chip('Salmon')];
      expect(component.chips()).toEqual(expectedChips);
      expect(onChangeSpy).toHaveBeenCalledWith(expectedChips);
    });

    it('should trim whitespace from chip value', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.addInputControl.setValue('  Salmon  ');

      component.addChip();

      const expectedChips = [chip('Salmon')];
      expect(component.chips()).toEqual(expectedChips);
      expect(onChangeSpy).toHaveBeenCalledWith(expectedChips);
    });

    it('should not add chip when input is empty', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.addInputControl.setValue('');

      component.addChip();

      expect(component.chips()).toEqual([]);
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('should not add chip when input is only whitespace', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.addInputControl.setValue('   ');

      component.addChip();

      expect(component.chips()).toEqual([]);
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('should clear input after adding chip', () => {
      component.addInputControl.setValue('Salmon');

      component.addChip();

      expect(component.addInputControl.value).toBe('');
    });

    it('should call onTouched when adding chip', () => {
      const onTouchedSpy = vi.fn();
      component.registerOnTouched(onTouchedSpy);
      component.addInputControl.setValue('Salmon');

      component.addChip();

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should append to existing chips', () => {
      component.writeValue([chip('Salmon')]);
      component.addInputControl.setValue('Asparagus');

      component.addChip();

      expect(component.chips()).toEqual([chip('Salmon'), chip('Asparagus')]);
    });

    it('should add new chip with checked set to false', () => {
      component.addInputControl.setValue('Salmon');

      component.addChip();

      expect(component.chips()[0].checked).toBe(false);
    });
  });

  describe('removeChip', () => {
    it('should remove chip at given index', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.writeValue([chip('Salmon'), chip('Asparagus'), chip('Tomato')]);

      component.removeChip(1);

      const expectedChips = [chip('Salmon'), chip('Tomato')];
      expect(component.chips()).toEqual(expectedChips);
      expect(onChangeSpy).toHaveBeenCalledWith(expectedChips);
    });

    it('should call onTouched when removing chip', () => {
      const onTouchedSpy = vi.fn();
      component.registerOnTouched(onTouchedSpy);
      component.writeValue([chip('Salmon')]);

      component.removeChip(0);

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('inline editing', () => {
    it('should update chip text on blur', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.writeValue([chip('Salmon'), chip('Asparagus')]);

      const event = { target: { value: '  Tuna  ' } } as unknown as Event;
      component.updateChipText(0, event);

      const expectedChips = [chip('Tuna'), chip('Asparagus')];
      expect(component.chips()).toEqual(expectedChips);
      expect(onChangeSpy).toHaveBeenCalledWith(expectedChips);
    });

    it('should preserve checked state when updating text', () => {
      component.writeValue([chip('Salmon', true)]);

      const event = { target: { value: 'Tuna' } } as unknown as Event;
      component.updateChipText(0, event);

      expect(component.chips()[0]).toEqual(chip('Tuna', true));
    });

    it('should remove chip when text is cleared', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.writeValue([chip('Salmon'), chip('Asparagus')]);

      const event = { target: { value: '' } } as unknown as Event;
      component.updateChipText(0, event);

      expect(component.chips()).toEqual([chip('Asparagus')]);
      expect(onChangeSpy).toHaveBeenCalled();
    });

    it('should remove chip when text is only whitespace', () => {
      component.writeValue([chip('Salmon')]);

      const event = { target: { value: '   ' } } as unknown as Event;
      component.updateChipText(0, event);

      expect(component.chips()).toEqual([]);
    });

    it('should not trigger onChange when text is unchanged', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.writeValue([chip('Salmon')]);

      const event = { target: { value: 'Salmon' } } as unknown as Event;
      component.updateChipText(0, event);

      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('should call onTouched when text changes', () => {
      const onTouchedSpy = vi.fn();
      component.registerOnTouched(onTouchedSpy);
      component.writeValue([chip('Salmon')]);

      const event = { target: { value: 'Tuna' } } as unknown as Event;
      component.updateChipText(0, event);

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('should add chip on Enter in add input', () => {
      component.addInputControl.setValue('Salmon');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.handleAddKeydown(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(component.chips()).toEqual([chip('Salmon')]);
    });

    it('should blur chip input on Enter', () => {
      const blurSpy = vi.fn();
      const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
        target: { blur: blurSpy }
      } as unknown as KeyboardEvent;

      component.handleChipKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should set disabled state', () => {
      component.setDisabledState(true);

      expect(component.isDisabled()).toBe(true);
      expect(component.addInputControl.disabled).toBe(true);
    });

    it('should re-enable controls', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);

      expect(component.isDisabled()).toBe(false);
      expect(component.addInputControl.enabled).toBe(true);
    });
  });

  describe('rendering', () => {
    it('should display chips in the template', () => {
      component.writeValue([chip('Salmon'), chip('Asparagus')]);
      fixture.detectChanges();

      const chipElements = fixture.nativeElement.querySelectorAll('.chip');
      expect(chipElements).toHaveLength(2);
      expect(chipElements[0].querySelector('.chip-text-input').value).toBe('Salmon');
      expect(chipElements[1].querySelector('.chip-text-input').value).toBe('Asparagus');
    });

    it('should display label when provided', () => {
      fixture.componentRef.setInput('label', 'Ingredients');
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('.chip-list-label');
      expect(labelElement?.textContent).toContain('Ingredients');
    });

    it('should not display label when empty', () => {
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('.chip-list-label');
      expect(labelElement).toBeNull();
    });

    it('should show inline text input and remove button for each chip', () => {
      component.writeValue([chip('Salmon')]);
      fixture.detectChanges();

      const textInput = fixture.nativeElement.querySelector('[data-testid="text-chip-0"]');
      const removeBtn = fixture.nativeElement.querySelector('[data-testid="remove-chip-0"]');

      expect(textInput).toBeTruthy();
      expect((textInput as HTMLInputElement).value).toBe('Salmon');
      expect(removeBtn).toBeTruthy();
    });

    it('should hide add container when disabled', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      const addContainer = fixture.nativeElement.querySelector(
        '[data-testid="add-chip-container"]'
      );
      expect(addContainer).toBeNull();
    });

    it('should have correct aria-label for remove button', () => {
      fixture.componentRef.setInput('removeTooltip', 'Remove');
      component.writeValue([chip('Salmon')]);
      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('[data-testid="remove-chip-0"]');
      expect(removeBtn?.getAttribute('aria-label')).toBe('Remove Salmon');
    });

    it('should show checkbox for each chip', () => {
      component.writeValue([chip('Salmon'), chip('Asparagus')]);
      fixture.detectChanges();

      const checkboxes = fixture.nativeElement.querySelectorAll('[data-testid^="check-chip-"]');
      expect(checkboxes).toHaveLength(2);
    });

    it('should apply checked class when chip is checked', () => {
      component.writeValue([chip('Salmon', true), chip('Asparagus', false)]);
      fixture.detectChanges();

      const chipElements = fixture.nativeElement.querySelectorAll('.chip');
      expect(chipElements[0].classList.contains('checked')).toBe(true);
      expect(chipElements[1].classList.contains('checked')).toBe(false);
    });
  });

  describe('toggleChecked', () => {
    it('should toggle checked state of a chip', () => {
      const onChangeSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.writeValue([chip('Salmon', false), chip('Asparagus', true)]);

      component.toggleChecked(0);

      expect(component.chips()[0].checked).toBe(true);
      expect(component.chips()[1].checked).toBe(true);
      expect(onChangeSpy).toHaveBeenCalled();
    });

    it('should uncheck a checked chip', () => {
      component.writeValue([chip('Salmon', true)]);

      component.toggleChecked(0);

      expect(component.chips()[0].checked).toBe(false);
    });

    it('should call onTouched when toggling', () => {
      const onTouchedSpy = vi.fn();
      component.registerOnTouched(onTouchedSpy);
      component.writeValue([chip('Salmon')]);

      component.toggleChecked(0);

      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });
});

describe('EditableChipListComponent with reactive forms', () => {
  const salmon = chip('Salmon');
  const asparagus = chip('Asparagus');

  @Component({
    template: `<sc-editable-chip-list [formControl]="control" />`,
    imports: [EditableChipListComponent, ReactiveFormsModule]
  })
  class TestHostComponent {
    control = new FormControl<ChipItem[]>([salmon, asparagus]);
  }

  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with form control value', () => {
    const chips = fixture.nativeElement.querySelectorAll('.chip');
    expect(chips).toHaveLength(2);
    expect(chips[0].querySelector('.chip-text-input').value).toBe('Salmon');
    expect(chips[1].querySelector('.chip-text-input').value).toBe('Asparagus');
  });

  it('should update form control when chip is added', () => {
    const addInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '[data-testid="add-chip-input"]'
    );
    addInput.value = 'Tomato';
    addInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('[data-testid="add-chip-button"]');
    addButton.click();
    fixture.detectChanges();

    expect(hostComponent.control.value).toEqual([salmon, asparagus, chip('Tomato')]);
  });

  it('should update form control when chip is removed', () => {
    const removeButton = fixture.nativeElement.querySelector('[data-testid="remove-chip-0"]');
    removeButton.click();
    fixture.detectChanges();

    expect(hostComponent.control.value).toEqual([asparagus]);
  });

  it('should reflect form control value changes', () => {
    hostComponent.control.setValue([chip('A'), chip('B'), chip('C')]);
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('.chip');
    expect(chips).toHaveLength(3);
  });

  it('should disable component when form control is disabled', () => {
    hostComponent.control.disable();
    fixture.detectChanges();

    const addContainer = fixture.nativeElement.querySelector('[data-testid="add-chip-container"]');
    expect(addContainer).toBeNull();
  });
});
