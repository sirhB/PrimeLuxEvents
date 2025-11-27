-- Migration: Add rental agreement content to CMS
-- This adds the rental agreement content to the content table so it can be edited via the visual editor

INSERT INTO content (key, value, type) VALUES (
  'rental_agreement',
  '{
    "title": "PrimeLux Events | Rental Agreement",
    "effective_date": "November 2025",
    "introduction": "This Contract is executed between PrimeLux Events (the \"Company\") and the Renter. Acceptance of the rental order binds the Renter to the entirety of these terms.",
    "sections": [
      {
        "roman_numeral": "I",
        "title": "Contract Execution & Financial Terms",
        "stipulations": [
          {
            "area": "Showroom Consultations",
            "description": "Located in Shelton, CT. While walk-ins are accommodated, pre-scheduled appointments are strongly recommended to ensure dedicated attention from an Event Consultant."
          },
          {
            "area": "Rental Duration",
            "description": "Standard engagements are for 24 hours. Custom or extended periods will incur specific scheduling fees."
          },
          {
            "area": "Pricing & Inventory",
            "description": "All pricing, item selection, and availability are subject to immediate revision."
          },
          {
            "area": "Reservation Deposit",
            "description": "A non-refundable 50% deposit is required to secure all items."
          },
          {
            "area": "Final Settlement",
            "description": "The remaining balance is due in full seven (7) days prior to the delivery date. Failure to remit payment by this deadline grants the Company the right to cancel the order without deposit refund or apply late charges at the maximum lawful rate per Connecticut statute."
          }
        ]
      },
      {
        "roman_numeral": "II",
        "title": "Equipment Condition & Accountability",
        "stipulations": [
          {
            "area": "Inspection & Care",
            "description": "All equipment is rigorously inspected and sanitized before dispatch. The mandatory damage waiver covers minor, expected wear and tear only."
          },
          {
            "area": "Renter Accountability",
            "description": "The Renter assumes full financial responsibility for significant damage, theft, or loss (including Acts of God). Replacement costs will be charged directly."
          },
          {
            "area": "Condition Assessment",
            "description": "The Company reserves 72 hours following possession retrieval to formally assess the equipment''s condition and determine liability for damages incurred during the rental period."
          },
          {
            "area": "Aesthetic Quality (Linens)",
            "description": "Due to inherent material variances and digital display effects, exact color matching is not guaranteed. On-site inspection at the showroom is advised."
          }
        ]
      },
      {
        "roman_numeral": "III",
        "title": "Logistics: Delivery, Pickup, & Will-Call",
        "stipulations": [
          {
            "area": "Standard Scheduling",
            "description": "Deliveries typically occur 1–2 days before the event, with pickup 1–2 days following. Standard service hours are M–F, 9:00 AM–5:00 PM (in-season) or 9:00 AM–4:00 PM (off-season)."
          },
          {
            "area": "Non-Standard Fees",
            "description": "Additional fees apply for service outside standard hours, precise time windows, weekend logistics, or late-night retrievals."
          },
          {
            "area": "Minimum Order",
            "description": "Delivery service requires a minimum equipment rental cost of $250.00 (excluding labor and fees)."
          },
          {
            "area": "Delivery Window",
            "description": "A minimum two (2) hour window is required. The Renter may contact us on the delivery morning for an estimated 2–3 hour arrival window."
          },
          {
            "area": "Renter Presence",
            "description": "The Renter must be available for the entire window. After a 15-minute grace period, a waiting fee of up to $120.00 per hour will be assessed."
          },
          {
            "area": "Curbside Standard",
            "description": "Delivery is to a ground-level, hard surface, obstruction-free location within 25 feet of the loading area. Equipment will be securely stacked."
          },
          {
            "area": "Excess Labor Charges",
            "description": "Additional fees (up to $120.00/hour) apply for conditions that impede standard delivery (e.g., stairs, uneven terrain, rush orders, or inaccurate directions)."
          },
          {
            "area": "Will-Call Location",
            "description": "Customer pickup and return are available at our Shelton, CT warehouse for select, smaller orders."
          },
          {
            "area": "Will-Call Liability",
            "description": "The Renter assumes all liability for will-call items from the moment they leave the facility. The Renter is responsible for securing, loading, and unloading all items. Failure to pick up the order may result in a minimum 50% rental fee charge."
          },
          {
            "area": "Setup & Breakdown",
            "description": "Available for an additional fee. If the Renter is unavailable, the Company may setup as deemed appropriate or leave items curbside; no refund is issued, and the Renter assumes full liability for unsupervised equipment."
          }
        ]
      },
      {
        "roman_numeral": "IV",
        "title": "Post-Use Protocols",
        "description": "The Renter is responsible for basic preparation prior to pickup:",
        "protocols": [
          {
            "category": "China/Flatware/Glassware",
            "instruction": "All food debris must be scraped/rinsed, and liquids emptied. Return to designated crates."
          },
          {
            "category": "Linens",
            "instruction": "Shake clear of debris and ensure dryness. Return in clear plastic bags."
          },
          {
            "category": "Furniture",
            "instruction": "Tables and chairs must be broken down and stacked for driver retrieval in the same manner as delivered."
          }
        ]
      },
      {
        "roman_numeral": "V",
        "title": "Cancellation & Adjustments",
        "stipulations": [
          {
            "area": "Deposit Forfeiture",
            "description": "The 50% reservation deposit is non-refundable regardless of the cancellation reason or timing."
          },
          {
            "area": "Order Adjustments",
            "description": "Reductions to non-specialty items are permitted up to seven (7) days before delivery, provided the contract price does not fall below the forfeited 50% deposit amount."
          },
          {
            "area": "Specialty Items",
            "description": "Items requiring custom manufacturing, sub-rental, or purchase (including heaters) are fully non-refundable once ordered or production commences."
          }
        ]
      },
      {
        "roman_numeral": "VI",
        "title": "Indemnification & Liability",
        "description": "The Renter shall take all necessary precautions for the rented items and protect all persons and property from harm. The Renter agrees to indemnify and hold PrimeLux Events harmless from and against all liability, claims, losses, or costs (including legal fees) arising from the use, installation, operation, or possession of the rented equipment, regardless of cause."
      }
    ]
  }'::jsonb,
  'json'
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = timezone('utc'::text, now());
