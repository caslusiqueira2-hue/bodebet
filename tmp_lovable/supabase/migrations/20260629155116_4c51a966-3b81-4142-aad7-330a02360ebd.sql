
CREATE TABLE public.worlds_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  weight_class text NOT NULL,
  place smallint NOT NULL CHECK (place BETWEEN 1 AND 4),
  athlete_name text NOT NULL,
  team text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_worlds_results_year_weight ON public.worlds_results (year, weight_class);
CREATE INDEX idx_worlds_results_name ON public.worlds_results (athlete_name);

GRANT SELECT ON public.worlds_results TO anon, authenticated;
GRANT ALL ON public.worlds_results TO service_role;

ALTER TABLE public.worlds_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read of historical results"
  ON public.worlds_results FOR SELECT
  TO anon, authenticated
  USING (true);
