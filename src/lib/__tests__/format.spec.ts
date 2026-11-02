import { describe, expect, it } from 'vitest'

import { formatDate, paragraphs, socialHandle } from '@/lib/format'

describe('socialHandle', () => {
  it('turns a profile URL into an @handle', () => {
    expect(socialHandle({ platform: 'instagram', url: 'https://www.instagram.com/thelatestproject.id/' })).toBe('@thelatestproject.id')
    expect(socialHandle({ platform: 'tiktok', url: 'https://www.tiktok.com/@gilang.vm' })).toBe('@gilang.vm')
  })

  it('shows websites as host and path', () => {
    expect(socialHandle({ platform: 'website', url: 'https://www.example.com/laras' })).toBe('example.com/laras')
  })
})

describe('formatDate', () => {
  it('writes the month in the visitor language', () => {
    expect(formatDate('2026-03-02', 'en')).toBe('2 March 2026')
    expect(formatDate('2026-03-02', 'id')).toBe('2 Maret 2026')
  })
})

describe('paragraphs', () => {
  it('splits text on blank lines and drops empty parts', () => {
    expect(paragraphs('First.\n\nSecond line\nstill second.\n\n\n')).toEqual(['First.', 'Second line\nstill second.'])
    expect(paragraphs(null)).toEqual([])
  })
})
