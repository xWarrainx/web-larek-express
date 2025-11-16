import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('Error:', error);

  // Если ошибка уже является нашей кастомной ошибкой
  if (error instanceof BadRequestError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof ConflictError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  // Обработка ошибок Mongoose
  if (error instanceof MongooseError.ValidationError) {
    return next(new BadRequestError(error.message));
  }

  if (error instanceof MongooseError.CastError) {
    return res.status(400).json({
      message: 'Некорректный ID',
    });
  }

  // Обработка ошибки дубликата
  if (error instanceof Error && error.message.includes('E11000')) {
    return res.status(409).json({
      message: 'Товар с таким названием уже существует',
    });
  }

  // Для всех остальных ошибок возвращаем 500
  return res.status(500).json({
    message: 'Внутренняя ошибка сервера',
  });
};

export default errorHandler;
