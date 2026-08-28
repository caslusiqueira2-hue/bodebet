-- ============================================================
-- EXECUTE ESTE SQL NO SUPABASE: Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Garante coluna role na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Garante coluna email na tabela profiles  
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 3. Seta role=admin para o email do administrador (funciona mesmo se já existir)
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'christianlucas12@gmail.com' LIMIT 1
);

-- 4. Se o perfil não existir ainda, cria com role=admin
INSERT INTO public.profiles (id, balance, role, email)
SELECT 
  au.id, 
  0, 
  'admin', 
  au.email
FROM auth.users au
WHERE au.email = 'christianlucas12@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

-- Verificação: deve retornar 1 linha com role = 'admin'
SELECT p.id, p.role, au.email
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'christianlucas12@gmail.com';
