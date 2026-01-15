export type ConsultationStatus = 'new_request' | 'pending_response' | 'appointment_confirmed' | 'completed'

export type Consultation = {
    id: string
    status: ConsultationStatus
    first_name: string | null
    last_name: string | null
    customer_name: string | null
    customer_email: string | null
    customer_phone: string | null
    number_of_guests: number | null
    event_date: string | null
    budget_range: string | null
    message: string | null
    created_at: string
    updated_at: string
}
