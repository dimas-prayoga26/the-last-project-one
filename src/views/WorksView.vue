<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import ProjectGrid from '@/components/ProjectGrid.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { apiGet } from '@/lib/api'
import { useSiteStore } from '@/stores/site'
import type { Discipline, Paginated, ProjectSummary } from '@/types/api'
import NotFoundView from '@/views/NotFoundView.vue'

const PER_PAGE = 24

const { t, locale } = useI18n()
const route = useRoute()
const site = useSiteStore()

const discipline = computed(() => route.params.discipline as Discipline)
const categorySlug = computed(() => (typeof route.params.category === 'string' ? route.params.category : null))
const categories = computed(() => site.categoriesFor(discipline.value))
const category = computed(() => categories.value.find((item) => item.slug === categorySlug.value) ?? null)
const unknownCategory = computed(() => categorySlug.value !== null && categories.value.length > 0 && category.value === null)

const projects = ref<ProjectSummary[]>([])
const total = ref(0)
const page = ref(1)
const lastPage = ref(1)
const loading = ref(true)
const failed = ref(false)
let latestRequest = 0

async function load(targetPage: number): Promise<void> {
  const request = ++latestRequest
  loading.value = true
  failed.value = false

  try {
    const response = await apiGet<Paginated<ProjectSummary>>('/projects', {
      discipline: discipline.value,
      category: categorySlug.value,
      page: targetPage,
      per_page: PER_PAGE,
    })

    if (request !== latestRequest) {
      return
    }

    projects.value = targetPage === 1 ? response.data : [...projects.value, ...response.data]
    total.value = response.meta.total
    page.value = response.meta.current_page
    lastPage.value = response.meta.last_page
  } catch {
    if (request === latestRequest) {
      failed.value = true
    }
  } finally {
    if (request === latestRequest) {
      loading.value = false
    }
  }
}

watch([discipline, categorySlug, locale], () => load(1), { immediate: true })

const title = computed(() => t(`nav.${discipline.value}`))

useHead({
  title: () => (category.value ? `${category.value.name} — ${title.value}` : title.value),
})
</script>

<template>
  <NotFoundView v-if="unknownCategory" />
  <div v-else class="pb-24 md:pb-32">
    <PageHeader :eyebrow="category ? title : undefined" :title="category?.name ?? title">
      <nav v-if="categories.length" :aria-label="title" class="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        <RouterLink
          :to="{ name: 'works', params: { locale, discipline } }"
          class="menu-link"
          :class="{ 'text-grey-dark': categorySlug !== null }"
          :aria-current="categorySlug === null ? 'page' : undefined"
          active-class="is-parent-active"
          exact-active-class="router-link-active"
        >
          {{ t('common.all') }}
        </RouterLink>
        <RouterLink
          v-for="item in categories"
          :key="item.id"
          :to="{ name: 'works', params: { locale, discipline, category: item.slug } }"
          class="menu-link"
          :class="{ 'text-grey-dark': item.slug !== categorySlug }"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
      <p class="text-xs text-grey-dark" aria-live="polite">{{ loading && !total ? '' : t('common.works', total) }}</p>
    </PageHeader>

    <ErrorState v-if="failed && projects.length === 0" @retry="load(1)" />
    <div v-else class="flex flex-col gap-16 px-page">
      <ProjectGrid :projects="projects" :loading="loading" :placeholders="projects.length ? 4 : 8" :columns="4" bento />
      <p v-if="!loading && projects.length === 0" class="text-center text-grey-dark">{{ t('works.empty') }}</p>
      <div v-if="page < lastPage" class="flex justify-center">
        <button type="button" class="btn-outline" :disabled="loading" @click="load(page + 1)">
          {{ loading ? t('common.loading') : t('common.loadMore') }}
        </button>
      </div>
    </div>
  </div>
</template>
