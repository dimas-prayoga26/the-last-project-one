<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import DesignerCard from '@/components/DesignerCard.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import type { DesignerSummary, Resource } from '@/types/api'

const { t } = useI18n()

const { data, error, loading, reload } = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))

useHead({
  title: () => t('designers.title'),
  meta: [{ name: 'description', content: () => t('designers.intro') }],
})
</script>

<template>
  <div class="pb-24 md:pb-32">
    <PageHeader :title="t('designers.title')" :intro="t('designers.intro')">
      <p v-if="data" class="text-xs text-grey-dark">{{ t('common.designers', data.data.length) }}</p>
    </PageHeader>

    <ErrorState v-if="error" @retry="reload" />
    <div v-else class="grid grid-cols-2 gap-x-unit gap-y-14 px-page md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <DesignerCard v-for="designer in data?.data ?? []" :key="designer.id" v-reveal :designer="designer" />
      <template v-if="loading && !data">
        <div v-for="index in 10" :key="index" class="flex flex-col gap-4" aria-hidden="true">
          <div class="aspect-card animate-pulse bg-grey-tint" />
          <div class="h-4 w-2/3 animate-pulse bg-grey-tint" />
        </div>
      </template>
    </div>
  </div>
</template>
