// Mock da biblioteca jsonwebtoken para uso no frontend

export function sign(payload: any, secret: string, options?: any) {
  console.warn('JWT sign mock called in browser');
  return 'mock-jwt-token-' + Date.now();
}

export function verify(token: string, secret: string) {
  console.warn('JWT verify mock called in browser');
  if (token.startsWith('mock-jwt-token-')) {
    return { userId: '1', email: 'user@example.com' };
  }
  throw new Error('Invalid token');
}

export function decode(token: string) {
  console.warn('JWT decode mock called in browser');
  return { userId: '1', email: 'user@example.com' };
}

export default { sign, verify, decode };