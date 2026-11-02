/** Shapes returned by the Laravel API (/api/v1). Translatable fields arrive in the requested locale. */

export type Discipline = 'architecture' | 'interior' | 'design'

export type SocialPlatform =
  | 'instagram'
  | 'linkedin'
  | 'behance'
  | 'pinterest'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'website'

export interface Media {
  id: number
  /** Large web version (max 2000 px). */
  url: string
  original: string
  /** 4:5 crop for cards (covers and designer photos only). */
  card: string | null
  /** Small version (max 640 px). */
  thumb: string | null
  width: number | null
  height: number | null
  alt: string | null
}

export interface SocialLink {
  platform: SocialPlatform
  url: string
}

export interface Category {
  id: number
  discipline: Discipline
  name: string
  slug: string
  preview?: Media | null
}

export interface NavigationDiscipline {
  key: Discipline
  categories: Category[]
}

export interface DesignerCredit {
  name: string
  slug: string
}

export interface DesignerSummary {
  id: number
  name: string
  slug: string
  title: string | null
  location: string | null
  photo: Media | null
  socials: SocialLink[]
  projects_count?: number
}

export interface ProjectSummary {
  id: number
  slug: string
  title: string
  summary: string | null
  year: number | null
  location: string | null
  is_featured: boolean
  discipline: Discipline
  category: Category
  cover: Media | null
  designers: DesignerCredit[]
}

export interface Designer extends DesignerSummary {
  email: string | null
  bio: string | null
  projects: ProjectSummary[]
}

export interface Project extends Omit<ProjectSummary, 'designers'> {
  description: string | null
  client: string | null
  area: string | null
  photographer: string | null
  published_at: string | null
  designers: DesignerSummary[]
  gallery: Media[]
}

export interface ProjectResponse {
  data: Project
  previous: ProjectSummary | null
  next: ProjectSummary | null
  related: ProjectSummary[]
}

export interface PressItem {
  id: number
  title: string
  publication: string
  published_on: string
  url: string | null
  excerpt: string | null
  image: Media | null
  document_url: string | null
}

export interface Studio {
  intro: string | null
  about: {
    heading: string | null
    body: string | null
    image: Media | null
  }
  contact: {
    email: string | null
    phone: string | null
    whatsapp: string | null
    address: string | null
    map_url: string | null
    office_hours: string | null
  }
  socials: SocialLink[]
}

export interface Resource<T> {
  data: T
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ContactMessageInput {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  /** Honeypot, must stay empty. */
  website: string
}
