import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/lib/supabase/server';
import { hashPassword } from '@/app/lib/auth/password';
import { setSessionCookie, signSession } from '@/app/lib/auth/session';
import { checkRateLimit } from '@/app/lib/auth/rate-limit';

const MIN_PASSWORD_LENGTH = 8;
const MAX_REQUESTS = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, password } = body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    name.trim().length === 0 ||
    email.trim().length === 0 ||
    password.length === 0
  ) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 },
    );
  }

  // Rate limit by email.
  const limit = checkRateLimit(`register:${normalizedEmail}`, MAX_REQUESTS, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // Check for existing user.
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        name: trimmedName,
        role: 'student',
        password_hash: passwordHash,
      })
      .select('id, email, name, role, picture_url')
      .single();

    if (error) {
      console.error('Insert user failed', error);
      return NextResponse.json({ error: 'Unable to create account' }, { status: 500 });
    }

    const token = await signSession({ uid: user.id, role: user.role, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({ user, sessionToken: token }, { status: 201 });
  } catch (err) {
    console.error('Registration failed', err);
    return NextResponse.json(
      { error: 'Unable to create account. Please try again later.' },
      { status: 500 },
    );
  }
}
