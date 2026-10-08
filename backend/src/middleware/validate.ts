import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.issues.map((issue) => {
          // Strip technical scope prefixes like 'body.', 'query.', 'params.'
          const pathSegments = issue.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params');
          const field = pathSegments.join('.');
          return {
            field: field || 'general',
            message: issue.message,
          };
        });

        // Compose user-friendly summary without technical jargon (deduplicated)
        const summaryMessage = [...new Set(fieldErrors.map((f) => f.message))].join('. ');

        res.status(400).json({
          success: false,
          message: `Validation Error: ${summaryMessage || 'Please review and correct the invalid form fields.'}`,
          errors: fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
};

export default validate;
