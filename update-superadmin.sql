-- Atualizar usuário Luan Kelvin para super_admin
UPDATE profiles
SET 
  role = 'super_admin',
  permissions = '["*"]'::jsonb,
  full_name = 'Luan Kelvin'
WHERE email = 'Luankelvin@soumedstaff.com';

-- Verificar a atualização
SELECT id, name, email, role, permissions
FROM profiles
WHERE email = 'Luankelvin@soumedstaff.com';
