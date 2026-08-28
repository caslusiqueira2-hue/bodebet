
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS unspent_xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.career_fights ADD COLUMN IF NOT EXISTS time_left_seconds integer NOT NULL DEFAULT 600;
ALTER TABLE public.career_fights ADD COLUMN IF NOT EXISTS bracket jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.career_fights ADD COLUMN IF NOT EXISTS started boolean NOT NULL DEFAULT false;
