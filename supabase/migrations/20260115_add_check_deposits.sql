-- Add check_url column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS check_url TEXT;

-- Create check-deposits bucket in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('check-deposits', 'check-deposits', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for check-deposits
CREATE POLICY "Public Check Deposit Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'check-deposits' );

CREATE POLICY "Admin Check Deposit Upload"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'check-deposits' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin Check Deposit Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'check-deposits' 
    AND auth.role() = 'authenticated'
);
