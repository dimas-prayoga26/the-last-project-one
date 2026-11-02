<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ProjectMeta from '@/components/ProjectMeta.vue'
import AppImage from '@/components/ui/AppImage.vue'
import type { ProjectSummary } from '@/types/api'

defineProps<{ project: ProjectSummary }>()

const { t, locale } = useI18n()
</script>

<template>
  <section class="relative h-[75svh] min-h-[480px] overflow-hidden bg-black text-white md:h-[calc(100svh-4.5rem)]">
    <RouterLink :to="{ name: 'project', params: { locale, slug: project.slug } }" class="group absolute inset-0 block focus-visible:-outline-offset-8">
      <AppImage :media="project.cover" :alt="project.title" class="size-full [&_img]:duration-[1500ms] [&_img]:group-hover:scale-[1.02]" />
      <div class="absolute inset-0 bg-black/30" />
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 px-page text-center">
        <ProjectMeta :project="project" class="text-xs text-white/80" />
        <h2 class="text-3xl font-normal md:text-5xl">{{ project.title }}</h2>
        <p v-if="project.summary" class="max-w-xl text-sm text-white/85">{{ project.summary }}</p>
        <span class="link-underline mt-2 text-sm">{{ t('common.viewProject') }} <span aria-hidden="true">→</span></span>
      </div>
    </RouterLink>
  </section>
</template>
