<script setup>
import categories from '../../data/blog-categories.json'
import DotArrow from './DotArrow.vue'
</script>

<template>
  <ul class="blog-categories">
    <li v-for="category in categories" :key="category.slug">
      <a class="blog-category-link" :href="`/blogs/${category.slug}/`">
        <h3>{{ category.title }}</h3>
        <p>{{ category.description }}</p>
        <DotArrow />
      </a>
    </li>
  </ul>
</template>
