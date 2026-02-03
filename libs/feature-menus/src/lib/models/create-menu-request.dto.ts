import { SectionDto } from './section.dto';

export interface CreateMenuRequest {
  name: string;
  sections: SectionDto[];
}
