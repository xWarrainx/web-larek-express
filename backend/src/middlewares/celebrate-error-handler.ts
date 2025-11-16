import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';

const celebrateErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isCelebrateError(error)) {
    // Преобразуем celebrate ошибку в единый формат
    return res.status(400).json({
      message: 'Ошибка валидации данных',
    });
  }

  return next(error);
};

export default celebrateErrorHandler;
