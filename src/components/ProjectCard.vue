<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ProjectMeta from '@/components/ProjectMeta.vue'
import AppImage from '@/components/ui/AppImage.vue'
import type { ProjectSummary } from '@/types/api'

withDefaults(
  defineProps<{
    project: ProjectSummary
    sizes?: string
    /** Classes for the image box: its ratio or height. */
    mediaClass?: string
    /** "card" uses the 4:5 crop, "full" the uncropped image (for wide frames). */
    variant?: 'card' | 'full'
  }>(),
  { sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw', mediaClass: 'aspect-card', variant: 'card' },
)

const { t, locale } = useI18n()
</script>

<template>
  <article class="group">
    <RouterLink :to="{ name: 'project', params: { locale, slug: project.slug } }" class="flex flex-col focus-visible:outline-offset-4">
      <div class="relative overflow-hidden">
        <AppImage
          :media="project.cover"
          :alt="project.title"
          :variant="variant"
          :sizes="sizes"
          class="[&_img]:duration-1000 [&_img]:group-hover:scale-[1.02]"
          :class="mediaClass"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
          <span class="-translate-y-2 text-lg text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {{ t('common.view') }}
          </span>
        </div>
      </div>

      <div class="flex flex-col pt-5">
        <h3 class="text-base leading-snug font-medium">{{ project.title }}</h3>
        <p v-if="project.designers.length" class="text-sm text-grey-dark">
          {{ project.designers.map((designer) => designer.name).join(', ') }}
        </p>
        <p v-if="project.summary" class="mt-3 line-clamp-3 max-w-[60ch] text-sm leading-relaxed text-grey-dark">{{ project.summary }}</p>
        <ProjectMeta :project="project" class="mt-4 text-xs text-grey-dark" />
      </div>
    </RouterLink>
  </article>
</template>
