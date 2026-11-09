<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import SectionTools from './SectionTools.vue'

const props = defineProps({
  section: { type: Object, required: true },
  editMode: { type: Boolean, default: false },
  first: { type: Boolean, default: false },
  last: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'remove', 'move-up', 'move-down', 'add-item', 'remove-item'])

const activeSlide = ref(0)
const activeFaq = ref(0)
const email = ref('')
const newsletterStatus = ref('')
const activeSlideData = computed(() => {
  const slides = props.section.slides ?? []
  return slides.length ? slides[activeSlide.value % slides.length] : null
})
let carouselTimer

function moveSlide(step) {
  const count = props.section.slides?.length ?? 0
  if (count) {
    activeSlide.value = (activeSlide.value + step + count) % count
    startCarousel()
  }
}

function selectSlide(index) {
  activeSlide.value = index
  startCarousel()
}

function stopCarousel() {
  window.clearInterval(carouselTimer)
}

function startCarousel() {
  stopCarousel()
  if (props.section.type === 'hero' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    carouselTimer = window.setInterval(() => moveSlide(1), 6500)
  }
}

function removeItem(key, index) {
  emit('remove-item', { sectionId: props.section.id, key, index })
}

function editItem() {
  emit('edit')
}

function submitNewsletter() {
  if (!email.value.trim()) return
  newsletterStatus.value = 'Thanks for subscribing! Check your inbox for updates.'
  email.value = ''
}

