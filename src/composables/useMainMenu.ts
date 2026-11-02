import { computed, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, type RouteLocationRaw } from 'vue-router'

import { useSiteStore } from '@/stores/site'
import type { Discipline, Media } from '@/types/api'

export interface MenuChild {
  key: string
  label: string
  to: RouteLocationRaw
  preview: Media | null
}

export interface MenuItem {
  key: string
  label: string
  to: RouteLocationRaw
  children: MenuChild[]
  active: boolean
}

const DISCIPLINES: Discipline[] = ['architecture', 'interior', 'design']
const STUDIO_PAGES = ['about', 'contact', 'follow'] as const

/**
 * The header menu from the brief: Architecture, Interior, Design, Studio, Designers, Press.
 */
export function useMainMenu(): ComputedRef<MenuItem[]> {
  const { t, locale } = useI18n()
  const route = useRoute()
  const site = useSiteStore()

  return computed(() => {
    const disciplineItems = DISCIPLINES.map(
      (discipline): MenuItem => ({
        key: discipline,
        label: t(`nav.${discipline}`),
        to: { name: 'works', params: { locale: locale.value, discipline } },
        active: route.name === 'works' && route.params.discipline === discipline,
        children: site.categoriesFor(discipline).map((category) => ({
          key: category.slug,
          label: category.name,
          to: { name: 'works', params: { locale: locale.value, discipline, category: category.slug } },
          preview: category.preview ?? null,
        })),
      }),
    )

    const studioItem: MenuItem = {
      key: 'studio',
      label: t('nav.studio'),
      to: { name: 'about', params: { locale: locale.value } },
      active: (STUDIO_PAGES as readonly unknown[]).includes(route.name),
      children: STUDIO_PAGES.map((page) => ({
        key: page,
        label: t(`studio.${page}`),
        to: { name: page, params: { locale: locale.value } },
        preview: site.studio?.about.image ?? null,
      })),
    }

    return [
      ...disciplineItems,
      studioItem,
      {
        key: 'designers',
        label: t('nav.designers'),
        to: { name: 'designers', params: { locale: locale.value } },
        active: route.name === 'designers' || route.name === 'designer',
        children: [],
      },
      {
        key: 'press',
        label: t('nav.press'),
        to: { name: 'press', params: { locale: locale.value } },
        active: route.name === 'press',
        children: [],
      },
    ]
  })
}
