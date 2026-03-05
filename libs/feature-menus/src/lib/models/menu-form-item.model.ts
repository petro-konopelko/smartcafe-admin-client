import { ChipItem } from '@smartcafe/admin/shared/ui';

export interface MenuFormItem {
  id?: string | null;
  name: string;
  description?: string;
  priceAmount: number;
  priceUnit: string;
  discountPercent?: number;
  ingredients: ChipItem[];
}
