
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

async function testQuery() {
    // using the ID from the URL in the screenshot or a known ID
    // The user screenshot doesn't show the ID in URL clearly, but previous request had 
    // 5a97a253-ef22-4065-aa5a-3bbe9a4c0423. Let's try that or any package.

    // First get a valid package ID
    const { data: validPkg } = await supabase.from('packages').select('id').limit(1).single()
    if (!validPkg) {
        console.error('No packages found to test with')
        return
    }

    const id = validPkg.id
    console.log(`Testing with Package ID: ${id}`)

    const { data, error } = await supabase
        .from('packages')
        .select(`
            *,
            package_item_groups (
                id,
                name,
                description,
                min_selections,
                max_selections,
                display_order,
                package_item_options (
                    id,
                    product_id,
                    is_default,
                    quantity,
                    display_order,
                    products (
                        name
                    )
                )
            ),
            package_items (
                id,
                product_id,
                quantity,
                products (
                    name
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Query Failed:', JSON.stringify(error, null, 2))
    } else {
        console.log('Query Success!')
        if (data.package_items) {
            console.log('Static Items:', data.package_items.length)
        }
    }
}

testQuery()
