import { MenuState } from './menu-state.enum';
import { SectionDto } from './section.dto';

export interface MenuDto {
  id: string;
  name: string;
  state: MenuState;
  sections: SectionDto[];
  createdAt: string;
  updatedAt: string;
}
