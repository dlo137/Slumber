import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

serve(async (req) => {
  try {
    const { planType } = await req.json();
    console.log('Request body:', { planType });
    if (!planType || planType !== 'weekly') {
      console.log('Invalid plan type:', planType);
      return new Response(JSON.stringify({ error: 'Invalid plan type.' }), { status: 400 });
    }

    // Get Supabase service role key from env
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseKey ? 'Exists' : 'Missing');
    if (!supabaseUrl || !supabaseKey) {
      console.log('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials.' }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header:', authHeader);
    if (!authHeader) {
      console.log('Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Missing Authorization header.' }), { status: 401 });
    }
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT:', jwt);
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    console.log('User lookup:', { userData, userError });
    if (userError || !userData?.user?.id) {
      console.log('User not found:', userError);
      return new Response(JSON.stringify({ error: 'User not found.' }), { status: 401 });
    }
    const userId = userData.user.id;
    console.log('User ID:', userId);

    // Update profile table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ plan: 'weekly' })
      .eq('user_id', userId);
    console.log('Update result:', { updateError });
    if (updateError) {
      console.log('Update error:', updateError.message);
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    // You can add Stripe logic here if needed

    console.log('Downgrade successful');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.log('Exception:', err);
    return new Response(JSON.stringify({ error: err && typeof err === 'object' && 'message' in err ? err.message : String(err) }), { status: 500 });
  }
});
