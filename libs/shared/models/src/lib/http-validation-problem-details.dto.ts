import { ProblemDetails } from './problem-details.dto';

export interface HttpValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;
}
