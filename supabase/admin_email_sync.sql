-- Adiciona coluna de e-mail ao profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Atualiza os emails antigos puxando de auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Atualiza a trigger para inserir o email ao criar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, balance, email, role)
  VALUES (new.id, 0.00, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
