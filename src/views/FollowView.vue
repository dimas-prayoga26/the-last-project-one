<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SocialLinks from '@/components/SocialLinks.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { apiGet } from '@/lib/api'
import { platformLabel, socialHandle } from '@/lib/format'
import { useSiteStore } from '@/stores/site'
import type { DesignerSummary, Resource } from '@/types/api'

const { t, locale } = useI18n()
const site = useSiteStore()

const designers = useAsyncData(() => apiGet<Resource<DesignerSummary[]>>('/designers'))
const designersWithSocials = computed(() => (designers.data.value?.data ?? []).filter((designer) => designer.socials.length > 0))

useHead({
  title: () => t('follow.title'),
  meta: [{ name: 'description', content: () => t('follow.intro') }],
})
</script>

<template>
  <div class="pb-24 md:pb-32">
    <PageHeader :eyebrow="t('nav.studio')" :title="t('follow.title')" :intro="t('follow.intro')" />

    <div class="flex flex-col gap-20 px-page md:gap-28">
      <section v-if="site.studio?.socials.length" class="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <SectionHeading :title="t('follow.studio')" />
        <ul class="flex flex-col border-t border-black/10">
          <li v-for="link in site.studio.socials" :key="link.url" class="border-b border-black/10">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-wrap items-baseline justify-between gap-x-unit gap-y-1 py-5"
            >
              <span class="text-xl transition-colors group-hover:text-grey-dark md:text-2xl">{{ platformLabel(link.platform) }}</span>
              <span class="text-sm text-grey-dark">{{ socialHandle(link) }} <span aria-hidden="true">↗</span></span>
            </a>
          </li>
        </ul>
      </section>

      <section v-if="designersWithSocials.length" class="flex flex-col gap-10">
        <SectionHeading :title="t('follow.designers')" />
        <ul class="grid grid-cols-1 gap-x-unit gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <li v-for="designer in designersWithSocials" :key="designer.id" class="flex flex-col gap-2">
            <RouterLink :to="{ name: 'designer', params: { locale, slug: designer.slug } }" class="link-underline self-start font-medium">
              {{ designer.name }}
            </RouterLink>
            <SocialLinks :links="designer.socials" display="handle" class="text-sm" />
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
