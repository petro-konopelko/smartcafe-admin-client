import { SectionDto } from './section.dto';

export interface UpdateMenuRequest {
  name: string;
  sections: SectionDto[];
}
