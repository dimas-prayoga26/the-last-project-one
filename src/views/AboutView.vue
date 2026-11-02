<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppImage from '@/components/ui/AppImage.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import { paragraphs } from '@/lib/format'
import { useSiteStore } from '@/stores/site'
import type { DesignerSummary, Paginated, ProjectSummary, Resource } from '@/types/api'

const { t, locale } = useI18n()
const site = useSiteStore()

const designers = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))
const projects = useAsyncData(() => apiGet<Paginated<ProjectSummary>>('/projects', { per_page: 1 }))

const studio = computed(() => site.studio)
const facts = computed(() => [
  { label: t('about.designers'), value: designers.data.value?.data.length ?? null },
  { label: t('about.works'), value: projects.data.value?.meta.total ?? null },
  { label: t('about.disciplines'), value: site.navigation.length || null },
])

useHead({
  title: () => t('about.title'),
  meta: [{ name: 'description', content: () => studio.value?.intro ?? t('meta.description') }],
})
</script>

<template>
  <div class="pb-24 md:pb-32">
    <div v-if="studio?.about.image" class="h-[60svh] md:h-[calc(100svh-4.5rem)]">
      <AppImage :media="studio.about.image" alt="The Latest Project" eager class="size-full" />
    </div>

    <PageHeader :eyebrow="t('nav.studio')" :title="t('about.title')" />

    <div class="px-page">
      <div class="mx-auto flex max-w-3xl flex-col gap-10">
        <p v-if="studio?.about.heading" class="text-center text-2xl leading-snug md:text-3xl">{{ studio.about.heading }}</p>
        <div v-if="studio?.about.body" class="prose-body text-base md:text-lg">
          <p v-for="(paragraph, position) in paragraphs(studio.about.body)" :key="position">{{ paragraph }}</p>
        </div>
      </div>
    </div>

    <section class="mt-20 bg-grey-tint/60 px-page py-16 md:mt-28 md:py-20">
      <dl class="mx-auto grid max-w-4xl grid-cols-3 gap-unit text-center">
        <div v-for="fact in facts" :key="fact.label" class="flex flex-col-reverse gap-2">
          <dt class="text-xs text-grey-dark">{{ fact.label }}</dt>
          <dd class="text-4xl tabular-nums md:text-5xl">{{ fact.value ?? '–' }}</dd>
        </div>
      </dl>
      <div class="mt-12 flex flex-wrap justify-center gap-4">
        <RouterLink :to="{ name: 'designers', params: { locale } }" class="btn-primary">
          {{ t('about.meetDesigners') }} <span aria-hidden="true">→</span>
        </RouterLink>
        <RouterLink :to="{ name: 'contact', params: { locale } }" class="btn-outline">{{ t('studio.contact') }}</RouterLink>
      </div>
    </section>
  </div>
</template>
