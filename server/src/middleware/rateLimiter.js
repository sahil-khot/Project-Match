import rateLimit from 'express-rate-limit';

const formatRateLimitError = (message, code = 'RATE_LIMIT_EXCEEDED') => ({
  success: false,
  message,
  code
});

// Authentication endpoints: 20 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatRateLimitError('Too many authentication attempts. Please try again in 15 minutes.', 'AUTH_RATE_LIMIT_EXCEEDED')
});

// AI Assistant endpoint: 30 requests per 15 minutes
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatRateLimitError('AI assistant request limit exceeded. Please wait a few moments before asking another question.', 'AI_RATE_LIMIT_EXCEEDED')
});

// Messaging endpoint: 60 messages per minute
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatRateLimitError('You are sending messages too quickly. Please pause for a moment.', 'MESSAGE_RATE_LIMIT_EXCEEDED')
});

// Community posts: 30 posts per 15 minutes
export const communityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatRateLimitError('Community posting limit reached. Please wait before creating more posts.', 'COMMUNITY_RATE_LIMIT_EXCEEDED')
});

// General API protection: 300 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatRateLimitError('Too many requests. Please slow down.', 'API_RATE_LIMIT_EXCEEDED')
});
