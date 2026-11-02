<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import SectionHeading from '@/components/ui/SectionHeading.vue'

defineProps<{
  title: string
  /** Vertical label kept in view in both side margins on wide screens. */
  sideLabel?: string
  link?: RouteLocationRaw
  linkLabel?: string
}>()
</script>

<template>
  <section class="relative px-page pt-20 md:pt-28">
    <template v-if="sideLabel">
      <div
        v-for="side in ['left', 'right']"
        :key="side"
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 hidden w-page justify-center xl:flex"
        :class="side === 'left' ? 'left-0' : 'right-0'"
      >
        <span
          class="sticky top-[45vh] self-start text-xs text-grey-dark [writing-mode:vertical-rl]"
          :class="{ 'rotate-180': side === 'left' }"
        >
          {{ sideLabel }}
        </span>
      </div>
    </template>

    <SectionHeading :title="title" class="mb-10 md:mb-14" />
    <slot />

    <div v-if="link && linkLabel" class="mt-12 flex justify-center md:mt-16">
      <RouterLink :to="link" class="link-underline text-sm">{{ linkLabel }} <span aria-hidden="true">→</span></RouterLink>
    </div>
  </section>
</template>
