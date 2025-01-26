import { APIError } from 'better-call'

export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_REGISTERED = 'NOT_REGISTERED'
}

// Custom error class
export class GradeError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string
  ) {
    super(message)
    this.name = 'GradeError'
    Object.setPrototypeOf(this, GradeError.prototype)
  }

  static isGradeError(error: unknown): error is GradeError {
    return error instanceof GradeError
  }

  static isAuthError(error: unknown): error is APIError {
    return error instanceof APIError
  }
}
