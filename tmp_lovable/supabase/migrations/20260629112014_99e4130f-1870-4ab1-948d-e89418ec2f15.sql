
-- Cleanup legacy mood-board schema from previous project
DROP TABLE IF EXISTS public.board_items CASCADE;
DROP TABLE IF EXISTS public.boards CASCADE;

-- =========================================================
-- BJJ LEGACY — schema
-- =========================================================

-- Athletes (career save slot)
CREATE TABLE public.athletes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  belt TEXT NOT NULL DEFAULT 'white',
  weight_class TEXT NOT NULL,
  age_months INTEGER NOT NULL DEFAULT 216, -- 18 years
  attrs JSONB NOT NULL DEFAULT '{}'::jsonb,
  titles_count INTEGER NOT NULL DEFAULT 0,
  retired BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.athletes TO authenticated;
GRANT ALL ON public.athletes TO service_role;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner read athletes" ON public.athletes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert athletes" ON public.athletes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update athletes" ON public.athletes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner delete athletes" ON public.athletes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_athletes_updated BEFORE UPDATE ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Real opponents catalog (public read)
CREATE TABLE public.opponents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  weight_class TEXT NOT NULL,
  belt TEXT NOT NULL DEFAULT 'black',
  era_start INTEGER NOT NULL,
  era_end INTEGER NOT NULL,
  style TEXT NOT NULL, -- 'guard' | 'pass' | 'takedown' | 'balanced'
  attrs JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.opponents TO anon, authenticated;
GRANT ALL ON public.opponents TO service_role;
ALTER TABLE public.opponents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read opponents" ON public.opponents FOR SELECT TO anon, authenticated USING (true);

-- Championship editions catalog (public read)
CREATE TABLE public.championships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL, -- 'Mundial' | 'Pan' | 'Europeu' | 'Brasileiro'
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event, year)
);

GRANT SELECT ON public.championships TO anon, authenticated;
GRANT ALL ON public.championships TO service_role;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read championships" ON public.championships FOR SELECT TO anon, authenticated USING (true);

-- Career fights log
CREATE TABLE public.career_fights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  championship_id UUID REFERENCES public.championships(id) ON DELETE SET NULL,
  championship_label TEXT NOT NULL,
  category TEXT NOT NULL,
  round_index INTEGER NOT NULL, -- 0=oitavas... last=final
  opponent_name TEXT NOT NULL,
  opponent_team TEXT NOT NULL,
  opponent_attrs JSONB NOT NULL,
  opponent_style TEXT NOT NULL,
  athlete_score INTEGER NOT NULL DEFAULT 0,
  opponent_score INTEGER NOT NULL DEFAULT 0,
  rounds_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'won' | 'lost'
  method TEXT, -- 'points' | 'submission' | 'decision'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_fights TO authenticated;
GRANT ALL ON public.career_fights TO service_role;
ALTER TABLE public.career_fights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read fights" ON public.career_fights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert fights" ON public.career_fights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update fights" ON public.career_fights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner delete fights" ON public.career_fights FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_fights_updated BEFORE UPDATE ON public.career_fights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Career championship results
CREATE TABLE public.career_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  championship_label TEXT NOT NULL,
  category TEXT NOT NULL,
  placement INTEGER NOT NULL, -- 1,2,3,5 etc
  belt_at_event TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_results TO authenticated;
GRANT ALL ON public.career_results TO service_role;
ALTER TABLE public.career_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read results" ON public.career_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert results" ON public.career_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner delete results" ON public.career_results FOR DELETE USING (auth.uid() = user_id);

-- =========================================================
-- Seed: championships (IBJJF historic editions)
-- =========================================================
INSERT INTO public.championships (event, year) 
SELECT e, y FROM (VALUES ('Mundial'), ('Pan'), ('Europeu'), ('Brasileiro')) AS ev(e)
CROSS JOIN generate_series(2005, 2024) AS y;

