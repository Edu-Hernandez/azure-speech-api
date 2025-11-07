import type { NextFunction, Request, Response } from 'express';

export const ensureFile =
  (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    let file: Express.Multer.File | undefined = req.file as Express.Multer.File | undefined;

    const files = req.files;

    if (!file && files) {
      if (Array.isArray(files)) {
        file = files[0];
      } else {
        const filesByField = (files as Record<string, Express.Multer.File | Express.Multer.File[]>)[fieldName];
        file = Array.isArray(filesByField) ? filesByField[0] : filesByField;
      }
    }

    if (!file) {
      res.status(400).json({
        message: `El archivo '${fieldName}' es requerido`,
        success: false,
      });
      return;
    }

    req.file = file;
    next();
  };

