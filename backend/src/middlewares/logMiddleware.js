export const logMiddleware = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

export const errorMiddleware = (error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ 
    message: 'Erro interno do servidor' 
  });
};

export const notFoundMiddleware = (req, res) => {
  res.status(404).json({ 
    message: 'Rota não encontrada' 
  });
};