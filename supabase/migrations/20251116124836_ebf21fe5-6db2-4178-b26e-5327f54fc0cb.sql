-- Create console_messages table for persistent chat
CREATE TABLE public.console_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'message',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.console_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all messages
CREATE POLICY "Anyone can view console messages"
  ON public.console_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON public.console_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete any message (for clear functionality)
CREATE POLICY "Users can delete messages"
  ON public.console_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.console_messages;

-- Create index for faster queries
CREATE INDEX idx_console_messages_created_at ON public.console_messages(created_at DESC);