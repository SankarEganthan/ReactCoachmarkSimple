// Three tiny cookie helpers, so the coach mark needs no extra npm package.
// A cookie is a small piece of text the browser keeps for this website.
// Used by tourStorage.ts.

// Read a cookie. Returns null if it does not exist.
export function getCookie(name: string): string | null {
  // document.cookie looks like: "a=1; b=2; c=3"
  const parts = document.cookie.split('; ')
  for (const part of parts) {
    const [key, ...rest] = part.split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

// Save a cookie that lives for `days` days.
export function setCookie(name: string, value: string, days: number) {
  const seconds = days * 24 * 60 * 60
  // path=/  -> the cookie works on every page of the site
  // SameSite=Lax -> a safe default: it is not sent with requests from other websites
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${seconds}; SameSite=Lax`
}
