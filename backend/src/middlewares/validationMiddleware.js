import Joi from 'joi';
import { logError, logSecurity } from '../config/logger.js';
// import xss from 'xss'; // Temporariamente removido para debug

// Configuração segura para XSS
const xssOptions = {
  whiteList: {}, // Lista vazia - remove todas as tags HTML
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
  css: false // Desabilita processamento CSS para evitar erro "ruleset"
};

// Configurações globais do Joi
const joiOptions = {
  abortEarly: false, // Retorna todos os erros, não apenas o primeiro
  allowUnknown: false, // Não permite campos não definidos no schema
  stripUnknown: true, // Remove campos não definidos
  convert: true, // Converte tipos automaticamente quando possível
  errors: {
    wrap: {
      label: '"'
    }
  }
};

// Middleware principal de validação
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], joiOptions);
    
    if (error) {
      // Log de tentativa de dados inválidos
      logSecurity('INVALID_DATA_ATTEMPT', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        property,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })),
        userAgent: req.get('User-Agent')
      });
      
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context?.value
      }));
      
      return res.status(400).json({
        error: 'Dados de entrada inválidos',
        details: errors,
        timestamp: new Date().toISOString()
      });
    }
    
    // Substituir os dados originais pelos dados validados e sanitizados
    req[property] = value;
    next();
  };
};

// Schemas de validação comuns

// Schema para autenticação
export const authSchemas = {
  login: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .max(255)
      .lowercase()
      .trim(),
    password: Joi.string()
      .required()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .message('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
    rememberMe: Joi.boolean().default(false)
  }),
  
  register: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(100)
      .trim()
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      .message('Nome deve conter apenas letras e espaços'),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .max(255)
      .lowercase()
      .trim(),
    password: Joi.string()
      .required()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .message('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha'
      }),
    role: Joi.string()
      .valid('admin', 'user', 'manager')
      .default('user'),
    department: Joi.string()
      .max(100)
      .trim()
      .optional(),
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .message('Telefone deve estar no formato (XX) XXXXX-XXXX')
      .optional()
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .max(255)
      .lowercase()
      .trim()
  }),
  
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .length(64)
      .hex(),
    password: Joi.string()
      .required()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .message('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha'
      })
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .max(128),
    newPassword: Joi.string()
      .required()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .message('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
    confirmNewPassword: Joi.string()
      .required()
      .valid(Joi.ref('newPassword'))
      .messages({
        'any.only': 'Confirmação da nova senha deve ser igual à nova senha'
      })
  })
};

// Schema para usuários
export const userSchemas = {
  create: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(100)
      .trim()
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      .message('Nome deve conter apenas letras e espaços'),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .max(255)
      .lowercase()
      .trim(),
    role: Joi.string()
      .valid('admin', 'user', 'manager')
      .required(),
    department: Joi.string()
      .max(100)
      .trim()
      .optional(),
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .message('Telefone deve estar no formato (XX) XXXXX-XXXX')
      .optional(),
    isActive: Joi.boolean().default(true)
  }),
  
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      .message('Nome deve conter apenas letras e espaços')
      .optional(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(255)
      .lowercase()
      .trim()
      .optional(),
    role: Joi.string()
      .valid('admin', 'user', 'manager')
      .optional(),
    department: Joi.string()
      .max(100)
      .trim()
      .optional(),
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .message('Telefone deve estar no formato (XX) XXXXX-XXXX')
      .optional(),
    isActive: Joi.boolean().optional()
  }).min(1) // Pelo menos um campo deve ser fornecido
};

// Schema para parâmetros de URL
export const paramSchemas = {
  id: Joi.object({
    id: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
      .message('ID deve ser um UUID válido')
  }),
  
  numericId: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
  })
};

// Schema para query parameters
// Primeiro definimos o schema de paginação
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  sort: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
  sortBy: Joi.string()
    .max(50)
    .default('createdAt')
});

// Agora podemos usar o schema de paginação em outros schemas
export const querySchemas = {
  pagination: paginationSchema,
  
  search: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .optional(),
    filter: Joi.string()
      .max(50)
      .optional(),
    status: Joi.string()
      .valid('active', 'inactive', 'pending')
      .optional()
  }).concat(paginationSchema)
};

// Schema para upload de arquivos
export const fileSchemas = {
  upload: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid(
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      .required()
      .messages({
        'any.only': 'Tipo de arquivo não permitido'
      }),
    size: Joi.number()
      .max(10 * 1024 * 1024) // 10MB
      .required()
      .messages({
        'number.max': 'Arquivo muito grande. Máximo 10MB'
      })
  })
};

// Middleware para validar arquivos
export const validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }
  
  const files = req.files || [req.file];
  
  for (const file of files) {
    const { error } = fileSchemas.upload.validate(file);
    
    if (error) {
      logSecurity('INVALID_FILE_UPLOAD', {
        ip: req.ip,
        path: req.path,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        error: error.details[0].message
      });
      
      return res.status(400).json({
        error: 'Arquivo inválido',
        message: error.details[0].message,
        filename: file.originalname
      });
    }
  }
  
  next();
};

// Middleware para sanitização adicional
export const sanitizeInput = (req, res, next) => {
  // Remover caracteres perigosos de strings - temporariamente desabilitado
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str; // Temporariamente desabilitado para debug
  };
  
  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  };
  
  // Sanitizar body, query e params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  
  next();
};

// Exportar middlewares de validação específicos
export const validateLogin = validate(authSchemas.login);
export const validateRegister = validate(authSchemas.register);
export const validateForgotPassword = validate(authSchemas.forgotPassword);
export const validateResetPassword = validate(authSchemas.resetPassword);
export const validateChangePassword = validate(authSchemas.changePassword);

export const validateCreateUser = validate(userSchemas.create);
export const validateUpdateUser = validate(userSchemas.update);

export const validateId = validate(paramSchemas.id, 'params');
export const validateNumericId = validate(paramSchemas.numericId, 'params');

export const validatePagination = validate(querySchemas.pagination, 'query');
export const validateSearch = validate(querySchemas.search, 'query');