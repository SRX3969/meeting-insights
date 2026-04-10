ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS sentiment text DEFAULT null,
ADD COLUMN IF NOT EXISTS productivity_score integer DEFAULT null,
ADD COLUMN IF NOT EXISTS participation_insights jsonb DEFAULT null;