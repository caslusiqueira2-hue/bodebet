ALTER TABLE public.boards ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Backfill existing boards with order based on created_at
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.boards
)
UPDATE public.boards SET sort_order = ordered.rn FROM ordered WHERE boards.id = ordered.id;