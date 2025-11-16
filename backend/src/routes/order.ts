import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import createOrder from '../controllers/order';

const router = Router();

router.post('/order', celebrate({
  body: Joi.object({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().min(0).required(),
    items: Joi.array().items(Joi.string()).min(1).required(),
  }),
}), createOrder);

export default router;
