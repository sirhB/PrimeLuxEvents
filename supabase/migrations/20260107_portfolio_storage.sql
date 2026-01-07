-- Create a bucket for portfolio images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access control for the portfolio bucket
-- Allow public access to view images
CREATE POLICY "Public Access Portfolio"
ON storage.objects FOR SELECT
USING ( bucket_id = 'portfolio' );

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admin Upload Portfolio"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to update/delete images
CREATE POLICY "Admin Update Portfolio"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin Delete Portfolio"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'portfolio' 
    AND auth.role() = 'authenticated'
);
