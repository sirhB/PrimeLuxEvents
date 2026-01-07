-- Migration: Rebrand Consultations to Leads
-- This migration updates terminology from "consultations" to "leads" for better clarity

-- Update table comment
COMMENT ON TABLE consultations IS 'Stores lead requests from the contact form with workflow states: new_request, pending_response, appointment_confirmed, completed. Leads represent potential customers that need follow-up.';

-- The table name remains "consultations" for backward compatibility,
-- but all UI references will use "Leads" terminology
