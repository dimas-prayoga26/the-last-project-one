<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'
import type { ProjectSummary } from '@/types/api'

const props = withDefaults(
  defineProps<{
    projects: ProjectSummary[]
    loading?: boolean
    /** Number of skeleton cards shown while loading. */
    placeholders?: number
    columns?: 3 | 4
    /** The first and sixth works span two columns, like normcph.com's listings. */
    bento?: boolean
  }>(),
  { loading: false, placeholders: 6, columns: 3, bento: false },
)

const WIDE_POSITIONS = [0, 5]

function isWide(index: number): boolean {
  return props.bento && WIDE_POSITIONS.includes(index)
}

function sizesFor(index: number): string {
  if (isWide(index)) {
    return props.columns === 4 ? '(min-width: 1280px) 50vw, (min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 66vw, 100vw'
  }

  return props.columns === 4
    ? '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
    : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
}
</script>

<template>
  <div class="project-grid" :data-columns="columns">
    <ProjectCard
      v-for="(project, index) in projects"
      :key="project.id"
      v-reveal
      :project="project"
      :sizes="sizesFor(index)"
      :variant="isWide(index) ? 'full' : 'card'"
      media-class="project-grid-media"
      :class="{ 'project-grid-wide': isWide(index) }"
    />
    <template v-if="loading">
      <div v-for="index in placeholders" :key="`placeholder-${index}`" class="flex flex-col gap-4" aria-hidden="true">
        <div class="project-grid-media animate-pulse bg-grey-tint" />
        <div class="h-4 w-2/3 animate-pulse bg-grey-tint" />
        <div class="h-3 w-1/3 animate-pulse bg-grey-tint" />
      </div>
    </template>
  </div>
</template>
