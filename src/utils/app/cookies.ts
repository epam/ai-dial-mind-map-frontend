export const getCookie = (cookieName: string): string => {
  if (typeof document === 'undefined') {
    return '';
  }

  return (
    document.cookie
      .split('; ')
      .find(row => row.startsWith(`${cookieName}=`))
      ?.split('=')[1] ?? ''
  );
};

export function getJsonCookie<T>(cookieName: string, fallback: T): T {
  const raw = getCookie(cookieName);
  if (!raw) return fallback;

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Partial<T>;

    return {
      ...fallback,
      ...parsed,
    };
  } catch (err) {
    console.warn(`Failed to parse cookie "${cookieName}"`, err);
    return fallback;
  }
}
