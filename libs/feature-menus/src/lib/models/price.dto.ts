import { PriceUnit } from './price-unit.enum';

export interface PriceDto {
  amount: number;
  currency: string;
  unit: PriceUnit;
  discount: number;
}
