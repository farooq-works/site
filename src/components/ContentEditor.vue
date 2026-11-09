<script setup>
import { ref, watch } from 'vue'
import { createListItem } from '../data/siteContent.js'

const props = defineProps({
  modelValue: { type: Object, required: true },
  title: { type: String, required: true },
  canDelete: { type: Boolean, default: true },
})
const emit = defineEmits(['save', 'cancel', 'remove'])
const draft = ref(copy(props.modelValue))

watch(() => props.modelValue, (value) => {
  draft.value = copy(value)
})

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}

function labelFor(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function isLongText(key) {
  return /description|body|answer|quote|features|highlight|text/i.test(key)
}

function isObjectArray(key, value) {
  return value.length > 0
    ? typeof value[0] === 'object' && value[0] !== null
    : key !== 'features'
}

function isEditableField(key, value) {
  return key !== 'id' && key !== 'type' && !Array.isArray(value) && (value === null || typeof value !== 'object')
}

function isItemField(key, value) {
  return key !== 'id' && !Array.isArray(value) && (value === null || typeof value !== 'object')
}

function addItem(key, list) {
  if (!isObjectArray(key, list)) {
    list.push('')
    return
  }
  list.push(createListItem(draft.value, key))
}

function save() {
  emit('save', copy(draft.value))
}
</script>

<template>
  <div class="editor-backdrop" role="presentation" @click.self="emit('cancel')">
    <form class="editor-modal" role="dialog" aria-modal="true" :aria-label="title" @submit.prevent="save">
      <div class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0d1628]/95 px-5 py-4 backdrop-blur sm:px-7">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-mint">Website editor</p>
          <h2 class="mt-1 text-xl font-bold text-white">{{ title }}</h2>
        </div>
        <button class="edit-icon-button" type="button" aria-label="Close editor" @click="emit('cancel')">×</button>
      </div>

      <div class="space-y-5 px-5 py-6 sm:px-7">
        <template v-for="(value, key) in draft" :key="key">
          <label v-if="isEditableField(key, value)" class="editor-field">
            <span>{{ labelFor(key) }}</span>
            <textarea v-if="isLongText(key)" v-model="draft[key]" rows="3"></textarea>
            <input v-else-if="typeof value === 'boolean'" v-model="draft[key]" type="checkbox" class="h-5 w-5 accent-blue-500" />
            <input v-else-if="typeof value === 'number'" v-model.number="draft[key]" type="number" />
            <input v-else v-model="draft[key]" type="text" />
          </label>

          <fieldset v-else-if="Array.isArray(value)" class="editor-list">
            <legend>{{ labelFor(key) }}</legend>
            <div v-if="isObjectArray(key, value)" class="space-y-3">
              <article v-for="(item, index) in value" :key="item.id || `${key}-${index}`" class="editor-list-item">
                <div class="mb-3 flex items-center justify-between gap-3">
                  <h3 class="text-sm font-bold text-white">Element {{ index + 1 }}</h3>
                  <button class="editor-remove-button" type="button" @click="value.splice(index, 1)">Remove</button>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <template v-for="(itemValue, itemKey) in item" :key="itemKey">
                    <label v-if="isItemField(itemKey, itemValue)" class="editor-field">
                      <span>{{ labelFor(itemKey) }}</span>
                      <textarea v-if="isLongText(itemKey)" v-model="item[itemKey]" rows="3"></textarea>
                      <input v-else-if="typeof itemValue === 'boolean'" v-model="item[itemKey]" type="checkbox" class="h-5 w-5 accent-blue-500" />
                      <input v-else-if="typeof itemValue === 'number'" v-model.number="item[itemKey]" type="number" />
                      <input v-else v-model="item[itemKey]" type="text" />
                    </label>
                  </template>
                </div>
                <template v-for="(nestedValue, nestedKey) in item" :key="nestedKey">
                  <fieldset v-if="Array.isArray(nestedValue)" class="editor-list mt-3">
                    <legend>{{ labelFor(nestedKey) }}</legend>
                    <div v-if="isObjectArray(nestedKey, nestedValue)" class="space-y-3">
                      <article v-for="(nestedItem, nestedIndex) in nestedValue" :key="nestedItem.id || `${nestedKey}-${nestedIndex}`" class="editor-list-item">
                        <div class="mb-3 flex items-center justify-between gap-3">
                          <h4 class="text-sm font-bold text-white">Element {{ nestedIndex + 1 }}</h4>
                          <button class="editor-remove-button" type="button" @click="nestedValue.splice(nestedIndex, 1)">Remove</button>
                        </div>
                        <div class="grid gap-3 sm:grid-cols-2">
                          <template v-for="(nestedField, nestedFieldKey) in nestedItem" :key="nestedFieldKey">
                            <label v-if="isItemField(nestedFieldKey, nestedField)" class="editor-field">
                              <span>{{ labelFor(nestedFieldKey) }}</span>
                              <textarea v-if="isLongText(nestedFieldKey)" v-model="nestedItem[nestedFieldKey]" rows="2"></textarea>
                              <input v-else-if="typeof nestedField === 'boolean'" v-model="nestedItem[nestedFieldKey]" type="checkbox" class="h-5 w-5 accent-blue-500" />
                              <input v-else v-model="nestedItem[nestedFieldKey]" type="text" />
                            </label>
                          </template>
                        </div>
                      </article>
                    </div>
                    <div v-else class="space-y-3">
                      <label v-for="(nestedItem, nestedIndex) in nestedValue" :key="nestedIndex" class="editor-field">
                        <span>Element {{ nestedIndex + 1 }}</span>
                        <div class="flex gap-2">
                          <input v-model="nestedValue[nestedIndex]" type="text" />
                          <button class="editor-remove-button" type="button" :aria-label="`Remove element ${nestedIndex + 1}`" @click="nestedValue.splice(nestedIndex, 1)">×</button>
                        </div>
                      </label>
                    </div>
                    <button class="editor-add-button mt-3" type="button" @click="addItem(nestedKey, nestedValue)">+ Add element</button>
                  </fieldset>
                </template>
              </article>
            </div>
            <div v-else class="space-y-3">
              <label v-for="(item, index) in value" :key="index" class="editor-field">
                <span>Element {{ index + 1 }}</span>
                <div class="flex gap-2">
                  <input v-model="value[index]" type="text" />
                  <button class="editor-remove-button" type="button" :aria-label="`Remove element ${index + 1}`" @click="value.splice(index, 1)">×</button>
                </div>
              </label>
            </div>
            <button class="editor-add-button mt-3" type="button" @click="addItem(key, value)">+ Add element</button>
          </fieldset>
        </template>
      </div>

      <div class="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#0d1628]/95 px-5 py-4 backdrop-blur sm:px-7">
        <button v-if="canDelete" class="editor-remove-button" type="button" @click="emit('remove')">Delete section</button>
        <span v-else></span>
        <div class="ml-auto flex gap-3">
          <button class="editor-cancel-button" type="button" @click="emit('cancel')">Cancel</button>
          <button class="editor-save-button" type="submit">Save changes</button>
        </div>
      </div>
    </form>
  </div>
</template>
