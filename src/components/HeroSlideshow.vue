<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ProjectMeta from '@/components/ProjectMeta.vue'
import AppImage from '@/components/ui/AppImage.vue'
import type { ProjectSummary } from '@/types/api'

const props = defineProps<{ projects: ProjectSummary[] }>()

const INTERVAL_MS = 7000

const { t, locale } = useI18n()
const active = ref(0)
const playing = ref(true)
let timer: number | undefined

const current = computed(() => props.projects[active.value] ?? null)

function show(index: number): void {
  active.value = (index + props.projects.length) % props.projects.length
  restart()
}

function restart(): void {
  window.clearTimeout(timer)

  if (playing.value && props.projects.length > 1) {
    timer = window.setTimeout(() => show(active.value + 1), INTERVAL_MS)
  }
}

watch(playing, restart)
watch(
  () => props.projects,
  () => show(0),
)

onMounted(() => {
  playing.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  restart()
})

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <section
    v-if="current"
    aria-roledescription="carousel"
    :aria-label="t('home.featured')"
    class="relative h-[75svh] min-h-[480px] overflow-hidden bg-black text-white md:h-[calc(100svh-4.5rem)] md:min-h-[560px]"
  >
    <TransitionGroup
      enter-active-class="transition-opacity duration-1000 ease-out"
      leave-active-class="transition-opacity duration-1000 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <RouterLink
        :key="current.id"
        :to="{ name: 'project', params: { locale, slug: current.slug } }"
        class="absolute inset-0 block"
        tabindex="-1"
        aria-hidden="true"
      >
        <AppImage :media="current.cover" :alt="current.title" eager class="size-full" />
      </RouterLink>
    </TransitionGroup>

    <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-black/10" />

    <Transition
      mode="out-in"
      enter-active-class="transition-opacity duration-700 ease-out"
      leave-active-class="transition-opacity duration-300 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div :key="current.id" class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-page pb-20 text-center md:pb-16">
        <ProjectMeta :project="current" class="text-xs text-white/80" />
        <h2 class="text-3xl font-normal md:text-5xl">{{ current.title }}</h2>
        <p v-if="current.summary" class="max-w-xl text-sm text-white/85">{{ current.summary }}</p>
        <RouterLink :to="{ name: 'project', params: { locale, slug: current.slug } }" class="link-underline mt-2 text-sm">
          {{ t('common.viewProject') }} <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </Transition>

    <div class="absolute inset-x-0 bottom-0 flex items-center justify-between px-page pb-6 text-sm">
      <p class="tabular-nums" aria-live="polite">
        {{ String(active + 1).padStart(2, '0') }} <span class="text-white/60">/ {{ String(projects.length).padStart(2, '0') }}</span>
      </p>
      <div v-if="projects.length > 1" class="flex items-center gap-5">
        <button type="button" class="link-underline" :aria-label="t('a11y.previous')" @click="show(active - 1)">←</button>
        <button
          type="button"
          class="link-underline text-xs"
          :aria-label="playing ? t('a11y.pauseSlideshow') : t('a11y.playSlideshow')"
          @click="playing = !playing"
        >
          {{ playing ? '❙❙' : '▶' }}
        </button>
        <button type="button" class="link-underline" :aria-label="t('a11y.next')" @click="show(active + 1)">→</button>
      </div>
    </div>
  </section>
</template>
