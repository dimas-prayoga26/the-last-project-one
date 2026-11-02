<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/ui/PageHeader.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { ApiError, apiPost } from '@/lib/api'
import { useSiteStore } from '@/stores/site'
import type { ContactMessageInput } from '@/types/api'

type Field = 'name' | 'email' | 'phone' | 'subject' | 'message'

const { t } = useI18n()
const site = useSiteStore()
const contact = computed(() => site.studio?.contact ?? null)

const emptyForm = (): ContactMessageInput => ({ name: '', email: '', phone: '', subject: '', message: '', website: '' })
const form = reactive<ContactMessageInput>(emptyForm())
const fieldErrors = ref<Partial<Record<Field, boolean>>>({})
const status = ref<'idle' | 'sending' | 'sent' | 'failed' | 'rate-limited'>('idle')

const fields: { name: Field; type: string; autocomplete: string; required: boolean }[] = [
  { name: 'name', type: 'text', autocomplete: 'name', required: true },
  { name: 'email', type: 'email', autocomplete: 'email', required: true },
  { name: 'phone', type: 'tel', autocomplete: 'tel', required: false },
  { name: 'subject', type: 'text', autocomplete: 'off', required: false },
]

function validate(): boolean {
  fieldErrors.value = {
    name: form.name.trim() === '',
    email: !/^\S+@\S+\.\S+$/.test(form.email.trim()),
    message: form.message.trim() === '',
  }

  return !Object.values(fieldErrors.value).some(Boolean)
}

async function submit(): Promise<void> {
  if (!validate()) {
    return
  }

  status.value = 'sending'

  try {
    await apiPost('/contact-messages', form)
    Object.assign(form, emptyForm())
    status.value = 'sent'
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      fieldErrors.value = Object.fromEntries(Object.keys(error.errors).map((field) => [field, true]))
      status.value = 'idle'
    } else {
      status.value = error instanceof ApiError && error.status === 429 ? 'rate-limited' : 'failed'
    }
  }
}

const whatsappUrl = computed(() => (contact.value?.whatsapp ? `https://wa.me/${contact.value.whatsapp.replace(/\D/g, '')}` : null))

useHead({
  title: () => t('contact.title'),
  meta: [{ name: 'description', content: () => t('contact.intro') }],
})
</script>

<template>
  <div class="pb-24 md:pb-32">
    <PageHeader :eyebrow="t('nav.studio')" :title="t('contact.title')" :intro="t('contact.intro')" />

    <dl class="flex flex-col items-center px-page text-center">
      <div v-if="contact?.email" class="stacked-pair">
        <dt class="text-xs text-grey-dark">{{ t('contact.email') }}</dt>
        <dd><a :href="`mailto:${contact.email}`" class="link-underline">{{ contact.email }}</a></dd>
      </div>
      <div v-if="contact?.phone" class="stacked-pair">
        <dt class="text-xs text-grey-dark">{{ t('contact.phone') }}</dt>
        <dd><a :href="`tel:${contact.phone.replace(/\s+/g, '')}`" class="link-underline">{{ contact.phone }}</a></dd>
      </div>
      <div v-if="whatsappUrl" class="stacked-pair">
        <dt class="text-xs text-grey-dark">{{ t('contact.whatsapp') }}</dt>
        <dd>
          <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="link-underline">{{ contact?.whatsapp }}</a>
        </dd>
      </div>
      <div v-if="contact?.address" class="stacked-pair">
        <dt class="text-xs text-grey-dark">{{ t('contact.address') }}</dt>
        <dd class="whitespace-pre-line">{{ contact.address }}</dd>
        <dd v-if="contact.map_url">
          <a :href="contact.map_url" target="_blank" rel="noopener noreferrer" class="link-underline text-sm">
            {{ t('contact.openMap') }} <span aria-hidden="true">↗</span>
          </a>
        </dd>
      </div>
      <div v-if="contact?.office_hours" class="stacked-pair">
        <dt class="text-xs text-grey-dark">{{ t('contact.hours') }}</dt>
        <dd>{{ contact.office_hours }}</dd>
      </div>
    </dl>

    <div class="px-page pt-20 md:pt-28">
      <section class="mx-auto flex max-w-2xl flex-col gap-10">
        <SectionHeading :title="t('contact.form.title')" />

        <div v-if="status === 'sent'" role="status" class="flex flex-col items-start gap-6">
          <p class="text-lg">{{ t('contact.form.success') }}</p>
          <button type="button" class="btn-outline" @click="status = 'idle'">{{ t('contact.form.sendAnother') }}</button>
        </div>

        <form v-else novalidate class="flex flex-col gap-8" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div v-for="field in fields" :key="field.name" class="flex flex-col gap-1">
              <label :for="`contact-${field.name}`" class="field-label">{{ t(`contact.form.${field.name}`) }}</label>
              <input
                :id="`contact-${field.name}`"
                v-model="form[field.name]"
                :type="field.type"
                :name="field.name"
                :autocomplete="field.autocomplete"
                :required="field.required"
                :aria-invalid="fieldErrors[field.name] ? 'true' : undefined"
                :aria-describedby="fieldErrors[field.name] ? `contact-${field.name}-error` : undefined"
                class="field-input"
              />
              <p v-if="fieldErrors[field.name]" :id="`contact-${field.name}-error`" class="text-sm">{{ t(`contact.errors.${field.name}`) }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label for="contact-message" class="field-label">{{ t('contact.form.message') }}</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              rows="6"
              required
              :aria-invalid="fieldErrors.message ? 'true' : undefined"
              :aria-describedby="fieldErrors.message ? 'contact-message-error' : undefined"
              class="field-input resize-y"
            />
            <p v-if="fieldErrors.message" id="contact-message-error" class="text-sm">{{ t('contact.errors.message') }}</p>
          </div>

          <!-- Honeypot: hidden from people, filled in by bots. -->
          <div class="hidden" aria-hidden="true">
            <label for="contact-website">Website</label>
            <input id="contact-website" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
          </div>

          <p v-if="status === 'failed' || status === 'rate-limited'" role="alert" class="text-lg">
            {{ status === 'rate-limited' ? t('contact.form.rateLimited') : t('contact.form.error') }}
          </p>

          <div>
            <button type="submit" class="btn-primary" :disabled="status === 'sending'">
              {{ status === 'sending' ? t('contact.form.sending') : t('contact.form.submit') }}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
