# Mines Game 💣

Este projeto está pronto para ser enviado ao GitHub e hospedado na **Vercel** gratuitamente!
Ele utiliza React, Vite, Tailwind CSS, Supabase (Autenticação + Banco) e Vercel Serverless Functions para o Gateway de Pagamentos.

## 🚀 Passo a Passo para Deploy

### 1. Configurar Supabase
1. No seu projeto do Supabase, vá em **SQL Editor**.
2. Cole o código que está no arquivo `supabase/schema_auth.sql` e execute. (Isso garantirá que novos cadastros ganhem uma carteira com saldo zero).
3. Habilite a autenticação por **Email** na aba de `Authentication` -> `Providers`. (Recomendo desligar temporariamente a "Confirmação de Email" nos testes para facilitar).

### 2. Enviar para o GitHub
Abra seu terminal na pasta do projeto e rode:
```bash
git init
git add .
git commit -m "Initial commit - Mines Game"
git branch -M main
# Troque a URL abaixo pelo seu repositório no Github
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

### 3. Deploy na Vercel
1. Crie uma conta na [Vercel](https://vercel.com/) e faça login.
2. Clique em **Add New... -> Project**.
3. Importe o seu repositório do GitHub.
4. Antes de clicar em Deploy, vá na aba **Environment Variables** e adicione TODAS estas chaves (pegue do seu Supabase e da SigiloPay):

- `VITE_SUPABASE_URL` = (sua url do supabase)
- `VITE_SUPABASE_ANON_KEY` = (sua anon key do supabase)
- `SUPABASE_SERVICE_ROLE_KEY` = (sua service_role_key do supabase - usada pelo backend)
- `SIGILOPAY_PUBLIC_KEY` = (sua public key)
- `SIGILOPAY_SECRET_KEY` = (sua secret key)

5. Clique em **Deploy**.

## 💻 Testando Localmente
A Vercel toma conta do servidor backend (pasta `/api`). Para rodar localmente simulando a Vercel, você pode instalar o Vercel CLI:
```bash
npm i -g vercel
vercel dev
```
