-- Add chat_type column to console_messages to distinguish between normal and console chats
ALTER TABLE public.console_messages 
ADD COLUMN chat_type text NOT NULL DEFAULT 'console';

-- Add a check constraint to ensure valid chat types
ALTER TABLE public.console_messages
ADD CONSTRAINT valid_chat_type CHECK (chat_type IN ('normal', 'console'));