<script setup>
import posts from 'virtual:blogs'
import categories from '../data/blog-categories.json'
import DotText from './ui/DotText.vue'
import DotArrow from './ui/DotArrow.vue'
import BlogSketch from './ui/BlogSketch.vue'
import BlogCategories from './ui/BlogCategories.vue'
import HandwrittenNote from './ui/HandwrittenNote.vue'

const parts = window.location.pathname.replace(/\/index\.html$/, '/').split('/').filter(Boolean).slice(1)
const isOverview = parts.length === 0
const category = categories.find(entry => entry.slug === parts[0])
const isCategory = Boolean(category) && parts.length === 1
const post = category && parts.length === 2 ? posts.find(entry => entry.category === category.slug && entry.slug === parts[1]) : null
const entries = category ? posts.filter(entry => entry.category === category.slug) : []
const formatDate = date => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
const title = post?.title || (isCategory ? category.title : isOverview ? 'Blogs' : 'Post not found')
const backHref = post ? `/blogs/${category.slug}/` : isCategory || isOverview ? '/#blogs' : '/blogs/'
const backLabel = post ? `back to ${category.title.toLowerCase()}` : isCategory || isOverview ? 'back to home' : 'back to blogs'
document.title = `${title} — Gokul Raju`
const description = document.querySelector('meta[name="description"]')
if (description && (post || isCategory)) description.content = post?.description || category.description
</script>

<template>
  <section class="blog-page" :aria-labelledby="isOverview || isCategory ? 'blogs-title' : 'post-title'">
    <a class="back-link" :href="backHref">{{ backLabel }} <DotArrow direction="left" /></a>

    <template v-if="isOverview || isCategory">
      <header class="blog-header">
        <div class="section-title blog-heading">
          <h1 id="blogs-title"><DotText :text="isCategory ? category.title : 'blogs'" /></h1>
          <BlogSketch v-if="isOverview" />
        </div>
        <p v-if="isCategory && entries.length">{{ category.description }}</p>
        <p v-else-if="isCategory" class="blog-progress"><HandwrittenNote>working on it</HandwrittenNote><span class="sr-only">working on it</span></p>
      </header>
      <BlogCategories v-if="isOverview" />
      <ol v-else-if="entries.length" class="blog-list">
        <li v-for="entry in entries" :key="entry.slug">
          <a class="blog-entry" :href="`/blogs/${category.slug}/${entry.slug}/`">
            <time :datetime="entry.date">{{ formatDate(entry.date) }}</time>
            <div class="blog-entry-copy">
              <h2>{{ entry.title }} <DotArrow /></h2>
              <p>{{ entry.description }}</p>
              <span v-if="entry.draft" class="blog-draft">Draft preview</span>
            </div>
          </a>
        </li>
      </ol>
    </template>

    <article v-else-if="post" class="blog-post">
      <header class="post-header">
        <h1 id="post-title">{{ post.title }}</h1>
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span v-if="post.draft" class="blog-draft">Draft preview</span>
      </header>
      <div class="post-body" v-html="post.html" />
    </article>

    <div v-else class="blog-empty">
      <h1 id="post-title">That post isn't here.</h1>
      <p>It may have moved or hasn't been published yet.</p>
      <a href="/blogs/">See all blogs <DotArrow /></a>
    </div>
    <div v-if="isOverview || post || isCategory && entries.length" class="archive-end"><a href="#top">back to top <DotArrow direction="up" /></a></div>
  </section>
</template>
