import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MenuEditSectionComponent } from './menu-edit-section.component';

function createSectionForm(): FormGroup {
  return new FormGroup({
    id: new FormControl('section-1'),
    name: new FormControl('Test Section'),
    availableFrom: new FormControl('09:00'),
    availableTo: new FormControl('22:00'),
    items: new FormArray([
      new FormGroup({
        id: new FormControl('item-1'),
        name: new FormControl('Item 1'),
        description: new FormControl(''),
        priceAmount: new FormControl(10),
        priceUnit: new FormControl('PerItem'),
        discountPercent: new FormControl(0),
        ingredients: new FormControl([])
      })
    ])
  });
}

describe('MenuEditSectionComponent', () => {
  let component: MenuEditSectionComponent;
  let fixture: ComponentFixture<MenuEditSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MenuEditSectionComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuEditSectionComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('sectionForm', createSectionForm());
    fixture.componentRef.setInput('sectionIndex', 0);
    fixture.componentRef.setInput('isExpanded', true);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive section form input', () => {
    expect(component.sectionForm()).toBeTruthy();
    expect(component.sectionForm().get('name')?.value).toBe('Test Section');
  });

  it('should receive section index input', () => {
    expect(component.sectionIndex()).toBe(0);
  });

  it('should receive isExpanded input', () => {
    expect(component.isExpanded()).toBe(true);
  });

  it('should return items FormArray', () => {
    const items = component.items;
    expect(items).toBeInstanceOf(FormArray);
    expect(items.length).toBe(1);
  });

  it('should emit removeSection output', () => {
    const spy = vi.fn();
    component.removeSection.subscribe(spy);
    component.removeSection.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit toggleExpand output', () => {
    const spy = vi.fn();
    component.toggleExpand.subscribe(spy);
    component.toggleExpand.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit addItem output', () => {
    const spy = vi.fn();
    component.addItem.subscribe(spy);
    component.addItem.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit removeItem output with index', () => {
    const spy = vi.fn();
    const itemIndex = 0;
    component.removeItem.subscribe(spy);
    component.removeItem.emit(itemIndex);
    expect(spy).toHaveBeenCalledWith(itemIndex);
  });
});
