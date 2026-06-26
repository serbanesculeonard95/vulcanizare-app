import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jfosomkclvsfsmnhgzyj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_5-9xPCRaVI1P50kzN80FSg_lEVO3xMf'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
