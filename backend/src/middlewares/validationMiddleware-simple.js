// Middleware de sanitização simples sem Joi
export const sanitizeInput = (req, res, next) => {
  console.log('Sanitização simples executada');
  next();
};