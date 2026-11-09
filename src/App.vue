<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ContentEditor from './components/ContentEditor.vue'
import LoginModal from './components/LoginModal.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteSection from './components/SiteSection.vue'
import { createDefaultSections, createListItem } from './data/siteContent.js'
import profileImage from './assets/images/MF.jpg'

const STORAGE_KEY = 'mfd-solutions-site-content-v2'
const sectionTypeLabels = {
  about: 'About',
  services: 'Services',
  details: 'Service details',
  why: 'Why MFD',
  tech: 'Tech stack',
  stats: 'Statistics',
  process: 'Process',
  portfolio: 'Portfolio',
  guarantee: 'Guarantee',
  locations: 'Global locations',
  newsletter: 'Newsletter',
  pricing: 'Pricing & offer',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  contact: 'Contact',
}
const addableTypes = Object.entries(sectionTypeLabels).map(([value, label]) => ({ value, label }))
const editMode = ref(false)
const editorAuthenticated = ref(false)
const loginOpen = ref(false)
const activeEditor = ref(null)
const editDraft = ref(null)
const editorTitle = ref('')
const selectedSectionType = ref('services')
const notice = ref('')
const chatVisible = ref(false)
const backToTopVisible = ref(false)
const scrollProgress = ref(0)
const uploadInput = ref(null)
let noticeTimer
let chatTimer
let chatCloseTimer

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}

function addMissingIds(value, used = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item && typeof item === 'object') addMissingIds(item, used)
    })
    return
  }
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value.items) || value.type) {
    if (!value.id || used.has(value.id)) value.id = `element-${crypto.randomUUID()}`
    used.add(value.id)
  }
  Object.values(value).forEach((child) => addMissingIds(child, used))
}

function loadInitialContent() {
  const defaultValue = {
    brand: {
      brand: 'MFD Solutions',
      tagline: 'Design & Development',
      ctaLabel: 'Get a Quote',
      whatsappUrl: 'https://wa.me/966570849844',
      chatGreeting: '👋 Hi there! Welcome to MFD Solutions, I’m Mohammad Farooq.',
      chatPrompt: 'How can I help today? Ask me about web design, development, or any of our services.',
    },
    sections: createDefaultSections(),
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultValue
    const parsed = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sections)) {
      throw new Error('The saved MFD website data has an invalid format.')
    }
    const restored = {
      brand: { ...defaultValue.brand, ...(parsed.brand ?? {}) },
      sections: parsed.sections,
    }
    const aboutSection = restored.sections.find((section) => section.type === 'about')
    if (aboutSection && (!aboutSection.image || aboutSection.image.includes('photo-1500648767791'))) {
      aboutSection.image = profileImage
    }
    addMissingIds(restored.sections)
    return restored
  } catch (error) {
    console.error('Unable to load saved MFD website content.', error)
    notice.value = 'Saved website content could not be loaded. Default content is shown; use Import backup to restore a valid JSON backup.'
    return defaultValue
  }
}

const site = ref(loadInitialContent())
const sections = computed(() => site.value.sections)
const visibleSections = computed(() => sections.value.filter((section) => section.type !== 'header'))

function showNotice(message) {
  notice.value = message
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    notice.value = ''
  }, 5000)
}

watch(site, (value) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch (error) {
    console.error('Unable to save MFD website content to local storage.', error)
    showNotice('Changes are visible now but could not be saved in this browser. Download a backup to keep them.')
  }
}, { deep: true })

function sectionIndex(sectionId) {
  return sections.value.findIndex((section) => section.id === sectionId)
}

function openSectionEditor(sectionId) {
  const section = sections.value.find((item) => item.id === sectionId)
  if (!section) return
  activeEditor.value = { type: 'section', id: sectionId }
  editDraft.value = copy(section)
  editorTitle.value = `Edit ${section.navLabel || section.eyebrow || section.label || section.title || section.type}`
}

function openBrandEditor() {
  activeEditor.value = { type: 'brand' }
  editDraft.value = copy(site.value.brand)
  editorTitle.value = 'Edit site branding'
}

