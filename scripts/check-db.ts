
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .limit(5)

    if (error) {
        console.error('Error fetching products:', error)
        return
    }

    console.log('Products found:', data)
}

checkProducts()
