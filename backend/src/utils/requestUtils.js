/**
 * Extrai informações de segurança do request de forma segura
 * @param {Object} req - Objeto request do Express
 * @returns {Object} - Informações de IP e User Agent
 */
export function extractRequestInfo(req) {
  const ip = req.ip || 
             req.connection?.remoteAddress || 
             req.socket?.remoteAddress ||
             req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
             'unknown';
             
  const userAgent = req.headers?.['user-agent'] || 'unknown';
  
  return { ip, userAgent };
}

/**
 * Extrai o email do body do request de forma segura
 * @param {Object} req - Objeto request do Express
 * @returns {string|null} - Email ou null se não encontrado
 */
export function extractEmailFromRequest(req) {
  return req.body?.email || null;
}