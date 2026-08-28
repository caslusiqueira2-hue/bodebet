
ALTER TABLE public.athletes
  ADD COLUMN IF NOT EXISTS origin text,
  ADD COLUMN IF NOT EXISTS style text,
  ADD COLUMN IF NOT EXISTS talent text,
  ADD COLUMN IF NOT EXISTS traits jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS legacy integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation text NOT NULL DEFAULT 'unknown';

ALTER TABLE public.career_fights
  ADD COLUMN IF NOT EXISTS position text NOT NULL DEFAULT 'standing',
  ADD COLUMN IF NOT EXISTS opp_last_strategy text,
  ADD COLUMN IF NOT EXISTS player_strategy_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS narrative text;
