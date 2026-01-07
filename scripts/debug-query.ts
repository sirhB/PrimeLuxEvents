
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
    const id = '5a97a253-ef22-4065-aa5a-3bbe9a4c0423'

    console.log('Testing metadata query...')
    const { data: simplePkg, error: simpleError } = await supabase
        .from('packages')
        .select('name, description')
        .eq('id', id)
        .single()

    if (simpleError) {
        console.error('Metadata query failed:', simpleError)
    } else {
        console.log('Metadata query success:', simplePkg)
    }

    console.log('\nTesting complex query...')
    const { data: pkg, error } = await supabase
        .from('packages')
        .select(`
          *,
          package_item_groups (
              *,
              package_item_options (
                  *,
                  products (*)
              )
          )
      `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Complex query failed:', error)
    } else {
        console.log('Complex query success. Groups count:', pkg.package_item_groups.length)
        if (pkg.package_item_groups.length > 0) {
            console.log('First group options:', pkg.package_item_groups[0].package_item_options)
        }
    }
}

testQuery()
