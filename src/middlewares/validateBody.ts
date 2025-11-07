import type { NextFunction, Request, Response } from 'express';
import { validate } from 'class-validator';

type DtoConstructor<T extends object> = new () => T;

const formatValidationErrors = (errors: Awaited<ReturnType<typeof validate>>) => {
  return errors.flatMap((error) => {
    if (!error.constraints) {
      return [];
    }
    return Object.values(error.constraints);
  });
};

export const validateBody = <T extends object>(DtoClass: DtoConstructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = Object.assign(new DtoClass(), req.body);
      const errors = await validate(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: false,
      });

      if (errors.length > 0) {
        const messages = formatValidationErrors(errors);
        res.status(400).json({
          message: 'Error de validación en el cuerpo de la petición',
          errors: messages,
          success: false,
        });
        return;
      }

      req.body = dtoInstance as Request['body'];
      next();
    } catch (error) {
      next(error);
    }
  };
};