function submitContact(event) {
  const formData = new FormData(event.currentTarget)
  const name = String(formData.get('name') ?? '')
  const emailAddress = String(formData.get('email') ?? '')
  const subject = String(formData.get('subject') ?? '').trim() || 'Project enquiry'
  const message = String(formData.get('message') ?? '')
  const encodedSubject = encodeURIComponent(`${subject} from ${name}`)
  const encodedBody = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${emailAddress}`)
  window.location.href = `mailto:${props.section.recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`
}

onMounted(() => {
  startCarousel()
})
onUnmounted(stopCarousel)
watch(() => props.section.slides?.length, (count) => {
  if (count) activeSlide.value %= count
  else activeSlide.value = 0
  startCarousel()
})
</script>

<template>
  <footer v-if="section.type === 'footer'" class="site-footer relative border-t border-white/10 bg-[#080d18] px-5 pb-8 pt-14 sm:px-8">
    <SectionTools
      v-if="editMode"
      :first="first"
      :last="last"
      :has-list="true"
      @edit="emit('edit')"
      @remove="emit('remove')"
      @move-up="emit('move-up')"
      @move-down="emit('move-down')"
      @add-item="emit('add-item')"
    />
    <div class="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr]">
      <div>
        <a class="flex items-center gap-3" href="#home">
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-violet text-sm font-black text-white">MFD</span>
          <span><strong class="block text-white">{{ section.brand }}</strong><small class="uppercase tracking-[0.16em] text-slate-500">{{ section.tagline }}</small></span>
        </a>
        <p class="mt-5 max-w-sm text-sm leading-7 text-slate-400">{{ section.description }}</p>
        <p class="mt-5 text-xs text-slate-500">{{ section.copyrightLocation }}</p>
      </div>
      <div>
        <h2 class="text-sm font-bold uppercase tracking-widest text-white">Quick Links</h2>
        <ul class="mt-4 space-y-3">
          <li v-for="(item, index) in section.items" :key="item.id || index" class="flex items-center justify-between gap-2">
            <a class="text-sm text-slate-400 transition hover:text-white" :href="item.href">{{ item.label }}</a>
            <span v-if="editMode" class="inline-flex gap-1">
              <button class="edit-icon-button" type="button" :aria-label="`Edit ${item.label}`" @click="editItem">✎</button>
              <button class="edit-icon-button text-rose-300" type="button" :aria-label="`Delete ${item.label}`" @click="removeItem('items', index)">×</button>
            </span>
          </li>
        </ul>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 class="text-sm font-bold uppercase tracking-widest text-white">Get In Touch</h2>
        <div v-for="(contact, index) in section.contacts" :key="contact.id || index" class="mt-3 flex items-center gap-2">
          <a class="min-w-0 flex-1 truncate text-sm text-slate-400 transition hover:text-blue-300" :href="contact.href">{{ contact.icon }} {{ contact.value }}</a>
          <span v-if="editMode" class="flex gap-1">
            <button class="edit-icon-button" type="button" aria-label="Edit footer contact" @click="editItem">✎</button>
            <button class="edit-icon-button text-rose-300" type="button" aria-label="Delete footer contact" @click="removeItem('contacts', index)">×</button>
          </span>
        </div>
        <p class="mt-4 text-sm text-slate-500">{{ section.copyrightLocation }}</p>
      </div>
    </div>
    <div class="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-slate-500">
      © {{ new Date().getFullYear() }} {{ section.brand }} — {{ section.tagline }}. All rights reserved.
    </div>
  </footer>

  <div v-else-if="section.type === 'marquee'" class="relative overflow-hidden border-y border-white/10 bg-[#0e1728] py-5">
    <SectionTools
      v-if="editMode"
      :first="first"
      :last="last"
      :has-list="true"
      @edit="emit('edit')"
      @remove="emit('remove')"
      @move-up="emit('move-up')"
      @move-down="emit('move-down')"
      @add-item="emit('add-item')"
    />
    <div class="flex flex-wrap justify-center gap-x-8 gap-y-4 px-5">
      <span v-for="(item, index) in section.items" :key="item.id || index" class="group flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        <span class="text-lg">{{ item.icon }}</span>{{ item.label }}
        <span v-if="editMode" class="flex gap-1">
          <button class="edit-icon-button" type="button" :aria-label="`Edit ${item.label}`" @click="editItem">✎</button>
          <button class="edit-icon-button text-rose-300" type="button" :aria-label="`Delete ${item.label}`" @click="removeItem('items', index)">×</button>
        </span>
      </span>
    </div>
  </div>

  <section v-else :id="section.id" class="site-section scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28" :class="{ 'bg-[#0e1728]': ['services', 'details', 'tech', 'portfolio', 'locations', 'newsletter', 'faq'].includes(section.type), 'hero-section': section.type === 'hero' }">
    <SectionTools
      v-if="editMode"
      :first="first"
      :last="last"
      :has-list="section.items || section.slides ? true : false"
      @edit="emit('edit')"
      @remove="emit('remove')"
      @move-up="emit('move-up')"
      @move-down="emit('move-down')"
      @add-item="emit('add-item')"
    />

    <div v-if="section.type === 'hero'" class="hero-carousel relative isolate overflow-hidden border-b border-white/10"
      @mouseenter="stopCarousel"
      @mouseleave="startCarousel"
      @focusin="stopCarousel"
      @focusout="startCarousel"
    >
      <div v-if="activeSlideData" class="hero-backdrop" :style="{ backgroundImage: `url('${activeSlideData.image}')` }"></div>
      <div v-if="activeSlideData" class="hero-overlay"></div>
      <div v-if="activeSlideData" class="hero-grid absolute inset-0 opacity-40"></div>
      <Transition name="hero-scene" mode="out-in">
        <div v-if="activeSlideData" :key="activeSlideData.id || activeSlide" class="hero-scene" :class="[`theme-${activeSlideData.theme || 'blue'}`, `variant-${activeSlideData.variant || 'left'}`]">
          <div class="hero-layout mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div class="hero-copy max-w-3xl">
            <p class="hero-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]">
              <span class="h-2 w-2 rounded-full bg-mint"></span>{{ activeSlideData.badge }}
            </p>
            <h1 class="hero-title mt-6 max-w-3xl text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl">
              <template v-if="activeSlideData.accent && activeSlideData.title.includes(activeSlideData.accent)">
                {{ activeSlideData.title.split(activeSlideData.accent)[0] }}<span class="text-gradient">{{ activeSlideData.accent }}</span>{{ activeSlideData.title.split(activeSlideData.accent).slice(1).join(activeSlideData.accent) }}
              </template>
              <template v-else>{{ activeSlideData.title }}</template>
            </h1>
            <p class="hero-description mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{{ activeSlideData.description }}</p>
            <div class="mt-9 flex flex-wrap gap-3">
              <a class="rounded-xl bg-gradient-to-r from-brand to-violet px-6 py-3.5 font-semibold text-white shadow-glow transition hover:-translate-y-0.5" :href="activeSlideData.primaryHref">{{ activeSlideData.primaryLabel }} <span aria-hidden="true">→</span></a>
              <a class="rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3.5 font-semibold text-white transition hover:bg-white/10" :href="activeSlideData.secondaryHref">{{ activeSlideData.secondaryLabel }}</a>
            </div>
            <p class="mt-8 text-sm text-slate-400">{{ section.eyebrow }}</p>
          </div>
          <div class="hero-stats rounded-[1.6rem] border border-white/15 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div class="mb-6 flex items-center justify-between gap-4">
              <div><p class="text-xs uppercase tracking-[0.2em] text-mint">MFD Solutions</p><h2 class="mt-2 text-xl font-bold text-white">{{ activeSlideData.cardTitle }}</h2></div>
              <span class="grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-2xl text-blue-200">✦</span>
            </div>
            <div class="divide-y divide-white/10">
              <div v-for="(stat, index) in activeSlideData.stats" :key="stat.id || index" class="flex items-center justify-between gap-4 py-4">
                <span class="text-sm text-slate-400">{{ stat.label }}</span><strong class="text-sm text-white">{{ stat.value }}</strong>
                <span v-if="editMode" class="flex gap-1">
                  <button class="edit-icon-button" type="button" aria-label="Edit slide" @click="editItem">✎</button>
                  <button class="edit-icon-button text-rose-300" type="button" aria-label="Delete slide detail" @click="removeItem(`slides.${activeSlide}.stats`, index)">×</button>
                </span>
              </div>
            </div>
            <div class="mt-7 flex items-center justify-between">
              <button class="carousel-button" type="button" aria-label="Previous slide" @click="moveSlide(-1)">‹</button>
              <div class="flex items-center gap-2">
                <button v-for="(slide, index) in section.slides" :key="slide.id || index" class="hero-dot h-2 rounded-full transition-all" :class="{ active: activeSlide === index }" type="button" :aria-label="`Go to slide ${index + 1}`" @click="selectSlide(index)"></button>
              </div>
              <button class="carousel-button" type="button" aria-label="Next slide" @click="moveSlide(1)">›</button>
            </div>
          </div>
          </div>
        </div>
        <div v-else key="empty-hero" class="mx-auto max-w-7xl py-20 text-center text-slate-300">Add a slide in the section editor to display the hero.</div>
      </Transition>
    </div>

    <div v-else-if="section.type === 'about'" class="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
      <div class="relative mx-auto w-full max-w-md">
        <div class="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand/25 to-violet/20 blur-2xl"></div>
        <div class="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-navy p-3">
          <img class="h-[420px] w-full rounded-[1.3rem] object-cover" :src="section.image" :alt="section.name" loading="lazy" />
          <div class="absolute inset-x-3 bottom-3 rounded-b-[1.3rem] bg-gradient-to-t from-[#09111f] via-[#09111f]/90 to-transparent px-6 pb-6 pt-16">
            <p class="text-lg font-bold text-white">{{ section.name }}</p><p class="mt-1 text-sm text-slate-300">{{ section.role }}</p>
          </div>
          <div class="absolute left-6 top-6 rounded-xl border border-white/15 bg-ink/80 px-4 py-3 backdrop-blur">
            <p class="text-xl font-black text-white">{{ section.years }}</p><p class="text-[10px] uppercase tracking-wider text-slate-400">Years Exp.</p>
          </div>
        </div>
      </div>
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-mint">{{ section.eyebrow }}</p>
        <h2 class="section-title">{{ section.title }}</h2>
        <p class="mt-6 leading-7 text-slate-400">{{ section.description }}</p><p class="mt-4 leading-7 text-slate-400">{{ section.body }}</p>
        <div class="mt-7 grid gap-3 sm:grid-cols-2">
          <div v-for="(credential, index) in section.credentials" :key="credential.id || index" class="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
            <span>{{ credential.icon }}</span>{{ credential.label }}
            <span v-if="editMode" class="ml-auto flex gap-1"><button class="edit-icon-button" type="button" aria-label="Edit section" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete credential" @click="removeItem('credentials', index)">×</button></span>
          </div>
        </div>
        <ul class="mt-6 space-y-3">
          <li v-for="(highlight, index) in section.highlights" :key="highlight.id || index" class="flex items-start gap-3 text-sm leading-6 text-slate-300">
            <span class="text-mint">✓</span>{{ highlight.text }}
            <span v-if="editMode" class="ml-auto flex gap-1"><button class="edit-icon-button" type="button" aria-label="Edit section" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete highlight" @click="removeItem('highlights', index)">×</button></span>
          </li>
        </ul>
        <div class="mt-7 flex flex-wrap gap-2">
          <span v-for="(skill, index) in section.skills" :key="skill.id || index" class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
            {{ skill.label }}<button v-if="editMode" class="text-slate-500 hover:text-rose-300" type="button" :aria-label="`Delete ${skill.label}`" @click="removeItem('skills', index)">×</button>
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="['services', 'why', 'tech', 'process'].includes(section.type)" class="mx-auto max-w-7xl">
      <div class="section-heading">
        <p v-if="section.eyebrow" class="section-eyebrow">{{ section.eyebrow }}</p>
        <h2 class="section-title">{{ section.title }}</h2>
        <p v-if="section.description" class="section-description">{{ section.description }}</p>
      </div>
      <div class="mt-12 grid gap-4 sm:grid-cols-2" :class="section.type === 'services' ? 'lg:grid-cols-4' : section.type === 'tech' ? 'md:grid-cols-4 lg:grid-cols-6' : section.type === 'process' ? 'md:grid-cols-4' : 'lg:grid-cols-3'">
        <article v-for="(item, index) in section.items" :key="item.id || index" class="content-card group relative" :class="{ 'tech-card': section.type === 'tech', 'process-card': section.type === 'process' }">
          <div class="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand/20 to-violet/20 text-2xl text-blue-200">{{ item.icon }}</div>
          <p v-if="section.type === 'services' || section.type === 'process'" class="mt-5 text-xs font-semibold tracking-widest text-slate-500">0{{ index + 1 }}</p>
          <h3 class="mt-3 text-lg font-bold text-white">{{ item.title || item.label }}</h3>
          <p v-if="item.description" class="mt-3 text-sm leading-6 text-slate-400">{{ item.description }}</p>
          <div v-if="editMode" class="item-edit-controls">
            <button class="edit-icon-button" type="button" :aria-label="`Edit ${item.title || item.label}`" @click="editItem">✎</button>
            <button class="edit-icon-button text-rose-300" type="button" :aria-label="`Delete ${item.title || item.label}`" @click="removeItem('items', index)">×</button>
          </div>
        </article>
      </div>
    </div>

    <div v-else-if="section.type === 'details'" class="mx-auto max-w-7xl">
      <div class="section-heading">
        <p class="section-eyebrow">{{ section.eyebrow }}</p><h2 class="section-title">{{ section.title }}</h2><p class="section-description">{{ section.description }}</p>
      </div>
      <article v-for="(item, index) in section.items" :key="item.id || index" class="detail-block">
        <div class="relative min-h-64 overflow-hidden rounded-3xl border border-white/10 bg-[#111c31]">
          <img v-if="item.image" class="absolute inset-0 h-full w-full object-cover opacity-75" :src="item.image" :alt="item.category" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/30 to-transparent"></div>
          <span class="absolute bottom-5 left-5 rounded-full border border-white/20 bg-ink/60 px-3 py-1 text-xs text-white backdrop-blur">{{ item.category }}</span>
          <div v-if="editMode" class="item-edit-controls">
            <button class="edit-icon-button" type="button" aria-label="Edit service details" @click="editItem">✎</button>
            <button class="edit-icon-button text-rose-300" type="button" aria-label="Delete service details" @click="removeItem('items', index)">×</button>
          </div>
        </div>
        <div class="py-2">
          <h3 class="text-2xl font-bold text-white">{{ item.title }}</h3><p class="mt-4 leading-7 text-slate-400">{{ item.description }}</p><p class="mt-3 leading-7 text-slate-400">{{ item.body }}</p>
          <ul class="mt-5 space-y-2">
            <li v-for="(feature, featureIndex) in item.features" :key="featureIndex" class="flex gap-3 text-sm leading-6 text-slate-300"><span class="text-mint">✓</span>{{ feature }}</li>
          </ul>
        </div>
      </article>
    </div>

    <div v-else-if="section.type === 'stats'" class="mx-auto max-w-7xl">
      <h2 class="mb-10 text-center text-2xl font-bold text-white sm:text-3xl">{{ section.title }}</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="(item, index) in section.items" :key="item.id || index" class="rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center">
          <strong class="text-4xl font-black text-gradient">{{ item.value }}</strong><p class="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{{ item.label }}</p>
          <div v-if="editMode" class="mt-3 flex justify-center gap-1"><button class="edit-icon-button" type="button" aria-label="Edit statistic" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete statistic" @click="removeItem('items', index)">×</button></div>
        </article>
      </div>
    </div>

    <div v-else-if="section.type === 'portfolio' || section.type === 'locations' || section.type === 'testimonials'" class="mx-auto max-w-7xl">
      <div class="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p class="section-eyebrow">{{ section.eyebrow }}</p><h2 class="section-title">{{ section.title }}</h2><p class="section-description">{{ section.description }}</p></div>
        <a v-if="section.type === 'portfolio'" class="font-semibold text-blue-300 transition hover:text-white" :href="section.portfolioLink" target="_blank" rel="noreferrer">View full portfolio <span aria-hidden="true">↗</span></a>
      </div>
      <div v-if="section.type === 'portfolio'" class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="(item, index) in section.items" :key="item.id || index" class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111c31] transition hover:-translate-y-1 hover:border-white/20">
          <a class="block" :href="item.href" target="_blank" rel="noreferrer">
            <div class="relative h-56 overflow-hidden bg-navy"><img v-if="item.image" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" :src="item.image" :alt="item.title" loading="lazy" /><div class="absolute inset-0 bg-gradient-to-t from-[#0b1120]/80 to-transparent"></div><span class="absolute bottom-4 left-5 rounded-full border border-white/20 bg-ink/50 px-3 py-1 text-[10px] font-bold tracking-widest text-white">{{ item.category }}</span></div>
            <div class="p-5"><h3 class="text-lg font-bold text-white">{{ item.title }}</h3><p class="mt-2 text-sm leading-6 text-slate-400">{{ item.description }}</p></div>
          </a>
          <div v-if="editMode" class="item-edit-controls"><button class="edit-icon-button" type="button" aria-label="Edit project" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete project" @click="removeItem('items', index)">×</button></div>
        </article>
      </div>
      <div v-else-if="section.type === 'locations'" class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="(item, index) in section.items" :key="item.id || index" class="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition hover:-translate-y-1 hover:bg-white/[0.06]">
          <span class="text-4xl">{{ item.flag }}</span><h3 class="mt-4 font-bold text-white">{{ item.name }}</h3><p class="mt-2 text-sm text-slate-400">{{ item.details }}</p>
          <div v-if="editMode" class="item-edit-controls"><button class="edit-icon-button" type="button" aria-label="Edit location" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete location" @click="removeItem('items', index)">×</button></div>
        </article>
      </div>
      <div v-else class="mt-12 grid gap-5 lg:grid-cols-3">
        <figure v-for="(item, index) in section.items" :key="item.id || index" class="relative rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <div class="text-lg tracking-[0.2em] text-amber-300" aria-label="5 out of 5 stars">★★★★★</div><blockquote class="mt-5 min-h-28 leading-7 text-slate-300">“{{ item.quote }}”</blockquote>
          <figcaption class="mt-7 flex items-center gap-3 border-t border-white/10 pt-5"><span class="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand to-violet text-sm font-bold text-white">{{ item.initials }}</span><span><strong class="block text-sm text-white">{{ item.name }}</strong><span class="mt-1 block text-xs text-slate-500">{{ item.role }}</span></span></figcaption>
          <div v-if="editMode" class="item-edit-controls"><button class="edit-icon-button" type="button" aria-label="Edit testimonial" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete testimonial" @click="removeItem('items', index)">×</button></div>
        </figure>
      </div>
      <div v-if="section.type === 'portfolio'" class="mt-10 flex flex-wrap justify-center gap-3">
        <a class="rounded-xl bg-gradient-to-r from-brand to-violet px-6 py-3 font-semibold text-white" :href="section.portfolioLink" target="_blank" rel="noreferrer">View Full Portfolio on Behance →</a>
        <a class="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white" :href="section.figmaLink" target="_blank" rel="noreferrer">View Figma Designs →</a>
      </div>
    </div>

    <div v-else-if="section.type === 'guarantee'" class="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
      <div>
        <p class="section-eyebrow">{{ section.eyebrow }}</p><h2 class="section-title">{{ section.title }}</h2><p class="mt-5 max-w-2xl leading-7 text-slate-300">{{ section.description }}</p>
        <ul class="mt-7 space-y-4">
          <li v-for="(item, index) in section.items" :key="item.id || index" class="flex items-center gap-3 text-slate-200"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500/15">{{ item.icon }}</span>{{ item.text }}<button v-if="editMode" class="edit-icon-button ml-auto text-rose-300" type="button" aria-label="Delete guarantee item" @click="removeItem('items', index)">×</button></li>
        </ul>
      </div>
      <div class="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/15 via-violet/10 to-mint/10 p-8 text-center sm:p-12">
        <div class="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10 text-4xl">🛡</div><h3 class="mt-6 text-2xl font-bold text-white">{{ section.badgeTitle }}</h3><p class="mt-4 leading-7 text-slate-300">{{ section.badgeDescription }}</p>
      </div>
    </div>

    <div v-else-if="section.type === 'newsletter'" class="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-br from-brand/10 via-violet/10 to-mint/10 px-6 py-12 text-center sm:px-12">
      <p class="section-eyebrow">{{ section.eyebrow }}</p><h2 class="section-title">{{ section.title }}</h2><p class="section-description">{{ section.description }}</p>
      <form class="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row" @submit.prevent="submitNewsletter">
        <label class="sr-only" for="newsletter-email">Email address</label><input id="newsletter-email" v-model="email" required type="email" autocomplete="email" placeholder="Enter your email address" class="min-w-0 flex-1 rounded-xl border border-white/15 bg-ink/70 px-4 py-3 text-white outline-none focus:border-brand" />
        <button class="rounded-xl bg-gradient-to-r from-brand to-violet px-6 py-3 font-semibold text-white">{{ section.buttonLabel }} →</button>
      </form>
      <p v-if="newsletterStatus" class="mt-4 text-sm text-mint" role="status">{{ newsletterStatus }}</p>
    </div>

    <div v-else-if="section.type === 'pricing'" class="mx-auto max-w-7xl">
      <div class="section-heading"><p class="section-eyebrow">{{ section.eyebrow }}</p><h2 class="section-title">{{ section.title }}</h2><p class="section-description">{{ section.description }}</p></div>
      <div class="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
        <article v-for="(item, index) in section.items" :key="item.id || index" class="relative rounded-2xl border p-7 transition hover:-translate-y-1" :class="item.featured ? 'border-brand bg-gradient-to-b from-brand/15 to-[#111c31] shadow-glow' : 'border-white/10 bg-[#111c31]'">
          <span v-if="item.featured" class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-violet px-4 py-1 text-xs font-bold text-white">Most Popular</span>
          <div v-if="editMode" class="item-edit-controls"><button class="edit-icon-button" type="button" aria-label="Edit pricing plan" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete pricing plan" @click="removeItem('items', index)">×</button></div>
          <div class="text-3xl">{{ item.icon }}</div><h3 class="mt-4 text-xl font-bold text-white">{{ item.name }}</h3><p class="mt-1 text-sm text-slate-400">{{ item.subtitle }}</p>
          <p class="mt-6 text-4xl font-black text-white">{{ item.price }} <span class="text-sm font-normal text-slate-400">{{ item.period }}</span></p>
          <ul class="mt-7 space-y-3">
            <li v-for="(feature, featureIndex) in item.features" :key="featureIndex" class="flex gap-2 text-sm text-slate-300"><span class="text-mint">✓</span>{{ feature }}</li>
          </ul>
          <a class="mt-8 block rounded-xl px-5 py-3 text-center text-sm font-bold transition" :class="item.featured ? 'bg-gradient-to-r from-brand to-violet text-white' : 'border border-white/15 text-white hover:bg-white/5'" href="#contact">Get Started <span aria-hidden="true">→</span></a>
        </article>
      </div>
      <div class="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-amber-300/20 bg-gradient-to-r from-amber-500/10 via-violet/10 to-brand/10 p-7 sm:flex-row sm:items-center sm:p-10">
        <div><p class="text-sm font-bold text-amber-200">{{ section.offerEyebrow }}</p><h3 class="mt-3 text-2xl font-black text-white sm:text-3xl">{{ section.offerTitle }}</h3><p class="mt-3 max-w-2xl leading-7 text-slate-300">{{ section.offerDescription }}</p></div>
        <a class="shrink-0 rounded-xl bg-gradient-to-r from-brand to-violet px-6 py-3 font-semibold text-white" :href="section.offerHref" target="_blank" rel="noreferrer">{{ section.offerLabel }} →</a>
      </div>
    </div>

    <div v-else-if="section.type === 'faq'" class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
      <div><p class="section-eyebrow">{{ section.eyebrow }}</p><h2 class="section-title">{{ section.title }}</h2><p class="section-description">{{ section.description }}</p></div>
      <div class="divide-y divide-white/10">
        <article v-for="(item, index) in section.items" :key="item.id || index" class="relative py-5">
          <button class="flex w-full items-center justify-between gap-6 text-left font-semibold text-white" type="button" :aria-expanded="activeFaq === index" @click="activeFaq = activeFaq === index ? -1 : index">
            {{ item.question }}<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-lg text-mint">{{ activeFaq === index ? '−' : '+' }}</span>
          </button>
          <p v-if="activeFaq === index" class="max-w-2xl pt-4 text-sm leading-7 text-slate-400">{{ item.answer }}</p>
          <div v-if="editMode" class="absolute right-12 top-5 flex gap-1"><button class="edit-icon-button" type="button" aria-label="Edit question" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete question" @click="removeItem('items', index)">×</button></div>
        </article>
      </div>
    </div>

    <div v-else-if="section.type === 'contact'" class="mx-auto grid max-w-7xl gap-12 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#14213a] to-[#10172a] p-6 sm:p-10 lg:grid-cols-[.85fr_1.15fr] lg:p-14">
      <div>
        <p class="section-eyebrow">{{ section.eyebrow }}</p><h2 class="section-title">{{ section.title }}</h2><p class="section-description">{{ section.description }}</p>
        <div class="mt-8 space-y-3">
          <div v-for="(item, index) in section.items" :key="item.id || index" class="flex items-center gap-3">
            <a class="flex min-w-0 flex-1 items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]" :href="item.href" target="_blank" rel="noreferrer">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-xl">{{ item.icon }}</span><span class="min-w-0"><strong class="block text-sm text-white">{{ item.label }}</strong><span class="block truncate text-sm text-slate-400">{{ item.value }}</span></span><span class="ml-auto text-slate-400">↗</span>
            </a>
            <span v-if="editMode" class="flex gap-1"><button class="edit-icon-button" type="button" aria-label="Edit contact link" @click="editItem">✎</button><button class="edit-icon-button text-rose-300" type="button" aria-label="Delete contact link" @click="removeItem('items', index)">×</button></span>
          </div>
        </div>
      </div>
      <form class="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8" @submit.prevent="submitContact">
        <h3 class="mb-6 text-xl font-bold text-white">{{ section.formTitle }}</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="editor-field"><span>Your name</span><input name="name" required autocomplete="name" placeholder="Jane Smith" /></label>
          <label class="editor-field"><span>Email address</span><input name="email" required type="email" autocomplete="email" placeholder="jane@company.com" /></label>
        </div>
        <label class="editor-field mt-4"><span>Subject</span><input name="subject" placeholder="What would you like to build?" /></label>
        <label class="editor-field mt-4"><span>Message</span><textarea name="message" rows="5" required placeholder="Tell me about your project..."></textarea></label>
        <button class="editor-save-button mt-5 w-full sm:w-auto" type="submit">Send Message <span aria-hidden="true">→</span></button>
        <p class="mt-4 text-xs leading-5 text-slate-500">This form opens your email app with your message addressed to {{ section.recipientEmail }}.</p>
      </form>
    </div>
  </section>
</template>
