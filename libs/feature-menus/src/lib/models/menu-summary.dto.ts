import { MenuState } from './menu-state.enum';

export interface MenuSummaryDto {
  menuId: string;
  name: string;
  state: MenuState;
  createdAt: string;
  updatedAt: string;
}
