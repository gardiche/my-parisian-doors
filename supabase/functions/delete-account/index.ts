import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type DoorRecord = {
  id: string;
  image_url?: string | null;
  enhanced_url?: string | null;
  marketing_image_url?: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function storagePathFromPublicUrl(url: string | null | undefined, bucket: string) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return null;

  const pathWithQuery = url.slice(markerIndex + marker.length);
  return decodeURIComponent(pathWithQuery.split('?')[0]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ success: false, error: 'Server is missing Supabase credentials.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace(/^Bearer\s+/i, '');

  if (!jwt) {
    return jsonResponse({ success: false, error: 'Missing authorization token.' }, 401);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt);

  if (userError || !userData.user) {
    return jsonResponse({ success: false, error: 'Invalid or expired session.' }, 401);
  }

  const userId = userData.user.id;

  try {
    const { data: doors, error: doorsError } = await supabaseAdmin
      .from('doors')
      .select('id,image_url,enhanced_url,marketing_image_url')
      .eq('user_id', userId);

    if (doorsError) throw doorsError;

    const userDoors = (doors || []) as DoorRecord[];
    const doorIds = userDoors.map((door) => door.id);
    const doorImagePaths = new Set<string>();
    const marketingImagePaths = new Set<string>();

    for (const door of userDoors) {
      const originalPath = storagePathFromPublicUrl(door.image_url, 'door-images');
      const enhancedPath = storagePathFromPublicUrl(door.enhanced_url, 'door-images');
      const marketingPath = storagePathFromPublicUrl(door.marketing_image_url, 'marketing-assets');

      if (originalPath) doorImagePaths.add(originalPath);
      if (enhancedPath) doorImagePaths.add(enhancedPath);
      if (marketingPath) marketingImagePaths.add(marketingPath);
    }

    if (doorImagePaths.size > 0) {
      await supabaseAdmin.storage.from('door-images').remove([...doorImagePaths]);
    }

    if (marketingImagePaths.size > 0) {
      await supabaseAdmin.storage.from('marketing-assets').remove([...marketingImagePaths]);
    }

    await supabaseAdmin
      .from('user_favorites')
      .delete()
      .eq('user_id', userId);

    if (doorIds.length > 0) {
      await supabaseAdmin
        .from('user_favorites')
        .delete()
        .in('door_id', doorIds);
    }

    await supabaseAdmin
      .from('doors')
      .delete()
      .eq('user_id', userId);

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) throw deleteUserError;

    return jsonResponse({
      success: true,
      deletedDoors: userDoors.length,
      deletedDoorImages: doorImagePaths.size,
      deletedMarketingImages: marketingImagePaths.size,
    });
  } catch (error) {
    console.error('delete-account failed', error);
    return jsonResponse({ success: false, error: 'Account deletion failed.' }, 500);
  }
});
