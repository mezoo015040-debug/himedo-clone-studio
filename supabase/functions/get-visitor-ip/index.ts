import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    // Priority: CF > X-Real-IP > X-Forwarded-For (first IP)
    let clientIp = cfConnectingIp || realIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || 'unknown';
    
    console.log('Headers received:', {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIp,
      'cf-connecting-ip': cfConnectingIp,
      'detected-ip': clientIp
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if IP is blocked
    const { data: blockedIp, error: blockError } = await supabase
      .from('blocked_ips')
      .select('id, reason')
      .eq('ip_address', clientIp)
      .maybeSingle();

    if (blockError) {
      console.error('Error checking blocked IP:', blockError);
    }

    const isBlocked = !!blockedIp;
    const blockReason = blockedIp?.reason || null;

    console.log('IP check result:', { clientIp, isBlocked, blockReason });

    return new Response(
      JSON.stringify({
        ip: clientIp,
        isBlocked,
        blockReason
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-visitor-ip:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', ip: 'unknown', isBlocked: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});