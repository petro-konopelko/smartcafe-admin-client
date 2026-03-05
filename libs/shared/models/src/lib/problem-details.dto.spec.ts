import { describe, it, expect } from 'vitest';
import { ProblemDetails } from './problem-details.dto';
import { HttpValidationProblemDetails } from './http-validation-problem-details.dto';

describe('shared models', () => {
  it('should allow valid ProblemDetails shape', () => {
    const problem: ProblemDetails = {
      type: 'about:blank',
      title: 'Validation error',
      status: 400,
      detail: 'Request payload is invalid',
      instance: '/cafes'
    };

    expect(problem.status).toBe(400);
    expect(problem.title).toBe('Validation error');
  });

  it('should allow HttpValidationProblemDetails with errors map', () => {
    const validationProblem: HttpValidationProblemDetails = {
      type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      detail: null,
      instance: '/cafes',
      errors: {
        name: ['Name is required'],
        contactInfo: ['Contact info is too long']
      }
    };

    expect(validationProblem.errors.name[0]).toBe('Name is required');
    expect(Object.keys(validationProblem.errors).length).toBe(2);
  });
});
