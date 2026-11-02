<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import LogomarkOutline from '@/components/ui/LogomarkOutline.vue'

const { t, locale } = useI18n()

useHead({
  title: () => t('notFound.title'),
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <section class="flex min-h-[70svh] flex-col items-center justify-center gap-8 px-page py-20 text-center">
    <LogomarkOutline class="w-32 text-grey-light" />
    <div class="flex flex-col gap-3">
      <h1 class="text-5xl font-normal md:text-6xl">404</h1>
      <p class="text-lg font-medium">{{ t('notFound.title') }}</p>
      <p class="text-grey-dark">{{ t('notFound.text') }}</p>
    </div>
    <RouterLink :to="{ name: 'home', params: { locale } }" class="btn-outline">← {{ t('notFound.backHome') }}</RouterLink>
  </section>
</template>
