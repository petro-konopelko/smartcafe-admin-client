import { PriceDto } from './price.dto';
import { MenuItemImageDto } from './menu-item-image.dto';
import { IngredientDto } from './ingredient.dto';

export interface MenuItemDto {
  id: string | null;
  name: string;
  description: string | null;
  price: PriceDto;
  image: MenuItemImageDto | null;
  ingredients: IngredientDto[];
}
