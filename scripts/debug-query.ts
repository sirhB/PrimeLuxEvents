
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

const env = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=')
    if (key && value) {
        acc[key.trim()] = value.trim()
    }
    return acc
}, {} as Record<string, string>)

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkForeignKeys() {
    console.log('Checking foreign keys for package_item_options...')

    // We can't query information_schema directly easily via PostgREST/Supabase-js client usually depending on permissions
    // But we can try a raw RPC call if one exists, or just inspect what we can see.
    // Actually, the error "Could not find a relationship" usually means PostgREST (the API layer) doesn't see it.
    // This often happens if the FK was created but the schema cache wasn't reloaded.

    // Let's try to reload the schema cache.
    // NOTE: This is a hack. Usually making a schema change triggers it.

    // Let's just try to query valid data and see if it works now.
    const { data: options, error } = await supabase
        .from('package_item_options')
        .select('id, product_id, products(id, name)')
        .limit(1)

    if (error) {
        console.error('Still failing:', error)
    } else {
        console.log('It works now!', options)
    }
}

checkForeignKeys()
