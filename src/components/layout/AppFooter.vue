<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import { useSiteStore } from '@/stores/site'

const { t, locale } = useI18n()
const site = useSiteStore()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-black/10 px-page pt-16 pb-8 md:pt-20">
    <div class="grid grid-cols-3 gap-x-unit gap-y-12 md:grid-cols-12">
      <div class="col-span-3 flex flex-col gap-6 md:col-span-6">
        <img src="/brand/tlp-logo-primary-black.svg" alt="The Latest Project" width="120" height="40" class="h-10 w-30" />
        <p v-if="site.studio?.intro" class="max-w-xs text-sm text-grey-dark">{{ site.studio.intro }}</p>
        <div class="flex flex-col gap-1 text-sm">
          <a v-if="site.studio?.contact.email" :href="`mailto:${site.studio.contact.email}`" class="link-underline self-start">
            {{ site.studio.contact.email }}
          </a>
          <a v-if="site.studio?.contact.phone" :href="`tel:${site.studio.contact.phone.replace(/\s+/g, '')}`" class="link-underline self-start">
            {{ site.studio.contact.phone }}
          </a>
        </div>
      </div>

      <nav :aria-label="t('a11y.footerNavigation')" class="col-span-2 grid grid-cols-2 gap-x-unit md:col-span-4">
        <div class="flex flex-col gap-4">
          <h2 class="text-sm font-medium">{{ t('footer.works') }}</h2>
          <ul class="flex flex-col gap-1.5 text-sm text-grey-dark">
            <li v-for="discipline in ['architecture', 'interior', 'design']" :key="discipline">
              <RouterLink :to="{ name: 'works', params: { locale, discipline } }" class="link-underline hover:text-black">
                {{ t(`nav.${discipline}`) }}
              </RouterLink>
            </li>
          </ul>
        </div>
        <div class="flex flex-col gap-4">
          <h2 class="text-sm font-medium">{{ t('footer.studio') }}</h2>
          <ul class="flex flex-col gap-1.5 text-sm text-grey-dark">
            <li v-for="page in ['about', 'contact']" :key="page">
              <RouterLink :to="{ name: page, params: { locale } }" class="link-underline hover:text-black">{{ t(`studio.${page}`) }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="{ name: 'designers', params: { locale } }" class="link-underline hover:text-black">{{ t('nav.designers') }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="{ name: 'press', params: { locale } }" class="link-underline hover:text-black">{{ t('nav.press') }}</RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="col-span-1 flex flex-col gap-4 md:col-span-2">
        <h2 class="text-sm font-medium">
          <RouterLink :to="{ name: 'follow', params: { locale } }" class="link-underline">{{ t('studio.follow') }}</RouterLink>
        </h2>
        <SocialLinks v-if="site.studio?.socials.length" :links="site.studio.socials" class="text-sm text-grey-dark" />
      </div>
    </div>

    <div class="mt-16 flex flex-col gap-4 text-xs text-grey-dark sm:flex-row sm:items-center sm:justify-between md:mt-24">
      <p>© {{ year }} The Latest Project. {{ t('footer.rights') }}</p>
      <LanguageSwitcher />
    </div>
  </footer>
</template>
