import { NextResponse } from 'next/server';
import { readSession } from '@/app/lib/auth/session';
import { getSupabaseAdmin } from '@/app/lib/supabase/server';
import { hashPassword, verifyPassword } from '@/app/lib/auth/password';

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body as {
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  if (typeof newPassword !== 'string' || newPassword.length === 0) {
    return NextResponse.json(
      { error: 'New password is required' },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters' },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', session.uid)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    if (user.password_hash) {
      if (
        typeof currentPassword !== 'string' ||
        currentPassword.length === 0
      ) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 },
        );
      }

      const valid = await verifyPassword(currentPassword, user.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 },
        );
      }
    }

    const newHash = await hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', session.uid);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/users/change-password failed', err);
    return NextResponse.json(
      { error: 'Unable to change password' },
      { status: 500 },
    );
  }
}
