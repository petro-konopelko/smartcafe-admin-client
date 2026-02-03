import { MenuItemDto } from './menu-item.dto';

export interface SectionDto {
  id: string | null;
  name: string;
  availableFrom: string | null;
  availableTo: string | null;
  items: MenuItemDto[];
}
