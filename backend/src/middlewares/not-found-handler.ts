import { Request, Response } from 'express';

const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Маршрут не найден',
  });
};

export default notFoundHandler;
