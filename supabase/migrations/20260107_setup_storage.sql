-- Create a bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access control for the products bucket
-- Allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to update/delete images
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
);
