<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <h2 class="text-center text-lg font-medium md:text-xl">{{ title }}</h2>
</template>
