import { type NextFunction, type Request, type Response } from 'express';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (isMysqlError(error)) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Duplicate record' });
      return;
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(409).json({ message: 'Record is used by another record and cannot be deleted' });
      return;
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ message: 'Referenced record does not exist' });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
}

function isMysqlError(error: unknown): error is { code?: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}
