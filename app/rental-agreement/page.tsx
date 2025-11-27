"use client"

import { motion } from "framer-motion"
import { FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RentalAgreementPageContent } from "@/components/rental-agreement-page-content"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function RentalAgreementPage() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('key', 'rental_agreement')

      if (error) {
        console.error('Error fetching rental agreement:', error)
      } else if (data && data[0]) {
        let value = data[0].value
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value)
          } catch (e) {
            // Keep as string if parse fails
          }
        }
        setContent({ rental_agreement: value })
      }
      setLoading(false)
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <RentalAgreementPageContent content={content} />
}