import { Request, Response, NextFunction } from 'express';
import mongoose, { Error as MongooseError } from 'mongoose';
import { faker } from '@faker-js/faker';
import Product from '../models/Product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      payment: _payment,
      email: _email,
      phone: _phone,
      address: _address,
      total,
      items,
    } = req.body;

    // Дополнительная валидация (на случай если celebrate пропустит)
    if (!total || typeof total !== 'number') {
      next(new BadRequestError('Total обязателен и должен быть числом'));
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      next(new BadRequestError('Items должен быть непустым массивом'));
      return;
    }

    // Проверяем что все items - валидные строки
    const invalidItems = items.filter((item) => !item || typeof item !== 'string' || item.trim() === '');
    if (invalidItems.length > 0) {
      next(new BadRequestError('Некорректные ID товаров'));
      return;
    }

    // Проверяем существование товаров
    const products = await Product.find({
      _id: { $in: items.map((id: string) => new mongoose.Types.ObjectId(id)) },
    });

    if (products.length !== items.length) {
      next(new BadRequestError('Некоторые товары не найдены'));
      return;
    }

    // Проверяем что товары продаются
    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      next(new BadRequestError('Некоторые товары недоступны для продажи'));
      return;
    }

    // Проверяем сумму
    const calculatedTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);

    if (calculatedTotal !== total) {
      next(new BadRequestError(`Сумма заказа не совпадает. Ожидалось: ${calculatedTotal}, получено: ${total}`));
      return;
    }

    // Генерируем ID заказа
    const orderId = faker.string.uuid();

    // Возвращаем ответ
    res.status(201).json({
      id: orderId,
      total,
    });
  } catch (error) {
    // Обработка ошибок Mongoose
    if (error instanceof MongooseError.CastError) {
      next(new BadRequestError('Некорректный ID товара'));
      return;
    }

    // Обработка JSON parse ошибок
    if (error instanceof SyntaxError) {
      next(new BadRequestError('Некорректный JSON'));
      return;
    }

    next(error);
  }
};

export default createOrder;
