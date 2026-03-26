import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const normalizeSupabaseUrl = (value: string) => {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is invalid. Use your Supabase project URL.');
  }

  if (parsed.hostname.endsWith('vercel.app')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is invalid. Use your Supabase project URL, not your Vercel app URL.');
  }

  return parsed.origin;
};

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  )?.trim();
  const habitsTable = process.env.NEXT_PUBLIC_SUPABASE_HABITS_TABLE?.trim() || 'habitts';

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  const apiKey = serviceRoleKey || publishableKey;

  if (!apiKey) {
    throw new Error('Supabase API key is missing. Set SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }

  return {
    apiKey,
    baseUrl: `${normalizeSupabaseUrl(supabaseUrl)}/rest/v1/${habitsTable}`,
  };
};

const createHeaders = (apiKey: string, extraHeaders?: HeadersInit) => ({
  apikey: apiKey,
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  ...extraHeaders,
});

const readErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string; error?: string };
    return payload.message ?? payload.error ?? `Supabase request failed with ${response.status}.`;
  } catch {
    return `Supabase request failed with ${response.status}.`;
  }
};

const proxyRequest = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export async function GET(request: NextRequest) {
  const user = request.nextUrl.searchParams.get('user')?.trim().toLowerCase();

  if (!user) {
    return NextResponse.json({ error: '`user` is required.' }, { status: 400 });
  }

  try {
    const { apiKey, baseUrl } = getSupabaseConfig();
    const params = new URLSearchParams();
    params.set('select', 'id,Name,Goal,Unit,Icon,ReminderTime,User,Habitt');
    params.set('User', `eq.${user}`);
    params.set('order', 'id.asc');

    const rows = await proxyRequest<unknown[]>(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: createHeaders(apiKey),
      cache: 'no-store',
    });

    return NextResponse.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch habits.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseUrl } = getSupabaseConfig();
    const body = (await request.json()) as {
      name?: string;
      goal?: number;
      unit?: string;
      icon?: string;
      reminderTime?: string;
      user?: string;
      habitt?: boolean;
    };

    const name = body.name?.trim();
    const goal = Number(body.goal);
    const unit = body.unit?.trim();
    const icon = body.icon?.trim();
    const user = body.user?.trim().toLowerCase();

    if (!name || !unit || !icon || !user || Number.isNaN(goal)) {
      return NextResponse.json({ error: 'Invalid habit payload.' }, { status: 400 });
    }

    const rows = await proxyRequest<unknown[]>(baseUrl, {
      method: 'POST',
      headers: createHeaders(apiKey, { Prefer: 'return=representation' }),
      body: JSON.stringify([
        {
          Name: name,
          Goal: goal,
          Unit: unit,
          Icon: icon,
          ReminderTime: body.reminderTime ? `${body.reminderTime}:00` : null,
          User: user,
          Habitt: body.habitt ?? false,
        },
      ]),
    });

    return NextResponse.json(rows[0] ?? null);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create habit.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = request.nextUrl.searchParams.get('user')?.trim().toLowerCase();
  const id = request.nextUrl.searchParams.get('id')?.trim();

  if (!user) {
    return NextResponse.json({ error: '`user` is required.' }, { status: 400 });
  }

  try {
    const { apiKey, baseUrl } = getSupabaseConfig();
    const params = new URLSearchParams();
    params.set('User', `eq.${user}`);

    if (id) {
      params.set('id', `eq.${id}`);
    }

    await proxyRequest<void>(`${baseUrl}?${params.toString()}`, {
      method: 'DELETE',
      headers: createHeaders(apiKey),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete habit.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
