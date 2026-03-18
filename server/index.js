import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import { verifySupabaseUser } from './middleware/authMiddleware.js';
import { callAstrologyApi } from './services/astrologyApiService.js';
import { generateKundaliAnalysis } from './services/aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

app.use(
  cors({
    origin: isProduction ? true : FRONTEND_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

function validateParams(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Request body must be a JSON object',
    });
    return null;
  }

  const params = req.body.params;
  if (!params || typeof params !== 'object') {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Request body must include a params object',
    });
    return null;
  }

  return params;
}

async function handleAstrologyRequest(req, res, endpointKey) {
  try {
    const params = validateParams(req, res);
    if (!params) return;

    const requestOptions =
      req.body && typeof req.body.options === 'object' && req.body.options
        ? req.body.options
        : {};

    const response = await callAstrologyApi(endpointKey, params, requestOptions);

    res.json({
      success: true,
      endpoint: endpointKey,
      provider: 'AstrologyAPI',
      data: response,
    });
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 502;
    res.status(status).json({
      success: false,
      endpoint: endpointKey,
      provider: 'AstrologyAPI',
      error: 'AstrologyRequestFailed',
      message: error.message,
      status,
    });
  }
}

app.post('/api/astrology/analysis', verifySupabaseUser, async (req, res) => {
  try {
    const { planets, birthDetails } = req.body;
    if (!planets || !birthDetails) {
      return res.status(400).json({ success: false, message: 'Missing planets or birthDetails' });
    }
    const analysis = await generateKundaliAnalysis(planets, birthDetails);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/astrology', verifySupabaseUser, (_req, res) => {
  res.status(400).json({
    success: false,
    error: 'ValidationError',
    message: 'Missing astrology feature key in route. Use /api/astrology/<feature>.',
  });
});

app.post(/^\/api\/astrology\/(.+)$/, verifySupabaseUser, async (req, res) => {
  const feature = req.params?.[0];
  console.log(`[Astrology Proxy] Dynamic Route: ${feature}`);
  await handleAstrologyRequest(req, res, feature);
});

// Explicit error handler to prevent silent crashes
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: err.message
  });
});

app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the app for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Astrology app server running on port ${PORT}`);
  });
}
