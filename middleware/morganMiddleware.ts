import morgan, { StreamOptions } from 'morgan';
import logger from '../config/logger';

// Override the stream method by telling Morgan to use our custom logger
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging during tests
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format (use 'combined' for production, 'dev' for development)
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
