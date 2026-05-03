import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(process.env.SUPABASE_URL);
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
