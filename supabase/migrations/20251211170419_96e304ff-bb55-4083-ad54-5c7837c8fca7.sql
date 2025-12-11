-- Add acknowledgement column to console_messages
ALTER TABLE public.console_messages 
ADD COLUMN acknowledgement text DEFAULT NULL;

-- Allow users to update acknowledgement on any message
CREATE POLICY "Users can update acknowledgement" 
ON public.console_messages 
FOR UPDATE 
USING (true)
WITH CHECK (true);