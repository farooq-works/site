<script setup>
import { ref } from 'vue'

const emit = defineEmits(['authenticate', 'close'])

const username = ref('')
const password = ref('')

function submit() {
  if (!username.value.trim() || !password.value) return
  emit('authenticate')
}
</script>

<template>
  <div class="login-backdrop" @click.self="$emit('close')">
    <section class="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button class="login-close" type="button" aria-label="Close login" @click="$emit('close')">×</button>
      <p class="login-eyebrow">MFD Solutions</p>
      <h2 id="login-title">Website editor login</h2>
      <p class="login-description">Enter any username and password to continue.</p>
      <form class="login-form" @submit.prevent="submit">
        <label class="editor-field">
          Username
          <input v-model="username" type="text" autocomplete="username" required autofocus />
        </label>
        <label class="editor-field">
          Password
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <p class="login-demo-note">Demo only: this client-side login is not real authentication and does not protect the editor.</p>
        <div class="login-actions">
          <button class="editor-cancel-button" type="button" @click="$emit('close')">Cancel</button>
          <button class="builder-button-primary" type="submit">Login</button>
        </div>
      </form>
    </section>
  </div>
</template>
