import { SectionDto } from './section.dto';

export interface CreateMenuRequest {
  name: string;
  description?: string | null;
  sections: SectionDto[];
}
