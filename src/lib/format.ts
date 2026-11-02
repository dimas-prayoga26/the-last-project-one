import type { SocialLink, SocialPlatform } from '@/types/api'

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  behance: 'Behance',
  pinterest: 'Pinterest',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  website: 'Website',
}

export function platformLabel(platform: SocialPlatform): string {
  return PLATFORM_LABELS[platform] ?? platform
}

/** A short handle for display, e.g. "@thelatestproject.id" or "example.com/laras". */
export function socialHandle(link: SocialLink): string {
  try {
    const url = new URL(link.url)
    const path = url.pathname.replace(/^\/+|\/+$/g, '')

    if (link.platform === 'website' || path === '') {
      return `${url.hostname.replace(/^www\./, '')}${path ? `/${path}` : ''}`
    }

    const last = path.split('/').pop() ?? path

    return last.startsWith('@') ? last : `@${last}`
  } catch {
    return link.url
  }
}

export function formatDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`))
}

/** Splits long text into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
