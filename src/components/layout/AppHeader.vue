<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import MobileMenu from '@/components/layout/MobileMenu.vue'
import { useMainMenu } from '@/composables/useMainMenu'

const { t, locale } = useI18n()
const route = useRoute()
const menu = useMainMenu()

const openKey = ref<string | null>(null)
const mobileOpen = ref(false)
const scrolled = ref(false)
let closeTimer: number | undefined

function open(key: string): void {
  window.clearTimeout(closeTimer)
  openKey.value = key
}

function scheduleClose(): void {
  window.clearTimeout(closeTimer)
  closeTimer = window.setTimeout(() => (openKey.value = null), 150)
}

function toggle(key: string): void {
  if (openKey.value === key) {
    openKey.value = null
  } else {
    open(key)
  }
}

/** Closes a dropdown once keyboard focus has left its menu item. */
function onFocusOut(event: FocusEvent): void {
  const item = event.currentTarget as HTMLElement

  if (!item.contains(event.relatedTarget as Node | null)) {
    openKey.value = null
  }
}

function onScroll(): void {
  scrolled.value = window.scrollY > 8
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    openKey.value = null
  }
}

watch(
  () => route.fullPath,
  () => {
    openKey.value = null
    mobileOpen.value = false
  },
)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(closeTimer)
})
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-40 border-b bg-white transition-colors duration-300" :class="scrolled ? 'border-black/10' : 'border-transparent'">
    <div class="grid h-18 grid-cols-[1fr_auto_1fr] items-center gap-unit px-page">
      <RouterLink :to="{ name: 'home', params: { locale } }" :aria-label="t('a11y.home')" class="justify-self-start">
        <img src="/brand/tlp-logo-primary-black.svg" alt="" width="120" height="40" class="h-10 w-30" />
      </RouterLink>

      <nav :aria-label="t('a11y.mainNavigation')" class="hidden lg:block">
        <ul class="flex items-center gap-8">
          <li
            v-for="item in menu"
            :key="item.key"
            class="relative"
            @mouseenter="item.children.length ? open(item.key) : undefined"
            @mouseleave="scheduleClose"
            @focusout="onFocusOut"
          >
            <button
              v-if="item.children.length"
              type="button"
              class="nav-link"
              :class="{ 'is-active': item.active || openKey === item.key }"
              :aria-expanded="openKey === item.key"
              :aria-controls="`menu-${item.key}`"
              @click="toggle(item.key)"
            >
              {{ item.label }}
            </button>
            <RouterLink v-else :to="item.to" class="nav-link" :class="{ 'is-active': item.active }">
              {{ item.label }}
            </RouterLink>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              leave-active-class="transition duration-150 ease-in"
              enter-from-class="opacity-0 -translate-y-1"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-if="openKey === item.key && item.children.length" :id="`menu-${item.key}`" class="absolute top-full left-1/2 -translate-x-1/2 pt-5">
                <ul class="flex min-w-52 flex-col gap-2 border border-black/10 bg-white px-6 py-5 text-sm">
                  <li v-if="item.key !== 'studio'">
                    <RouterLink :to="item.to" class="menu-link text-grey-dark">{{ t('works.allIn', { discipline: item.label }) }}</RouterLink>
                  </li>
                  <li v-for="child in item.children" :key="child.key">
                    <RouterLink :to="child.to" class="menu-link">{{ child.label }}</RouterLink>
                  </li>
                </ul>
              </div>
            </Transition>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-6 justify-self-end">
        <LanguageSwitcher class="hidden lg:flex" />
        <button
          type="button"
          class="nav-link lg:hidden"
          :aria-label="t('a11y.openMenu')"
          aria-haspopup="dialog"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = true"
        >
          {{ t('nav.menu') }}
        </button>
      </div>
    </div>
  </header>

  <MobileMenu v-model:open="mobileOpen" :items="menu" />
</template>
