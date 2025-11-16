import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/Product';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';

const getProducts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find();

    const items = products.map((product) => ({
      id: product._id.toString(),
      title: product.title,
      image: product.image,
      category: product.category,
      description: product.description,
      price: product.price,
    }));

    res.json({
      items,
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.json({
      id: product._id.toString(),
      title: product.title,
      image: product.image,
      category: product.category,
      description: product.description,
      price: product.price,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      description, image, title, category, price,
    } = req.body;

    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    const newProduct = new Product({
      description: description || '',
      image: {
        fileName: image.fileName,
        originalName: image.originalName,
      },
      title,
      category,
      price: price !== undefined ? price : null,
    });

    const savedProduct = await newProduct.save();

    const responseData = {
      id: savedProduct._id.toString(),
      title: savedProduct.title,
      image: savedProduct.image,
      category: savedProduct.category,
      description: savedProduct.description,
      price: savedProduct.price,
    };

    res.status(201).json({
      success: true,
      message: 'Товар успешно создан',
      data: responseData,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    if (error instanceof MongooseError.ValidationError) {
      next(new BadRequestError(error.message));
      return;
    }

    next(error);
  }
};

const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.json({
      success: true,
      message: 'Товар успешно обновлен',
      data: updatedProduct,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    if (error instanceof MongooseError.ValidationError) {
      next(new BadRequestError(error.message));
      return;
    }

    next(error);
  }
};

const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.json({
      success: true,
      message: 'Товар успешно удален',
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