function closeEditor() {
  activeEditor.value = null
  editDraft.value = null
}

function authenticateEditor() {
  editorAuthenticated.value = true
  loginOpen.value = false
  editMode.value = true
}

function logoutEditor() {
  editorAuthenticated.value = false
  editMode.value = false
  closeEditor()
}

function saveEditor(value) {
  if (activeEditor.value?.type === 'brand') {
    site.value.brand = value
    showNotice('Branding updated and saved in this browser.')
  } else if (activeEditor.value?.type === 'section') {
    const index = sectionIndex(activeEditor.value.id)
    if (index !== -1) {
      value.id = activeEditor.value.id
      site.value.sections[index] = value
      showNotice('Section content updated and saved in this browser.')
    }
  }
  closeEditor()
}

function removeSection(sectionId) {
  const section = sections.value.find((item) => item.id === sectionId)
  if (!section) return
  if (!window.confirm(`Delete the ${section.navLabel || section.eyebrow || section.type} section and all its content?`)) return
  site.value.sections = site.value.sections.filter((item) => item.id !== sectionId)
  closeEditor()
  showNotice('Section deleted.')
}

function moveSection(sectionId, direction) {
  const index = sectionIndex(sectionId)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= sections.value.length) return
  const updated = [...site.value.sections]
  ;[updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]]
  site.value.sections = updated
}

function addElement(sectionId) {
  const section = sections.value.find((item) => item.id === sectionId)
  if (!section) return
  const key = Object.keys(section).find((field) => Array.isArray(section[field]))
  if (!key) {
    openSectionEditor(sectionId)
    showNotice('This section has no list yet. Add a list in the content editor.')
    return
  }
  openSectionEditor(sectionId)
  editDraft.value[key].push(createListItem(editDraft.value, key))
  showNotice('New element added. Edit its details and save.')
}

function removeElement({ sectionId, key, index }) {
  const section = sections.value.find((item) => item.id === sectionId)
  if (!section) return
  const path = key.split('.')
  let list = section
  for (const part of path) list = list?.[Number.isInteger(Number(part)) ? Number(part) : part]
  if (!Array.isArray(list) || index < 0 || index >= list.length) return
  list.splice(index, 1)
  showNotice('Element removed and saved.')
}

function addSection() {
  const defaults = createDefaultSections()
  const template = defaults.find((section) => section.type === selectedSectionType.value)
  if (!template) return
  const section = copy(template)
  section.id = `${section.type}-${crypto.randomUUID().slice(0, 8)}`
  const footerIndex = site.value.sections.findIndex((item) => item.type === 'footer')
  site.value.sections.splice(footerIndex === -1 ? site.value.sections.length : footerIndex, 0, section)
  openSectionEditor(section.id)
  showNotice(`${sectionTypeLabels[section.type]} section added. Customize its content and save.`)
}

function resetContent() {
  if (!window.confirm('Reset all sections and content to the original MFD Solutions website? This will replace your saved changes.')) return
  site.value = {
    brand: {
      brand: 'MFD Solutions',
      tagline: 'Design & Development',
      ctaLabel: 'Get a Quote',
      whatsappUrl: 'https://wa.me/966570849844',
      chatGreeting: '👋 Hi there! Welcome to MFD Solutions, I’m Mohammad Farooq.',
      chatPrompt: 'How can I help today? Ask me about web design, development, or any of our services.',
    },
    sections: createDefaultSections(),
  }
  closeEditor()
  showNotice('Website content reset to the original MFD Solutions defaults.')
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify(site.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'mfd-solutions-content.json'
  link.click()
  URL.revokeObjectURL(url)
  showNotice('Website content backup downloaded.')
}

async function importBackup(event) {
  const [file] = event.target.files ?? []
  event.target.value = ''
  if (!file) return
  try {
    const parsed = JSON.parse(await file.text())
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sections)) {
      throw new Error('The backup must contain a sections array.')
    }
    const allowedTypes = new Set(['hero', 'marquee', 'about', ...Object.keys(sectionTypeLabels), 'footer'])
    if (parsed.sections.some((section) => !section || !allowedTypes.has(section.type))) {
      throw new Error('The backup contains an unsupported section type.')
    }
    const imported = copy(parsed)
    addMissingIds(imported.sections)
    site.value = {
      brand: { ...site.value.brand, ...(imported.brand ?? {}) },
      sections: imported.sections,
    }
    closeEditor()
    showNotice('Backup imported and saved in this browser.')
  } catch (error) {
    console.error('Unable to import MFD website content.', error)
    showNotice(`Backup not imported: ${error.message}`)
  }
}

