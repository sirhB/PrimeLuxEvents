# Generating Global Website Images

I have generated new images and updated the website content to use them, giving the site a more premium and consistent look.

## Changes

### New Images Generated
I generated the following images using AI to replace generic placeholders:

-   **Design Consultation**: `/service-design.png` - A close-up of an event planner's desk with gold accents.
-   **Setup & Installation**: `/service-setup.png` - Event staff setting up a banquet table with gold cutlery.

### Existing Assets Utilized
Due to rate limits on image generation, I utilized high-quality existing assets to replace other placeholders:

-   **Delivery**: `/logistics-planning.jpg` (Replaced placeholder)
-   **How It Works - Browse**: `/open-planner.png`
-   **How It Works - Build Quote**: `/design-consultation.jpg`
-   **How It Works - Secure**: `/concierge-service.jpg`
-   **How It Works - Delivery**: `/logistics-planning.jpg`
-   **How It Works - Retrieval**: `/event-breakdown.jpg`

### Code Updates

#### `app/services/page.tsx`
Updated the fallback images to use the new generated assets and the selected existing assets.

```tsx
<Image
  src={content['services.list.design.image'] || "/service-design.png"}
  alt="Design Consultation"
  // ...
/>
```

#### Database Updates
Created a migration file `supabase/migrations/20251122_update_images.sql` to update the `content` table with the new image paths.

```sql
UPDATE content SET value = '/service-design.png' WHERE key = 'services.list.design.image';
-- ... and other updates
```

Updated `supabase/content_seed.sql` to ensure future database resets use the new images.

## Verification
-   **Files Created**: Verified `service-design.png` and `service-setup.png` exist in `public/`.
-   **Code Updated**: Verified `app/services/page.tsx` uses the new paths.
-   **Migration Created**: Verified `supabase/migrations/20251122_update_images.sql` contains the correct SQL updates.
