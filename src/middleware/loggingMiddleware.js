import { addRequestContext } from '../services/logger/index.js';
import morgan from 'morgan';

// Create Morgan middleware with JSON formatting
export const morganMiddleware = morgan(
  (tokens, req, res) => JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number.parseFloat(tokens.status(req, res)),
    content_length: tokens.res(req, res, 'content-length'),
    response_time: Number.parseFloat(tokens['response-time'](req, res)),
  }),
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.http('incoming-request', data);
      },
    },
  }
);

export const loggingMiddleware = (req, res, next) => {
  req.logger = addRequestContext();
  
  // Log request details
  req.logger.http({
    message: 'Incoming request',
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body
  });

  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    req.logger.http({
      message: 'Request completed',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
}; 