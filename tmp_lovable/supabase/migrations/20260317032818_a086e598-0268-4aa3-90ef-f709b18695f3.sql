
-- Create boards table
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Board',
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create board_items table
CREATE TABLE public.board_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image',
  image_url TEXT,
  source_url TEXT,
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  width DOUBLE PRECISION NOT NULL DEFAULT 200,
  height DOUBLE PRECISION NOT NULL DEFAULT 200,
  rotation DOUBLE PRECISION NOT NULL DEFAULT 0,
  z_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_items ENABLE ROW LEVEL SECURITY;

-- Open RLS policies for single-user mode (no auth yet)
CREATE POLICY "Allow all access to boards" ON public.boards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to board_items" ON public.board_items FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-update updated_at on boards
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on board_items.board_id
CREATE INDEX idx_board_items_board_id ON public.board_items(board_id);

-- Create storage bucket for board images
INSERT INTO storage.buckets (id, name, public) VALUES ('board-images', 'board-images', true);

-- Allow public read access to board-images
CREATE POLICY "Public read access for board images" ON storage.objects FOR SELECT USING (bucket_id = 'board-images');

-- Allow anyone to upload to board-images (no auth yet)
CREATE POLICY "Allow uploads to board images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'board-images');

-- Allow anyone to delete from board-images
CREATE POLICY "Allow deletes from board images" ON storage.objects FOR DELETE USING (bucket_id = 'board-images');
