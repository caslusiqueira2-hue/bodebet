-- 1. Garante que a extensão pgcrypto está ativa (necessária para realizar o hash seguro da senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Adiciona a coluna 'role' na tabela profiles, caso ainda não exista
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 3. Bloco anônimo para criar ou atualizar o usuário administrador
DO $$
DECLARE
  admin_uid uuid := gen_random_uuid();
  admin_email text := 'christianlucas12@gmail.com';
  admin_password text := '123456';
  existing_uid uuid;
BEGIN
  -- Verifica se o usuário já existe na tabela de autenticação
  SELECT id INTO existing_uid FROM auth.users WHERE email = admin_email;

  IF existing_uid IS NULL THEN
    -- Cria o usuário no Supabase Auth de forma 100% segura
    -- A função crypt(...) aplica um HASH BCRYPT forte na senha (nunca salvando em texto puro)
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_uid, 'authenticated', 'authenticated', admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(), 
      '{"provider": "email", "providers": ["email"]}', '{"role": "admin"}', 
      now(), now()
    );

    -- Cria a identidade para permitir o login por e-mail e senha
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      admin_uid::text, admin_uid, format('{"sub":"%s","email":"%s"}', admin_uid::text, admin_email)::jsonb, 'email', now(), now(), now()
    );

    -- Verifica se a trigger já criou o perfil automaticamente.
    -- Se não existir, cria o perfil com a role 'admin'. Se existir, atualiza.
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_uid) THEN
      INSERT INTO public.profiles (id, balance, role) VALUES (admin_uid, 0.00, 'admin');
    ELSE
      UPDATE public.profiles SET role = 'admin' WHERE id = admin_uid;
    END IF;

  ELSE
    -- Se o e-mail já existir, garantimos que a senha será atualizada (com Hash) e a role definida como admin
    UPDATE auth.users 
    SET encrypted_password = crypt(admin_password, gen_salt('bf')), raw_user_meta_data = '{"role": "admin"}'
    WHERE id = existing_uid;
    
    UPDATE public.profiles SET role = 'admin' WHERE id = existing_uid;
  END IF;
END
$$;
