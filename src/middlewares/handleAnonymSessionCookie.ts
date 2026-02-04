import { NextRequest, NextResponse } from 'next/server';

import { AnonymSessionCookieName, AnonymSessionDataCookieName } from '@/constants/http';
import { AnonymUserSession, AnonymUserSessionData } from '@/types/http';
import { decryptWeb, encryptWeb } from '@/utils/app/crypt';
import { getCsrfToken } from '@/utils/common/csrf';

export async function handleAnonymSessionCookie(req: NextRequest, res: NextResponse) {
  if (!process.env.DIAL_API_KEY || !process.env.ANONYM_SESSION_SECRET_KEY) return;

  const anonymSessionSecretKey = process.env.ANONYM_SESSION_SECRET_KEY;
  const existingCookie = req.cookies.get(AnonymSessionCookieName);

  let session: AnonymUserSession;
  let shouldSetCookie = false;
  let isRecaptchaRequired = true;

  if (existingCookie?.value) {
    try {
      session = await decryptWeb(existingCookie.value, anonymSessionSecretKey);

      if (!session?.token) {
        throw new Error('Invalid anonym cookie session payload');
      }

      isRecaptchaRequired = !session.requestQuota || session.requestQuota < 1;
    } catch {
      session = { token: getCsrfToken() };
      shouldSetCookie = true;
    }
  } else {
    session = { token: getCsrfToken() };
    shouldSetCookie = true;
  }

  if (shouldSetCookie) {
    const encrypted = await encryptWeb(JSON.stringify(session), anonymSessionSecretKey);

    res.cookies.set(AnonymSessionCookieName, encrypted, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      partitioned: true,
      httpOnly: true,
    });
  }

  if (session?.token) {
    const sessionData: AnonymUserSessionData = {
      token: session.token,
      isChallengeRequired: isRecaptchaRequired,
    };
    res.cookies.set(AnonymSessionDataCookieName, JSON.stringify(sessionData), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      partitioned: true,
      httpOnly: false,
    });
  }
}
