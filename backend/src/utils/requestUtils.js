/**
 * Extrai informações de segurança do request de forma segura
 * @param {Object} req - Objeto request do Express
 * @returns {Object} - Informações de IP e User Agent
 */
export function extractRequestInfo(req) {
  let ip = req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
           'unknown';
  
  // Normalizar IPv6 para evitar problemas com rate limiting
  if (ip && ip !== 'unknown') {
    // Remover prefixo IPv4-mapped IPv6 se presente
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }
    // Para IPv6 local, usar um identificador consistente
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = 'localhost';
    }
    // Para outros IPs IPv6, usar apenas os primeiros 64 bits para rate limiting
    if (ip.includes(':') && !ip.includes('.')) {
      const parts = ip.split(':');
      if (parts.length > 4) {
        ip = parts.slice(0, 4).join(':') + '::';
      }
    }
  }
             
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