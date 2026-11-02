<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import ProjectGrid from '@/components/ProjectGrid.vue'
import ProjectMeta from '@/components/ProjectMeta.vue'
import AppImage from '@/components/ui/AppImage.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import ImageLightbox from '@/components/ui/ImageLightbox.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { ApiError, apiGet } from '@/lib/api'
import { paragraphs } from '@/lib/format'
import { aspectRatioOf, buildGalleryRows, type GalleryRow } from '@/lib/media'
import type { Media, ProjectResponse } from '@/types/api'
import NotFoundView from '@/views/NotFoundView.vue'

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error, loading, reload } = useAsyncData(() => apiGet<ProjectResponse>(`/projects/${slug.value}`), [slug])

const project = computed(() => data.value?.data ?? null)
const notFound = computed(() => error.value instanceof ApiError && error.value.status === 404)
const lightboxIndex = ref<number | null>(null)

/** Cover first, then the gallery: the order used by the lightbox and the index sheet. */
const allImages = computed<Media[]>(() => {
  if (!project.value) {
    return []
  }

  return [...(project.value.cover ? [project.value.cover] : []), ...project.value.gallery]
})

const coverOffset = computed(() => (project.value?.cover ? 1 : 0))

/** The first gallery image sits next to the text; the rest form the gallery rows. */
const sideImage = computed(() => project.value?.gallery[0] ?? null)
const galleryRows = computed(() => buildGalleryRows(project.value?.gallery.slice(1) ?? [], coverOffset.value + 1))

const ROW_GRID: Record<GalleryRow['kind'], string> = {
  full: 'grid-cols-1',
  triple: 'grid-cols-1 sm:grid-cols-3',
  pair: 'grid-cols-1 sm:grid-cols-2',
  single: 'grid-cols-1 sm:mx-auto sm:w-1/2',
}

const facts = computed(() => {
  if (!project.value) {
    return []
  }

  return [
    { label: t('project.location'), value: project.value.location },
    { label: t('project.year'), value: project.value.year?.toString() ?? null },
    { label: t('project.area'), value: project.value.area },
    { label: t('project.client'), value: project.value.client },
    { label: t('project.photography'), value: project.value.photographer },
  ].filter((fact) => fact.value)
})

const relatedTitle = computed(() => {
  const designers = project.value?.designers ?? []

  return designers.length === 1 && designers[0] ? t('project.moreBy', { name: designers[0].name }) : t('project.related')
})

useHead({
  title: () => project.value?.title ?? '',
  meta: [
    { name: 'description', content: () => project.value?.summary ?? t('meta.description') },
    { property: 'og:title', content: () => project.value?.title ?? '' },
    { property: 'og:image', content: () => project.value?.cover?.url ?? '/brand/tlp-og-default-1200x630.png' },
  ],
})
</script>

