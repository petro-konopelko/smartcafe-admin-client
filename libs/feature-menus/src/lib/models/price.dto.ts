import { PriceUnit } from './price-unit.enum';

export interface PriceDto {
  amount: number;
  unit: PriceUnit;
  discountPercent: number;
}
