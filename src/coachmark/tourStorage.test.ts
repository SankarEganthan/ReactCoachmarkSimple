// Tests for cookie.ts and tourStorage.ts. Run with: npm test

import { beforeEach, describe, expect, it } from 'vitest'
import { getCookie, setCookie } from './cookie'
import { getSeenVersion, saveSeenVersion, shouldAutoStart } from './tourStorage'

// Remove a cookie by giving it an expiry in the past.
function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`
}

beforeEach(() => {
  clearCookie('coachmark_demo')
  clearCookie('plain')
})

describe('cookie helpers', () => {
  it('returns null for a cookie that does not exist', () => {
    expect(getCookie('plain')).toBeNull()
  })

  it('saves and reads a cookie', () => {
    setCookie('plain', 'hello world', 1)
    expect(getCookie('plain')).toBe('hello world')
  })
})

describe('tour storage', () => {
  const tour = { id: 'demo', version: 2, steps: [] }

  it('has no seen version at first', () => {
    expect(getSeenVersion('demo')).toBeNull()
  })

  it('saves the tour version in a cookie named after the tour', () => {
    saveSeenVersion(tour)
    expect(getCookie('coachmark_demo')).toBe('2')
    expect(getSeenVersion('demo')).toBe(2)
  })

  it('auto-starts when there is no cookie (first visit)', () => {
    expect(shouldAutoStart(tour)).toBe(true)
  })

  it('does not auto-start when the same version was seen', () => {
    saveSeenVersion(tour)
    expect(shouldAutoStart(tour)).toBe(false)
  })

  it('auto-starts again when the tour version is higher than the seen one', () => {
    saveSeenVersion({ ...tour, version: 1 })
    expect(shouldAutoStart(tour)).toBe(true)
  })

  it('treats a broken cookie value as "not seen"', () => {
    setCookie('coachmark_demo', 'abc', 1)
    expect(getSeenVersion('demo')).toBeNull()
    expect(shouldAutoStart(tour)).toBe(true)
  })
})