<template>
  <NotFoundView v-if="notFound" />
  <ErrorState v-else-if="error" @retry="reload" />

  <div v-else-if="loading && !project" class="h-[75svh] animate-pulse bg-grey-tint md:h-[calc(100svh-4.5rem)]" aria-busy="true" />

  <article v-else-if="project" class="pb-24 md:pb-32">
    <header class="relative h-[75svh] min-h-[480px] overflow-hidden bg-black text-white md:h-[calc(100svh-4.5rem)]">
      <button
        v-if="project.cover"
        type="button"
        class="absolute inset-0 block size-full cursor-zoom-in"
        :aria-label="t('a11y.openImage', { number: 1 })"
        @click="lightboxIndex = 0"
      >
        <AppImage :media="project.cover" :alt="project.title" eager class="size-full" />
      </button>
      <div class="pointer-events-none absolute inset-0 bg-black/30" />

      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-page text-center">
        <nav :aria-label="t('works.eyebrow')" class="pointer-events-auto text-xs text-white/85">
          <RouterLink :to="{ name: 'works', params: { locale, discipline: project.discipline } }" class="link-underline">
            {{ t(`nav.${project.discipline}`) }}
          </RouterLink>
          <span class="mx-2" aria-hidden="true">|</span>
          <RouterLink
            :to="{ name: 'works', params: { locale, discipline: project.discipline, category: project.category.slug } }"
            class="link-underline"
          >
            {{ project.category.name }}
          </RouterLink>
          <template v-if="project.year"><span class="mx-2" aria-hidden="true">|</span>{{ project.year }}</template>
        </nav>
        <h1 class="max-w-4xl text-4xl font-normal md:text-6xl">{{ project.title }}</h1>
        <p v-if="project.designers.length" class="text-sm text-white/85">
          {{ project.designers.map((designer) => designer.name).join(', ') }}
        </p>
      </div>

      <p v-if="project.summary" class="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-page pb-10 text-center text-sm text-white/85">
        {{ project.summary }}
      </p>
    </header>

    <!-- Facts, text and a side image -->
    <section class="grid grid-cols-12 gap-x-unit gap-y-12 px-page pt-16 md:pt-24">
      <dl class="col-span-12 grid grid-cols-2 content-start gap-x-unit gap-y-6 md:col-span-3 md:grid-cols-1">
        <div v-if="project.designers.length" class="flex flex-col gap-1">
          <dt class="text-xs text-grey-dark">{{ t('project.designers') }}</dt>
          <dd v-for="designer in project.designers" :key="designer.id">
            <RouterLink :to="{ name: 'designer', params: { locale, slug: designer.slug } }" class="link-underline">
              {{ designer.name }}
            </RouterLink>
          </dd>
        </div>
        <div class="flex flex-col gap-1">
          <dt class="text-xs text-grey-dark">{{ t('project.category') }}</dt>
          <dd>{{ t(`nav.${project.discipline}`) }}, {{ project.category.name }}</dd>
        </div>
        <div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-1">
          <dt class="text-xs text-grey-dark">{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>

      <div class="col-span-12 md:col-span-6">
        <div v-if="project.description" class="prose-body text-base md:text-lg">
          <p v-for="(paragraph, position) in paragraphs(project.description)" :key="position">{{ paragraph }}</p>
        </div>
      </div>

      <figure v-if="sideImage" class="col-span-12 flex flex-col gap-3 sm:col-span-6 sm:col-start-4 md:col-span-3">
        <button
          type="button"
          class="group block cursor-zoom-in overflow-hidden"
          :aria-label="t('a11y.openImage', { number: coverOffset + 1 })"
          @click="lightboxIndex = coverOffset"
        >
          <AppImage :media="sideImage" :alt="project.title" sizes="(min-width: 768px) 25vw, 100vw" class="aspect-card [&_img]:duration-1000 [&_img]:group-hover:scale-[1.02]" />
        </button>
        <figcaption class="border-t border-black/10 pt-3 text-xs text-grey-dark">
          {{ project.title }}<template v-if="project.location">, {{ project.location }}</template>
        </figcaption>
      </figure>
    </section>

    <!-- Gallery -->
    <section v-if="galleryRows.length" class="flex flex-col gap-unit px-page pt-16 md:pt-24">
      <div v-for="(row, rowIndex) in galleryRows" :key="rowIndex" v-reveal class="grid gap-unit" :class="ROW_GRID[row.kind]">
        <button
          v-for="item in row.items"
          :key="item.media.id"
          type="button"
          class="group block cursor-zoom-in overflow-hidden"
          :aria-label="t('a11y.openImage', { number: item.index + 1 })"
          @click="lightboxIndex = item.index"
        >
          <AppImage
            :media="item.media"
            :alt="project.title"
            :sizes="row.kind === 'full' ? '100vw' : row.kind === 'triple' ? '(min-width: 640px) 33vw, 100vw' : '(min-width: 640px) 50vw, 100vw'"
            class="[&_img]:duration-1000 [&_img]:group-hover:scale-[1.02]"
            :style="{ aspectRatio: aspectRatioOf(row.items[0]?.media ?? item.media) }"
          />
        </button>
      </div>
    </section>

    <section v-if="allImages.length > 1" class="mt-20 flex flex-col gap-8 bg-grey-tint/60 px-page py-14 md:mt-28">
      <SectionHeading :title="t('project.index')" />
      <ol class="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-10">
        <li v-for="(media, index) in allImages" :key="media.id">
          <button type="button" class="group flex w-full flex-col gap-1 text-left" :aria-label="t('a11y.openImage', { number: index + 1 })" @click="lightboxIndex = index">
            <AppImage :media="media" variant="thumb" alt="" class="aspect-square [&_img]:group-hover:opacity-80" />
            <span class="text-xs text-grey-dark tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
          </button>
        </li>
      </ol>
    </section>

    <!-- Previous / next -->
    <nav
      v-if="data?.previous || data?.next"
      :aria-label="t('works.eyebrow')"
      class="grid grid-cols-2 items-center gap-x-unit gap-y-4 border-b border-black/10 px-page py-6 text-sm md:grid-cols-3"
      :class="allImages.length > 1 ? '' : 'mt-20 border-t md:mt-28'"
    >
      <RouterLink v-if="data?.previous" :to="{ name: 'project', params: { locale, slug: data.previous.slug } }" class="group flex flex-col gap-0.5">
        <span class="text-xs text-grey-dark">← {{ t('project.previous') }}</span>
        <span class="link-underline self-start">{{ data.previous.title }}</span>
      </RouterLink>
      <span v-else />
      <ProjectMeta :project="project" class="hidden text-center text-xs text-grey-dark md:block" />
      <RouterLink v-if="data?.next" :to="{ name: 'project', params: { locale, slug: data.next.slug } }" class="group flex flex-col items-end gap-0.5 text-right">
        <span class="text-xs text-grey-dark">{{ t('project.next') }} →</span>
        <span class="link-underline">{{ data.next.title }}</span>
      </RouterLink>
    </nav>

    <section v-if="data?.related.length" class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading :title="relatedTitle" />
      <ProjectGrid :projects="data.related" :columns="4" />
    </section>

    <ImageLightbox v-model="lightboxIndex" :images="allImages" :title="project.title" />
  </article>
</template>
