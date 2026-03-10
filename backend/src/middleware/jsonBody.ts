import type { Request, Response, NextFunction } from 'express';

/**
 * Minimal JSON body parser (UTF-8 only). Use when body-parser/iconv-lite is broken.
 */
export function jsonBody(req: Request, res: Response, next: NextFunction) {
  if (req.headers['content-type']?.includes('application/json')) {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        (req as Request & { body: unknown }).body =
          chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
      } catch {
        (req as Request & { body: unknown }).body = {};
      }
      next();
    });
    req.on('error', next);
  } else {
    (req as Request & { body: unknown }).body = {};
    next();
  }
}
