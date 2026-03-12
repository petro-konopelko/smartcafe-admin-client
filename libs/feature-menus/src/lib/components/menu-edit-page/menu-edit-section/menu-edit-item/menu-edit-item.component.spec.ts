import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenuEditItemComponent } from './menu-edit-item.component';
import { PriceUnit } from '../../../../models';

function createItemForm(): FormGroup {
  return new FormGroup({
    id: new FormControl('item-1'),
    name: new FormControl('Test Item'),
    description: new FormControl('A test menu item'),
    priceAmount: new FormControl(15.5),
    priceUnit: new FormControl(PriceUnit.PerItem),
    discountPercent: new FormControl(10),
    ingredients: new FormControl([{ id: '1', name: 'Salt' }]),
    imageFile: new FormControl(null)
  });
}

describe('MenuEditItemComponent', () => {
  let component: MenuEditItemComponent;
  let fixture: ComponentFixture<MenuEditItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuEditItemComponent, ReactiveFormsModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuEditItemComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('itemForm', createItemForm());
    fixture.componentRef.setInput('itemIndex', 0);
    fixture.componentRef.setInput('sectionIndex', 0);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive item form input', () => {
    expect(component.itemForm()).toBeTruthy();
    expect(component.itemForm().get('name')?.value).toBe('Test Item');
  });

  it('should compute description preview from form', () => {
    expect(component.descriptionPreview()).toBe('A test menu item');
  });

  it('should compute original price from form', () => {
    expect(component.originalPrice()).toBe(15.5);
  });

  it('should compute discount percent from form', () => {
    expect(component.discountPercent()).toBe(10);
  });

  it('should compute calculated price with discount', () => {
    const calculated = component.calculatedPrice();
    const expectedPrice = 15.5 - (15.5 * 10) / 100;
    expect(calculated.amount).toBeCloseTo(expectedPrice, 2);
  });

  it('should start not collapsed', () => {
    expect(component.isCollapsed()).toBe(false);
  });

  it('should toggle collapsed state', () => {
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(true);
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(false);
  });

  it('should start with no image preview', () => {
    expect(component.imagePreview()).toBeNull();
  });

  it('should remove image preview', () => {
    component['imagePreview'].set('data:image/png;base64,abc');
    expect(component.imagePreview()).toBe('data:image/png;base64,abc');

    component.removeImage();
    expect(component.imagePreview()).toBeNull();
  });

  it('should emit removeItem output', () => {
    const spy = vi.fn();
    component.removeItem.subscribe(spy);
    component.removeItem.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should clamp discount percent to valid range', () => {
    component.itemForm().get('discountPercent')?.setValue(150);
    fixture.detectChanges();
    expect(component.discountPercent()).toBe(100);
    expect(component.calculatedPrice().amount).toBe(0);
  });

  it('should handle zero price', () => {
    component.itemForm().get('priceAmount')?.setValue(0);
    fixture.detectChanges();
    expect(component.originalPrice()).toBe(0);
    expect(component.calculatedPrice().amount).toBe(0);
  });

  it('should update computed values when form changes', () => {
    component.itemForm().get('priceAmount')?.setValue(20);
    component.itemForm().get('discountPercent')?.setValue(25);
    fixture.detectChanges();

    expect(component.originalPrice()).toBe(20);
    expect(component.discountPercent()).toBe(25);
    expect(component.calculatedPrice().amount).toBeCloseTo(15, 2);
  });
});