function updateScrollState() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0
  backToTopVisible.value = window.scrollY > 400
}

function goToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeChat() {
  chatVisible.value = false
  try {
    window.sessionStorage.setItem('mfd-chat-dismissed', 'yes')
  } catch (error) {
    console.error('Unable to save the chat dismissal state.', error)
  }
}

function toggleChat() {
  chatVisible.value = !chatVisible.value
  if (chatVisible.value) {
    window.clearTimeout(chatCloseTimer)
    try {
      window.sessionStorage.removeItem('mfd-chat-dismissed')
    } catch (error) {
      console.error('Unable to update the chat dismissal state.', error)
    }
  }
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  try {
    if (window.sessionStorage.getItem('mfd-chat-dismissed') !== 'yes') {
      chatTimer = window.setTimeout(() => {
        chatVisible.value = true
        chatCloseTimer = window.setTimeout(() => {
          chatVisible.value = false
        }, 80000)
      }, 3000)
    }
  } catch (error) {
    console.error('Unable to read the chat dismissal state.', error)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.clearTimeout(noticeTimer)
  window.clearTimeout(chatTimer)
  window.clearTimeout(chatCloseTimer)
})
</script>

<template>
  <div class="min-h-screen overflow-hidden bg-ink text-slate-200">
    <div class="scroll-progress" :style="{ width: `${scrollProgress}%` }"></div>
    <SiteHeader :sections="visibleSections" :brand="site.brand" :edit-mode="editMode" @edit-brand="openBrandEditor" />

    <main>
      <SiteSection
        v-for="(section, index) in visibleSections"
        :key="section.id"
        :section="section"
        :edit-mode="editMode"
        :first="index === 0"
        :last="index === visibleSections.length - 1"
        @edit="openSectionEditor(section.id)"
        @remove="removeSection(section.id)"
        @move-up="moveSection(section.id, -1)"
        @move-down="moveSection(section.id, 1)"
        @add-item="addElement(section.id)"
        @remove-item="removeElement"
      />
    </main>

    <div class="fixed bottom-5 left-5 z-[80] flex max-w-[calc(100vw-2.5rem)] flex-col gap-3">
      <div v-if="editMode" class="builder-toolbar">
        <div class="flex flex-wrap items-center gap-2">
          <strong class="mr-1 text-xs text-white">Site editor</strong>
          <select v-model="selectedSectionType" aria-label="Section type to add" class="builder-select">
            <option v-for="option in addableTypes" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <button class="builder-button builder-button-primary" type="button" @click="addSection">+ Section</button>
          <button class="builder-button" type="button" @click="downloadBackup">Export</button>
          <button class="builder-button" type="button" @click="uploadInput?.click()">Import</button>
          <input ref="uploadInput" class="hidden" type="file" accept="application/json,.json" @change="importBackup" />
          <button class="builder-button builder-button-danger" type="button" @click="resetContent">Reset</button>
          <button class="builder-button" type="button" @click="editMode = false">Done</button>
          <button class="builder-button" type="button" @click="logoutEditor">Logout</button>
        </div>
        <p class="mt-2 text-[11px] leading-4 text-slate-400">Changes save automatically in this browser. Export a backup to keep or move them.</p>
      </div>
      <button v-else class="edit-launch-button" type="button" @click="editorAuthenticated ? editMode = true : loginOpen = true">
        {{ editorAuthenticated ? '✎ Open editor' : '↪ Login to edit website' }}
      </button>
      <p v-if="notice" class="builder-notice" role="status">{{ notice }}</p>
    </div>

    <div v-if="activeEditor && editDraft" class="z-[100]">
      <ContentEditor
        :key="activeEditor.type === 'brand' ? 'brand' : activeEditor.id"
        :model-value="editDraft"
        :title="editorTitle"
        :can-delete="activeEditor.type !== 'brand'"
        @save="saveEditor"
        @cancel="closeEditor"
        @remove="activeEditor.type === 'section' && removeSection(activeEditor.id)"
      />
    </div>

    <LoginModal v-if="loginOpen" @authenticate="authenticateEditor" @close="loginOpen = false" />

    <div v-if="chatVisible" class="whatsapp-chat fixed bottom-24 right-5 z-[70] w-[min(350px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-700 shadow-2xl">
      <div class="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-white text-emerald-600">
          <svg viewBox="0 0 32 32" class="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M16.04 3C8.88 3 3.05 8.82 3.05 15.98c0 2.29.6 4.52 1.74 6.49L3 29l6.7-1.75a12.93 12.93 0 0 0 6.34 1.62h.01C23.2 28.87 29 23.05 29 15.9 29 8.75 23.19 3 16.04 3Zm0 23.7a10.7 10.7 0 0 1-5.45-1.5l-.39-.23-3.98 1.04 1.06-3.88-.25-.4a10.7 10.7 0 1 1 9.01 4.97Zm5.88-8.02c-.32-.16-1.88-.93-2.17-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.87-1.77-2.19-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.55.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.56 1.13 3.06 1.29 3.27.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.76.24 1.45.2 2 .12.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.37.18-1.5-.08-.14-.29-.22-.61-.38Z"/></svg>
        </span>
        <span><strong class="block text-sm">MFD Solutions</strong><small class="text-white/75">Online — typically replies instantly</small></span>
        <button class="ml-auto text-white/80 hover:text-white" type="button" aria-label="Close WhatsApp message" @click="closeChat">×</button>
      </div>
      <div class="space-y-3 bg-slate-50 p-4 text-sm leading-6">
        <p class="rounded-xl rounded-bl-none bg-white p-3 shadow-sm">{{ site.brand.chatGreeting }}</p>
        <p class="rounded-xl rounded-bl-none bg-white p-3 shadow-sm">{{ site.brand.chatPrompt }}</p>
      </div>
      <a class="block bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-center text-sm font-bold text-white" :href="site.brand.whatsappUrl" target="_blank" rel="noreferrer">Start Chat on WhatsApp <span aria-hidden="true">↗</span></a>
    </div>
    <button class="whatsapp-button fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full text-white shadow-lg" type="button" :aria-expanded="chatVisible" aria-label="Open WhatsApp chat" @click="toggleChat">
      <span class="whatsapp-tooltip">Chat with us</span>
      <span class="whatsapp-notification" aria-hidden="true"></span>
      <svg viewBox="0 0 32 32" class="h-8 w-8" fill="currentColor" aria-hidden="true"><path d="M16.04 3C8.88 3 3.05 8.82 3.05 15.98c0 2.29.6 4.52 1.74 6.49L3 29l6.7-1.75a12.93 12.93 0 0 0 6.34 1.62h.01C23.2 28.87 29 23.05 29 15.9 29 8.75 23.19 3 16.04 3Zm0 23.7a10.7 10.7 0 0 1-5.45-1.5l-.39-.23-3.98 1.04 1.06-3.88-.25-.4a10.7 10.7 0 1 1 9.01 4.97Zm5.88-8.02c-.32-.16-1.88-.93-2.17-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.87-1.77-2.19-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.55.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.56 1.13 3.06 1.29 3.27.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.76.24 1.45.2 2 .12.61-.09 1.88-.77 2.15-1.51.26-.74.26-1.37.18-1.5-.08-.14-.29-.22-.61-.38Z"/></svg>
    </button>
    <button v-if="backToTopVisible" class="back-to-top fixed bottom-24 right-6 z-[60]" type="button" aria-label="Back to top" @click="goToTop">↑</button>
  </div>
</template>
