<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  sections: { type: Array, required: true },
  brand: { type: Object, required: true },
  editMode: { type: Boolean, default: false },
})
const emit = defineEmits(['edit-brand'])
const menuOpen = ref(false)
const activeHash = ref('#home')
const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'More Details', href: '#more-details' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Work', href: '#portfolio' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]
let sectionObserver
let scrollHandler

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => {
  const sections = document.querySelectorAll('main section[id]')
  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeHash.value = `#${entry.target.id}`
      }
    }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 })
    sections.forEach((section) => sectionObserver.observe(section))
  }
  scrollHandler = () => {
    document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 40)
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
  scrollHandler()
})

onUnmounted(() => {
  sectionObserver?.disconnect()
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <header class="site-header sticky top-0 z-50 w-full">
    <nav class="nav mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8" aria-label="Main navigation">
      <div class="flex shrink-0 items-center gap-2">
        <a class="logo flex items-center gap-3" href="#home" @click="closeMenu">
          <span class="logo-icon">MFD</span>
          <span class="logo-text leading-tight">
            <strong class="block text-sm font-bold tracking-wide">{{ brand.brand }}</strong>
            <span class="text-[10px] uppercase tracking-[0.15em]">{{ brand.tagline }}</span>
          </span>
        </a>
        <button
          v-if="editMode"
          class="edit-icon-button"
          type="button"
          aria-label="Edit website branding"
          title="Edit website branding"
          @click="emit('edit-brand')"
        >✎</button>
      </div>

      <button
        class="menu-toggle grid h-10 w-10 place-items-center rounded-xl text-xl"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? '✕' : '☰' }}
      </button>

      <div
        class="nav-links absolute left-0 right-0 top-full max-h-[calc(100vh-5rem)] overflow-y-auto px-6 py-3 lg:static lg:flex lg:max-h-none lg:items-center lg:gap-4 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
        :class="menuOpen ? 'flex flex-col items-stretch' : 'hidden lg:flex'"
      >
        <a
          v-for="link in navigation"
          v-show="sections.some((section) => `#${section.id}` === link.href)"
          :key="link.href"
          :class="['nav-link whitespace-nowrap text-sm font-medium transition', { active: activeHash === link.href }]"
          :href="link.href"
          @click="closeMenu"
        >{{ link.label }}</a>
        <a class="nav-cta rounded-xl px-5 py-3 text-center text-sm font-semibold text-white shadow-glow transition" href="#contact" @click="closeMenu">
          {{ brand.ctaLabel }} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </nav>
  </header>
</template>
