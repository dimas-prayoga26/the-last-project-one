<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import type { MenuItem } from '@/composables/useMainMenu'
import { lockScroll } from '@/composables/useSmoothScroll'
import { useSiteStore } from '@/stores/site'

defineProps<{ items: MenuItem[] }>()

const isOpen = defineModel<boolean>('open', { required: true })

const { t, locale } = useI18n()
const site = useSiteStore()
const expandedKey = ref<string | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

watch(isOpen, async (value) => {
  lockScroll('mobile-menu', value)

  if (value) {
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else {
    window.removeEventListener('keydown', onKeydown)
    expandedKey.value = null
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  lockScroll('mobile-menu', false)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-500 ease-[cubic-bezier(.76,0,.24,1)]"
      leave-active-class="transition duration-300 ease-in"
      enter-from-class="-translate-y-full"
      leave-to-class="-translate-y-full"
    >
      <div
        v-if="isOpen"
        role="dialog"
        aria-modal="true"
        :aria-label="t('a11y.mainNavigation')"
        data-lenis-prevent
        class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white lg:hidden"
      >
        <div class="flex h-18 shrink-0 items-center justify-between border-b border-black/10 px-page">
          <RouterLink :to="{ name: 'home', params: { locale } }" :aria-label="t('a11y.home')" @click="isOpen = false">
            <img src="/brand/tlp-logo-primary-black.svg" alt="" width="120" height="40" class="h-10 w-30" />
          </RouterLink>
          <button ref="closeButton" type="button" class="nav-link" @click="isOpen = false">
            {{ t('a11y.close') }}
          </button>
        </div>

        <nav class="flex-1 px-page py-8">
          <ul class="flex flex-col">
            <li v-for="item in items" :key="item.key" class="border-b border-black/10">
              <button
                v-if="item.children.length"
                type="button"
                class="flex w-full items-center justify-between py-4 text-2xl font-normal"
                :aria-expanded="expandedKey === item.key"
                @click="expandedKey = expandedKey === item.key ? null : item.key"
              >
                {{ item.label }}
                <span aria-hidden="true" class="text-xl transition-transform" :class="{ 'rotate-45': expandedKey === item.key }">+</span>
              </button>
              <RouterLink v-else :to="item.to" class="block py-4 text-2xl" @click="isOpen = false">
                {{ item.label }}
              </RouterLink>

              <ul v-if="expandedKey === item.key" class="flex flex-col gap-3 pb-6">
                <li v-if="item.key !== 'studio'">
                  <RouterLink :to="item.to" class="text-lg text-grey-dark" @click="isOpen = false">
                    {{ t('works.allIn', { discipline: item.label }) }}
                  </RouterLink>
                </li>
                <li v-for="child in item.children" :key="child.key">
                  <RouterLink :to="child.to" class="text-lg" @click="isOpen = false">{{ child.label }}</RouterLink>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <div class="flex items-end justify-between gap-unit px-page pb-8 text-sm">
          <SocialLinks v-if="site.studio?.socials.length" :links="site.studio.socials" />
          <LanguageSwitcher />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
