/**
 * Real public Google reviews of PrimeLux Party Rentals (2 Research Dr, Shelton, CT).
 * Quotes are verbatim (trimmed with an ellipsis only). Do not reword.
 * Found via public mirrors of the Google Business Profile (see reviews-found.md);
 * re-check against the live Google profile before launch.
 */
export type Review = {
  name: string
  rating: number
  quote: string
  source: 'Google'
  url: string
}

export const GOOGLE_PROFILE_URL =
  'https://www.google.com/maps/search/?api=1&query=PrimeLux+Party+Rentals+2+Research+Dr+Shelton+CT'

export const REVIEWS: Review[] = [
  {
    name: 'Trudy Guy',
    rating: 5,
    quote: 'I’ve used Prime Luxe for a few years now and I could not be happier. They are my go-to place for my event planning. Their inventory is top-notch and their customer service is even better…',
    source: 'Google',
    url: GOOGLE_PROFILE_URL,
  },
  {
    name: 'Lerona Little',
    rating: 5,
    quote: 'I provided my vision for a casino theme birthday for my husband\'s 50th and it was fulfilled… The table settings and center pieces were beautiful. The backdrop for the pictures was stunning!',
    source: 'Google',
    url: GOOGLE_PROFILE_URL,
  },
  {
    name: 'Ellie Bro',
    rating: 5,
    quote: 'I rented a luxury throne & farm tables for a summer bridal shower. The products were gorgeous and in great shape.',
    source: 'Google',
    url: GOOGLE_PROFILE_URL,
  },
  {
    name: 'Racquel Simpson',
    rating: 5,
    quote: 'They were professional, prompt and courteous through the process ... accommodated me after booking with adding additional items even though it was a busy weekend (Father\'s day)…',
    source: 'Google',
    url: GOOGLE_PROFILE_URL,
  },
  {
    name: 'Tricia Terry',
    rating: 5,
    quote: 'If I could give more than 5 Stars I would. PrimeLux Events went above and beyond for my wedding. They took the worry out of planning on a day that is usually stressful.',
    source: 'Google',
    url: GOOGLE_PROFILE_URL,
  },
]
