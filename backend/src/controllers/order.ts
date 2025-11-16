import { Request, Response, NextFunction } from 'express';
import mongoose, { Error as MongooseError } from 'mongoose';
import { faker } from '@faker-js/faker';
import Product from '../models/Product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    // Проверяем существование товаров
    const products = await Product.find({
      _id: { $in: items.map((id: string) => new mongoose.Types.ObjectId(id)) },
    });

    if (products.length !== items.length) {
      return next(new BadRequestError('Некоторые товары не найдены'));
    }

    // Проверяем что товары продаются
    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      return next(new BadRequestError('Некоторые товары недоступны для продажи'));
    }

    // Проверяем сумму
    const calculatedTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);

    if (calculatedTotal !== total) {
      return next(new BadRequestError(`Сумма заказа не совпадает. Ожидалось: ${calculatedTotal}, получено: ${total}`));
    }

    // Генерируем ID заказа
    const orderId = faker.string.uuid();

    // Возвращаем ответ
    return res.status(201).json({
      id: orderId,
      total,
    });
  } catch (error) {
    // Обработка ошибок Mongoose
    if (error instanceof MongooseError.CastError) {
      return next(new BadRequestError('Некорректный ID товара'));
    }

    return next(error);
  }
};

export default createOrder;
