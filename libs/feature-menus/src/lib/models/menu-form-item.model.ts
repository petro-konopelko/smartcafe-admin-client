import { ChipItem } from '@smartcafe/admin/shared/ui';
import { PriceUnit } from './price-unit.enum';

export interface MenuFormItem {
  id?: string | null;
  name: string;
  description?: string;
  priceAmount: number;
  priceUnit: PriceUnit;
  discountPercent?: number;
  ingredients: ChipItem[];
}
