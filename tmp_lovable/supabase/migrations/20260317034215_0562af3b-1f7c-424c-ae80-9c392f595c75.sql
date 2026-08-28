
-- Add user_id column to boards
ALTER TABLE public.boards ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to board_items
ALTER TABLE public.board_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old open policies
DROP POLICY IF EXISTS "Allow all access to boards" ON public.boards;
DROP POLICY IF EXISTS "Allow all access to board_items" ON public.board_items;

-- Boards RLS policies
CREATE POLICY "Users can view their own boards"
ON public.boards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards"
ON public.boards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
ON public.boards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
ON public.boards FOR DELETE
USING (auth.uid() = user_id);

-- Board items RLS policies
CREATE POLICY "Users can view their own board items"
ON public.board_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own board items"
ON public.board_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own board items"
ON public.board_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own board items"
ON public.board_items FOR DELETE
USING (auth.uid() = user_id);
