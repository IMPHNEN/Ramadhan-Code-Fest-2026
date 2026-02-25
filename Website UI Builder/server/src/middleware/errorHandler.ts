import type { NextFunction, Request, Response } from 'express';

export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction): void {
  const message = error.message || 'Internal Server Error';
  response.status(400).json({ message });
}
