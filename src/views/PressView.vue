<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppImage from '@/components/ui/AppImage.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { apiGet } from '@/lib/api'
import { formatDate } from '@/lib/format'
import type { Paginated, PressItem } from '@/types/api'

const { t, locale } = useI18n()

const items = ref<PressItem[]>([])
const page = ref(1)
const lastPage = ref(1)
const loading = ref(true)
const failed = ref(false)

async function load(targetPage: number): Promise<void> {
  loading.value = true
  failed.value = false

  try {
    const response = await apiGet<Paginated<PressItem>>('/press', { page: targetPage, per_page: 12 })

    items.value = targetPage === 1 ? response.data : [...items.value, ...response.data]
    page.value = response.meta.current_page
    lastPage.value = response.meta.last_page
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

watch(locale, () => load(1), { immediate: true })

const isEmpty = computed(() => !loading.value && !failed.value && items.value.length === 0)

useHead({
  title: () => t('press.title'),
  meta: [{ name: 'description', content: () => t('press.intro') }],
})
</script>

<template>
  <div class="pb-24 md:pb-32">
    <PageHeader :title="t('press.title')" :intro="t('press.intro')" />

    <ErrorState v-if="failed && items.length === 0" @retry="load(1)" />
    <p v-else-if="isEmpty" class="px-page text-center text-grey-dark">{{ t('press.empty') }}</p>

    <ul v-else class="grid grid-cols-1 gap-x-unit gap-y-14 px-page sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="item in items" :key="item.id" v-reveal class="flex flex-col">
        <AppImage v-if="item.image" :media="item.image" alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" class="aspect-[3/2]" />
        <p class="pt-5 text-xs text-grey-dark">
          {{ item.publication }}<span class="mx-2" aria-hidden="true">|</span>{{ formatDate(item.published_on, locale) }}
        </p>
        <h2 class="mt-2 text-base leading-snug font-medium">{{ item.title }}</h2>
        <p v-if="item.excerpt" class="mt-3 line-clamp-3 text-sm leading-relaxed text-grey-dark">{{ item.excerpt }}</p>
        <div class="mt-4 flex flex-wrap gap-5 text-sm">
          <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer" class="link-underline">
            {{ t('press.readArticle') }} <span aria-hidden="true">↗</span>
          </a>
          <a v-if="item.document_url" :href="item.document_url" target="_blank" rel="noopener noreferrer" class="link-underline">
            {{ t('press.downloadPdf') }} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </li>
    </ul>

    <p v-if="loading" class="px-page pt-12 text-center text-sm text-grey-dark" aria-live="polite">{{ t('common.loading') }}</p>
    <div v-else-if="page < lastPage" class="flex justify-center pt-16">
      <button type="button" class="btn-outline" @click="load(page + 1)">{{ t('common.loadMore') }}</button>
    </div>
  </div>
</template>
