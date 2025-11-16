import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import config from './config';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import celebrateErrorHandler from './middlewares/celebrate-error-handler';
import errorHandler from './middlewares/error-handler';
import notFoundHandler from './middlewares/not-found-handler';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();

// Настраиваем CORS с использованием ORIGIN_ALLOW
app.use(cors({
  origin: config.ORIGIN_ALLOW,
  credentials: true,
}));

// Подключаем парсинг JSON
app.use(express.json());

// Настраиваем статические файлы с использованием UPLOAD_PATH
app.use(`/${config.UPLOAD_PATH}`, express.static(path.join(__dirname, 'public', config.UPLOAD_PATH)));

// Раздаем статические файлы (картинки)
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', requestLogger);

// Подключаем роуты
app.use('/', productRouter);
app.use('/', orderRouter);

app.use('/', errorLogger);

// Обработка celebrate ошибок
app.use(celebrateErrorHandler);

// Подключаем обработку 404 ошибок
app.use(notFoundHandler);

// Подключаем централизованную обработку ошибок
app.use(errorHandler);

// Подключение к MongoDB с использованием DB_ADDRESS
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB connected successfully');
    console.log(`Database: ${config.MONGODB_URI}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

connectDB();

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
  console.log(`API: http://localhost:${config.PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Allowed origin: ${config.ORIGIN_ALLOW}`);
  console.log(`Upload path: ${config.UPLOAD_PATH}`);
});
