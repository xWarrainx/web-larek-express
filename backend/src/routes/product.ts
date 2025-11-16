import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/products';

const router = Router();

router.get('/product', getProducts);

router.get('/product/:id', celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
}), getProductById);

router.post('/product', celebrate({
  body: Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().min(0).allow(null),
  }),
}), createProduct);

router.patch('/product/:id', celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    title: Joi.string().min(2).max(30),
    image: Joi.object({
      fileName: Joi.string(),
      originalName: Joi.string(),
    }),
    category: Joi.string(),
    description: Joi.string().allow(''),
    price: Joi.number().min(0).allow(null),
  }),
}), updateProduct);

router.delete('/product/:id', celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
}), deleteProduct);

export default router;