-- =========================================================
-- Seed: real opponents (curated subset)
-- attrs JSON keys: guard, pass, takedown, submission, cardio, defense, mental (0-100)
-- =========================================================
INSERT INTO public.opponents (name, team, weight_class, belt, era_start, era_end, style, attrs) VALUES
('Roger Gracie', 'Gracie Barra', 'super-heavy', 'black', 2004, 2014, 'pass', '{"guard":85,"pass":98,"takedown":80,"submission":97,"cardio":92,"defense":95,"mental":98}'),
('Marcus Buchecha', 'Checkmat', 'super-heavy', 'black', 2010, 2022, 'balanced', '{"guard":94,"pass":95,"takedown":78,"submission":92,"cardio":94,"defense":94,"mental":96}'),
('Leandro Lo', 'NS Brotherhood', 'medium-heavy', 'black', 2010, 2022, 'guard', '{"guard":98,"pass":90,"takedown":82,"submission":86,"cardio":95,"defense":94,"mental":96}'),
('Rodolfo Vieira', 'GFTeam', 'medium-heavy', 'black', 2010, 2016, 'pass', '{"guard":80,"pass":97,"takedown":92,"submission":85,"cardio":90,"defense":92,"mental":90}'),
('Bernardo Faria', 'Alliance', 'super-heavy', 'black', 2010, 2017, 'guard', '{"guard":97,"pass":88,"takedown":70,"submission":85,"cardio":90,"defense":92,"mental":94}'),
('Romulo Barral', 'Gracie Barra', 'medium-heavy', 'black', 2006, 2016, 'guard', '{"guard":96,"pass":88,"takedown":74,"submission":90,"cardio":88,"defense":92,"mental":92}'),
('Cobrinha Charles', 'Alliance', 'feather', 'black', 2006, 2018, 'balanced', '{"guard":95,"pass":92,"takedown":80,"submission":93,"cardio":97,"defense":92,"mental":95}'),
('Rafael Mendes', 'Atos', 'feather', 'black', 2008, 2015, 'guard', '{"guard":98,"pass":92,"takedown":82,"submission":96,"cardio":94,"defense":94,"mental":96}'),
('Bruno Malfacine', 'Alliance', 'rooster', 'black', 2006, 2020, 'balanced', '{"guard":95,"pass":94,"takedown":85,"submission":92,"cardio":96,"defense":94,"mental":97}'),
('Caio Terra', 'Caio Terra Association', 'rooster', 'black', 2008, 2018, 'guard', '{"guard":96,"pass":85,"takedown":72,"submission":90,"cardio":92,"defense":90,"mental":93}'),
('Guilherme Mendes', 'Atos', 'light-feather', 'black', 2008, 2014, 'balanced', '{"guard":94,"pass":90,"takedown":80,"submission":90,"cardio":92,"defense":92,"mental":92}'),
('Lucas Lepri', 'Alliance', 'light', 'black', 2008, 2022, 'pass', '{"guard":88,"pass":97,"takedown":82,"submission":88,"cardio":94,"defense":95,"mental":96}'),
('JT Torres', 'Essential', 'light', 'black', 2012, 2024, 'balanced', '{"guard":90,"pass":92,"takedown":85,"submission":88,"cardio":93,"defense":91,"mental":92}'),
('Michael Langhi', 'Alliance', 'light', 'black', 2008, 2016, 'guard', '{"guard":95,"pass":86,"takedown":75,"submission":88,"cardio":88,"defense":90,"mental":90}'),
('Claudio Calasans', 'Atos', 'medium-heavy', 'black', 2008, 2020, 'takedown', '{"guard":85,"pass":90,"takedown":97,"submission":85,"cardio":92,"defense":92,"mental":93}'),
('Andre Galvao', 'Atos', 'medium-heavy', 'black', 2004, 2016, 'pass', '{"guard":88,"pass":96,"takedown":90,"submission":90,"cardio":94,"defense":94,"mental":96}'),
('Xande Ribeiro', 'Ribeiro JJ', 'heavy', 'black', 2005, 2018, 'pass', '{"guard":90,"pass":95,"takedown":82,"submission":92,"cardio":92,"defense":95,"mental":95}'),
('Saulo Ribeiro', 'Ribeiro JJ', 'medium-heavy', 'black', 2000, 2012, 'balanced', '{"guard":92,"pass":92,"takedown":80,"submission":92,"cardio":90,"defense":94,"mental":95}'),
('Fabricio Werdum', 'Werdum Combat', 'super-heavy', 'black', 2000, 2010, 'balanced', '{"guard":88,"pass":88,"takedown":82,"submission":92,"cardio":88,"defense":90,"mental":92}'),
('Felipe Pena', 'Alliance', 'heavy', 'black', 2013, 2024, 'balanced', '{"guard":93,"pass":92,"takedown":80,"submission":96,"cardio":92,"defense":92,"mental":94}'),
('Keenan Cornelius', 'Atos / Legion', 'medium-heavy', 'black', 2012, 2020, 'guard', '{"guard":97,"pass":85,"takedown":72,"submission":92,"cardio":90,"defense":92,"mental":92}'),
('Gui Mendes', 'Atos', 'light-feather', 'black', 2008, 2014, 'pass', '{"guard":92,"pass":94,"takedown":82,"submission":90,"cardio":92,"defense":92,"mental":92}'),
('Mahamed Aly', 'LEAD BJJ', 'super-heavy', 'black', 2014, 2022, 'pass', '{"guard":82,"pass":95,"takedown":85,"submission":86,"cardio":90,"defense":90,"mental":90}'),
('Erberth Santos', 'Atos', 'super-heavy', 'black', 2015, 2022, 'pass', '{"guard":85,"pass":96,"takedown":88,"submission":88,"cardio":90,"defense":88,"mental":85}'),
('Tarsis Humphreys', 'Alliance', 'medium-heavy', 'black', 2008, 2016, 'pass', '{"guard":86,"pass":92,"takedown":85,"submission":86,"cardio":90,"defense":90,"mental":90}'),
('Sergio Moraes', 'Alliance', 'middle', 'black', 2005, 2014, 'balanced', '{"guard":90,"pass":90,"takedown":85,"submission":88,"cardio":90,"defense":92,"mental":92}'),
('Otavio Sousa', 'Gracie Barra', 'middle', 'black', 2010, 2020, 'pass', '{"guard":86,"pass":94,"takedown":82,"submission":86,"cardio":90,"defense":92,"mental":92}'),
('Isaque Bahiense', 'Alliance', 'middle', 'black', 2016, 2024, 'balanced', '{"guard":90,"pass":92,"takedown":86,"submission":88,"cardio":92,"defense":90,"mental":91}'),
('Lucas Hulk Barbosa', 'Atos', 'super-heavy', 'black', 2014, 2024, 'pass', '{"guard":85,"pass":96,"takedown":86,"submission":88,"cardio":92,"defense":92,"mental":92}'),
('Tainan Dalpra', 'Atos', 'middle', 'black', 2020, 2024, 'pass', '{"guard":90,"pass":97,"takedown":85,"submission":90,"cardio":94,"defense":93,"mental":93}'),
('Meyram Maquine', 'Cicero Costha', 'light-feather', 'black', 2018, 2024, 'balanced', '{"guard":92,"pass":91,"takedown":85,"submission":91,"cardio":93,"defense":91,"mental":92}'),
('Paulo Miyao', 'Cicero Costha / PSLPB', 'light-feather', 'black', 2012, 2022, 'guard', '{"guard":97,"pass":85,"takedown":74,"submission":90,"cardio":93,"defense":92,"mental":92}'),
('Joao Miyao', 'Cicero Costha / PSLPB', 'rooster', 'black', 2012, 2022, 'guard', '{"guard":97,"pass":84,"takedown":74,"submission":90,"cardio":93,"defense":92,"mental":92}'),
('Gabriel Arges', 'Gracie Barra', 'light', 'black', 2014, 2022, 'pass', '{"guard":88,"pass":93,"takedown":82,"submission":88,"cardio":90,"defense":91,"mental":90}'),
('Diego Borges', 'Gracie Humaita', 'feather', 'black', 2008, 2016, 'guard', '{"guard":92,"pass":86,"takedown":76,"submission":88,"cardio":88,"defense":88,"mental":88}');
