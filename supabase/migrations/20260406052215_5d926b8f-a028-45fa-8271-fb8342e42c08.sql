
-- Create timestamp update function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  transcript TEXT NOT NULL DEFAULT '',
  summary TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  decisions JSONB DEFAULT '[]'::jsonb,
  key_points JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own meetings" ON public.meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON public.meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON public.meetings FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster user queries
CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX idx_meetings_created_at ON public.meetings(created_at DESC);
