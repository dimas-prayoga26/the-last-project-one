<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import ProjectGrid from '@/components/ProjectGrid.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import AppImage from '@/components/ui/AppImage.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { ApiError, apiGet } from '@/lib/api'
import { paragraphs } from '@/lib/format'
import type { Designer, Resource } from '@/types/api'
import NotFoundView from '@/views/NotFoundView.vue'

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error, loading, reload } = useAsyncData(() => apiGet<Resource<Designer>>(`/designers/${slug.value}`), [slug])

const designer = computed(() => data.value?.data ?? null)
const notFound = computed(() => error.value instanceof ApiError && error.value.status === 404)

useHead({
  title: () => designer.value?.name ?? '',
  meta: [
    { name: 'description', content: () => designer.value?.bio ?? t('designers.intro') },
    { property: 'og:image', content: () => designer.value?.photo?.url ?? '/brand/tlp-og-default-1200x630.png' },
  ],
})
</script>

<template>
  <NotFoundView v-if="notFound" />
  <ErrorState v-else-if="error" @retry="reload" />

  <div v-else-if="loading && !designer" class="grid grid-cols-12 gap-unit px-page pt-16" aria-busy="true">
    <div class="col-span-12 aspect-card animate-pulse bg-grey-tint md:col-span-4" />
  </div>

  <div v-else-if="designer" class="pb-24 md:pb-32">
    <div class="grid grid-cols-12 gap-x-unit gap-y-10 px-page pt-16 md:pt-24">
      <div class="col-span-12 sm:col-span-8 sm:col-start-3 md:col-span-4 md:col-start-1">
        <AppImage :media="designer.photo" :alt="designer.name" variant="card" eager sizes="(min-width: 768px) 33vw, 100vw" class="aspect-card" />
      </div>

      <div class="col-span-12 flex flex-col gap-10 md:col-span-7 md:col-start-6">
        <header class="flex flex-col gap-3">
          <RouterLink :to="{ name: 'designers', params: { locale } }" class="link-underline self-start text-xs text-grey-dark">
            ← {{ t('designers.title') }}
          </RouterLink>
          <h1 class="text-3xl font-normal md:text-4xl">{{ designer.name }}</h1>
          <p v-if="designer.title" class="text-base text-grey-dark">{{ designer.title }}</p>
        </header>

        <div v-if="designer.bio" class="prose-body max-w-[62ch] text-base md:text-lg">
          <p v-for="(paragraph, position) in paragraphs(designer.bio)" :key="position">{{ paragraph }}</p>
        </div>

        <dl class="grid grid-cols-1 gap-6 border-t border-black/10 pt-6 sm:grid-cols-3">
          <div v-if="designer.location" class="flex flex-col gap-1">
            <dt class="text-xs text-grey-dark">{{ t('designers.location') }}</dt>
            <dd>{{ designer.location }}</dd>
          </div>
          <div v-if="designer.email" class="flex flex-col gap-1">
            <dt class="text-xs text-grey-dark">{{ t('designers.email') }}</dt>
            <dd class="break-all">
              <a :href="`mailto:${designer.email}`" class="link-underline">{{ designer.email }}</a>
            </dd>
          </div>
          <div v-if="designer.socials.length" class="flex flex-col gap-1">
            <dt class="text-xs text-grey-dark">{{ t('designers.social') }}</dt>
            <dd><SocialLinks :links="designer.socials" /></dd>
          </div>
        </dl>
      </div>
    </div>

    <section class="flex flex-col gap-10 px-page pt-20 md:gap-14 md:pt-28">
      <SectionHeading :title="t('designers.works')" />
      <ProjectGrid v-if="designer.projects.length" :projects="designer.projects" :columns="4" />
      <p v-else class="text-center text-grey-dark">{{ t('designers.noWorks') }}</p>
    </section>
  </div>
</template>
