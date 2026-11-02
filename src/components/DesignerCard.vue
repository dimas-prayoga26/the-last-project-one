<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import AppImage from '@/components/ui/AppImage.vue'
import type { DesignerSummary } from '@/types/api'

defineProps<{
  designer: DesignerSummary
  sizes?: string
}>()

const { locale } = useI18n()
</script>

<template>
  <article class="group">
    <RouterLink :to="{ name: 'designer', params: { locale, slug: designer.slug } }" class="flex flex-col focus-visible:outline-offset-4">
      <AppImage
        :media="designer.photo"
        :alt="designer.name"
        variant="card"
        :sizes="sizes ?? '(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw'"
        class="aspect-card [&_img]:duration-1000 [&_img]:group-hover:scale-[1.02]"
      />
      <div class="flex flex-col gap-0.5 pt-4">
        <h3 class="text-base leading-snug font-medium">{{ designer.name }}</h3>
        <p v-if="designer.title" class="text-sm text-grey-dark">{{ designer.title }}</p>
        <p v-if="designer.location" class="mt-2 text-xs text-grey-dark">{{ designer.location }}</p>
      </div>
    </RouterLink>
  </article>
</template>
