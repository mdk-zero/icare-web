import { NextResponse } from 'next/server';
import { verifyGoogleIdToken } from '@/app/lib/auth/google';
import { findUserByGoogleSub, toPublicUser, touchLastLogin, upsertGoogleUser } from '@/app/lib/auth/user';
import { setSessionCookie, signSession } from '@/app/lib/auth/session';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const idToken = (body as { id_token?: unknown })?.id_token;
  if (typeof idToken !== 'string' || idToken.length === 0) {
    return NextResponse.json({ error: 'Missing id_token' }, { status: 400 });
  }

  let profile;
  try {
    profile = await verifyGoogleIdToken(idToken);
  } catch (err) {
    console.error('Google id_token verification failed', err);
    return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
  }

  if (!profile.emailVerified) {
    return NextResponse.json({ error: 'Google email is not verified' }, { status: 403 });
  }

  try {
    let user = await findUserByGoogleSub(profile.sub);
    if (!user) {
      user = await upsertGoogleUser(profile);
    } else {
      await touchLastLogin(user.id);
    }

    const publicUser = toPublicUser(user);
    const token = await signSession({ uid: publicUser.id, role: publicUser.role, email: publicUser.email });
    await setSessionCookie(token);
    return NextResponse.json({ user: publicUser, sessionToken: token });
  } catch (err) {
    console.error('Google auth handler failed', err);
    return NextResponse.json({ error: 'Sign-in failed' }, { status: 500 });
  }
}
