<script setup>
defineProps({
  first: { type: Boolean, default: false },
  last: { type: Boolean, default: false },
  hasList: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'remove', 'move-up', 'move-down', 'add-item'])
</script>

<template>
  <div class="section-tools" aria-label="Section editing controls">
    <span class="mr-auto hidden text-xs font-semibold uppercase tracking-widest text-blue-200 sm:block">Editing section</span>
    <button v-if="hasList" class="section-tool-button" type="button" @click="emit('add-item')">+ Add element</button>
    <button class="section-tool-button" type="button" @click="emit('edit')">✎ Edit content</button>
    <button class="section-tool-button section-tool-square" type="button" :disabled="first" aria-label="Move section up" title="Move section up" @click="emit('move-up')">↑</button>
    <button class="section-tool-button section-tool-square" type="button" :disabled="last" aria-label="Move section down" title="Move section down" @click="emit('move-down')">↓</button>
    <button class="section-tool-button section-tool-danger" type="button" @click="emit('remove')">Delete</button>
  </div>
</template>
