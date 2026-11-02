<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DesignerCard from '@/components/DesignerCard.vue'
import HeroSlideshow from '@/components/HeroSlideshow.vue'
import HomeSection from '@/components/HomeSection.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectGrid from '@/components/ProjectGrid.vue'
import ProjectHighlight from '@/components/ProjectHighlight.vue'
import AppImage from '@/components/ui/AppImage.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useSiteStore } from '@/stores/site'
import type { DesignerSummary, Discipline, Paginated, PressItem, ProjectSummary, Resource } from '@/types/api'

const { t, locale } = useI18n()
const site = useSiteStore()

const featured = useAsyncData(() => apiGet<Paginated<ProjectSummary>>('/projects', { featured: true, per_page: 6 }))
const latest = useAsyncData(() => apiGet<Paginated<ProjectSummary>>('/projects', { per_page: 6 }))
const designers = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))
const press = useAsyncData(() => apiGet<Paginated<PressItem>>('/press', { per_page: 3 }))

/** One curated chapter per discipline, each with its own grid, like normcph.com's home page. */
const chapterLayouts: { discipline: Discipline; count: number; grid: string; mediaClass: string; variant: 'card' | 'full'; sizes: string }[] = [
  { discipline: 'architecture', count: 2, grid: 'sm:grid-cols-2', mediaClass: 'aspect-[3/2]', variant: 'full', sizes: '(min-width: 640px) 50vw, 100vw' },
  {
    discipline: 'interior',
    count: 4,
    grid: 'sm:grid-cols-2 lg:grid-cols-4',
    mediaClass: 'aspect-card',
    variant: 'card',
    sizes: '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  },
  { discipline: 'design', count: 3, grid: 'sm:grid-cols-3', mediaClass: 'aspect-card', variant: 'card', sizes: '(min-width: 640px) 33vw, 100vw' },
]

const chapters = chapterLayouts.map((layout) => {
  const response = useAsyncData(() => apiGet<Paginated<ProjectSummary>>('/projects', { discipline: layout.discipline, per_page: layout.count + 6 }))

  /** Prefers works that are not already in "Latest work", then fills up with the rest. */
  const works = computed(() => {
    const all = response.data.value?.data ?? []
    const latestIds = new Set((latest.data.value?.data ?? []).map((project) => project.id))

    return [...all.filter((project) => !latestIds.has(project.id)), ...all.filter((project) => latestIds.has(project.id))].slice(0, layout.count)
  })

  return { ...layout, works }
})

/** A full-screen work between the chapters: the last featured one, so it differs from the first slide. */
const highlight = computed(() => {
  const works = featured.data.value?.data ?? []

  return works[works.length - 1] ?? null
})

useHead({ title: '' })
</script>

<template>
  <div class="pb-24 md:pb-32">
    <h1 class="sr-only">{{ t('meta.description') }}</h1>

    <HeroSlideshow v-if="featured.data.value?.data.length" :projects="featured.data.value.data" />
    <div v-else-if="featured.loading.value" class="h-[75svh] min-h-[480px] animate-pulse bg-grey-tint md:h-[calc(100svh-4.5rem)]" />

    <HomeSection :title="t('home.latestWorks')" :side-label="t('home.recent')">
      <ProjectGrid v-if="latest.data.value" :projects="latest.data.value.data" :columns="4" bento />
      <ProjectGrid v-else :projects="[]" :columns="4" loading :placeholders="4" />
    </HomeSection>

    <!-- Studio statement over a full-screen image -->
    <section
      v-if="site.studio?.about.heading"
      class="relative mt-20 h-[75svh] min-h-[480px] overflow-hidden bg-black text-white md:mt-28 md:h-[calc(100svh-4.5rem)]"
    >
      <AppImage v-if="site.studio.about.image" :media="site.studio.about.image" alt="" class="size-full" />
      <div class="absolute inset-0 bg-black/40" />
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-6 px-page text-center">
        <p class="text-xs text-white/80">{{ site.studio.intro }}</p>
        <p class="max-w-3xl text-2xl leading-snug md:text-4xl">{{ site.studio.about.heading }}</p>
        <RouterLink :to="{ name: 'about', params: { locale } }" class="link-underline text-sm">
          {{ t('home.aboutLink') }} <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>

    <template v-for="(chapter, position) in chapters" :key="chapter.discipline">
      <HomeSection
        v-if="chapter.works.value.length"
        :title="t(`nav.${chapter.discipline}`)"
        :side-label="t('home.works')"
        :link="{ name: 'works', params: { locale, discipline: chapter.discipline } }"
        :link-label="t('works.allIn', { discipline: t(`nav.${chapter.discipline}`) })"
      >
        <div class="grid grid-cols-1 gap-x-unit gap-y-14" :class="chapter.grid">
          <ProjectCard
            v-for="project in chapter.works.value"
            :key="project.id"
            v-reveal
            :project="project"
            :media-class="chapter.mediaClass"
            :variant="chapter.variant"
            :sizes="chapter.sizes"
          />
        </div>
      </HomeSection>

      <ProjectHighlight v-if="position === 1 && highlight" :project="highlight" class="mt-20 md:mt-28" />
    </template>

    <HomeSection
      v-if="designers.data.value?.data.length"
      :title="t('home.designers')"
      :side-label="t('home.people')"
      :link="{ name: 'designers', params: { locale } }"
      :link-label="t('home.allDesigners')"
    >
      <div class="grid grid-cols-2 gap-x-unit gap-y-12 md:grid-cols-4 lg:grid-cols-5">
        <DesignerCard
          v-for="(designer, index) in designers.data.value.data.slice(0, 10)"
          :key="designer.id"
          v-reveal
          :designer="designer"
          :class="{ 'hidden lg:block': index >= 8 }"
        />
      </div>
    </HomeSection>

    <HomeSection
      v-if="press.data.value?.data.length"
      :title="t('home.press')"
      :link="{ name: 'press', params: { locale } }"
      :link-label="t('home.allPress')"
    >
      <ul class="grid grid-cols-1 gap-x-unit gap-y-12 sm:grid-cols-3">
        <li v-for="item in press.data.value.data" :key="item.id" v-reveal>
          <component
            :is="item.url ? 'a' : 'div'"
            :href="item.url ?? undefined"
            :target="item.url ? '_blank' : undefined"
            :rel="item.url ? 'noopener noreferrer' : undefined"
            class="group flex flex-col"
          >
            <AppImage v-if="item.image" :media="item.image" alt="" sizes="(min-width: 640px) 33vw, 100vw" class="aspect-[3/2] [&_img]:duration-1000 [&_img]:group-hover:scale-[1.02]" />
            <p class="pt-5 text-xs text-grey-dark">{{ item.publication }}<span class="mx-2" aria-hidden="true">|</span>{{ formatDate(item.published_on, locale) }}</p>
            <h3 class="mt-2 text-base leading-snug font-medium">
              {{ item.title }}<span v-if="item.url" aria-hidden="true" class="ml-1 text-grey-dark">↗</span>
            </h3>
          </component>
        </li>
      </ul>
    </HomeSection>
  </div>
</template>
