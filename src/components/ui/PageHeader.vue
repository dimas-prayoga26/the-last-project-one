<script setup lang="ts">
defineProps<{
  title: string
  eyebrow?: string
  intro?: string | null
}>()
</script>

<template>
  <header class="flex flex-col items-center gap-4 px-page pt-16 pb-12 text-center md:pt-24 md:pb-16">
    <p v-if="eyebrow" class="text-sm text-grey-dark">{{ eyebrow }}</p>
    <h1 class="text-3xl font-normal md:text-4xl">{{ title }}</h1>
    <p v-if="intro" class="max-w-xl text-base text-grey-dark">{{ intro }}</p>
    <slot />
  </header>
</template>
