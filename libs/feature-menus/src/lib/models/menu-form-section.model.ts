import { MenuFormItem } from './menu-form-item.model';

export interface MenuFormSection {
  id?: string | null;
  name: string;
  availableFrom?: string;
  availableTo?: string;
  items: MenuFormItem[];
}
