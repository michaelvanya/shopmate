import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiVersion } from './middleware/apiVersion.js';
import { setupSwagger } from './config/swagger.js';
import api from './routes/index.js';
import { sequelize } from './models/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cors({ origin: (o, cb) => cb(null, !o || env.origins.includes(o)), credentials: true }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(requestLogger); // structured request/response logging
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.get('/health', (_req, res) => res.json({ ok: true, service: 'identity-api' }));
app.get('/health/ready', async (_req, res) => { try { await sequelize.authenticate(); res.json({ ok: true }); } catch { res.status(503).json({ ok: false }); } }); // for hosting health checks
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api', apiVersion); // API versioning support
app.use('/api', api);
setupSwagger(app); // OpenAPI/Swagger documentation at /api-docs
app.use(notFound);
app.use(errorHandler);

export default app;
