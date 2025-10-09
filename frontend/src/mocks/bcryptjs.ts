// Mock da biblioteca bcryptjs para uso no frontend

export async function hash(data: string, saltOrRounds: number | string) {
  console.warn('bcrypt hash mock called in browser');
  return 'mock-hash-' + data.length;
}

export async function compare(data: string, encrypted: string) {
  console.warn('bcrypt compare mock called in browser');
  console.log('🔐 Mock bcrypt compare - data:', data);
  console.log('🔐 Mock bcrypt compare - encrypted:', encrypted);
  
  // Simular uma verificação mais realista
  // Para testes, vamos aceitar algumas senhas específicas
  const validPasswords = ['123456', 'password', 'admin', 'test'];
  const isValid = validPasswords.includes(data);
  
  console.log('🔐 Mock bcrypt compare - result:', isValid);
  return isValid;
}

export function genSalt(rounds?: number) {
  console.warn('bcrypt genSalt mock called in browser');
  return Promise.resolve('mock-salt');
}

export default { hash, compare, genSalt };