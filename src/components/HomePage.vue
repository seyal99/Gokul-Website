<script setup>
import DotArrow from "./ui/DotArrow.vue"
import portfolio from '../data/portfolio.json'
import cv from '../assets/docs/CV.pdf'
import DotText from './ui/DotText.vue'
import ExperienceColumn from './ui/ExperienceColumn.vue'
import { work, education } from '../data/experience'
import HandwrittenNote from './ui/HandwrittenNote.vue'
import Doodle from './ui/Doodle.vue'
import LearningByDoing from './ui/LearningByDoing.vue'
import BlogSketch from './ui/BlogSketch.vue'
import BlogCategories from './ui/BlogCategories.vue'
import AboutLink from './ui/AboutLink.vue'
import aboutLinks from '../data/about-links.json'
import ReachingHands from './ui/ReachingHands.vue'

const destinations = new Map(aboutLinks.map(link => [link.text, link.href]))
const linkedPhrases = new RegExp(`\\b(?:${aboutLinks.map(link => link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length).join('|')})\\b`, 'g')
const aboutParagraphs = portfolio.about.map(text => {
  const parts = []
  let cursor = 0
  for (const match of text.matchAll(linkedPhrases)) {
    if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index) })
    parts.push({ text: match[0], href: destinations.get(match[0]) })
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) })
  return { text, parts }
})
</script>

<template>
  <ReachingHands />

  <section id="about" class="about-section" aria-labelledby="about-title">
    <div class="about-heading">
      <h1 id="about-title"><DotText text="about me" /></h1>
      <div class="handwritten-greeting" aria-hidden="true"><span>Hello!</span><svg viewBox="0 0 100 50" fill="none"><path d="M88 5C93 35 47 40 10 29M20 23l-12 5 8 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></div>
    </div>
    <div class="about-copy">
      <div v-for="paragraph in aboutParagraphs" :key="paragraph.text" class="about-paragraph" :class="{ 'about-paragraph--arm': paragraph.text.includes('SO-101') }">
        <p><template v-for="(part, index) in paragraph.parts" :key="index"><AboutLink v-if="part.href" :label="part.text" :href="part.href" /><template v-else>{{ part.text }}</template></template></p>
        <Doodle v-if="paragraph.text.includes('SO-101')" kind="arm" class="about-arm" />
      </div>
    </div>
    <div class="resume-line"><a class="text-link handwritten-action" :href="cv" target="_blank" rel="noreferrer"><Doodle kind="notebook" /><span>my CV (PDF)</span><DotArrow /></a></div>
  </section>

  <blockquote class="section-quote" :cite="portfolio.aboutQuote.source">
    <p>“{{ portfolio.aboutQuote.text }}”</p>
  </blockquote>

  <section id="experience" class="experience-section" aria-labelledby="experience-title">
    <h2 id="experience-title">experience</h2>
    <div class="experience-columns"><ExperienceColumn heading="work" sketch="briefcase" :items="work" /><ExperienceColumn heading="education" sketch="graduation" :items="education" /></div>
  </section>

  <section id="papers" class="papers-section" aria-labelledby="papers-title">
    <div class="section-title papers-heading"><h2 id="papers-title">papers</h2><div class="sketch-note"><Doodle kind="papers" class="papers-heading-sketch" /><HandwrittenNote>ideas on paper</HandwrittenNote></div></div>
    <article class="paper-entry">
      <div class="paper-title">
        <h3>Perturbed State Space Feature Encoders for Optical Flow with Event Cameras</h3>
        <span class="paper-meta"><span>CVPRW</span><time class="paper-year" datetime="2025">2025</time></span>
      </div>
      <p class="paper-description">{{ portfolio.paperDescription }}</p>
      <div class="paper-links"><a href="https://arxiv.org/abs/2504.10669" target="_blank" rel="noreferrer">arXiv <DotArrow /></a><a href="https://github.com/seyal99/ETH-Semester-Thesis" target="_blank" rel="noreferrer">report <DotArrow /></a><a href="https://dsec.ifi.uzh.ch/uzh/dsec-flow-optical-flow-benchmark/" target="_blank" rel="noreferrer">benchmark <DotArrow /></a></div>
    </article>
  </section>

  <section id="projects" class="work-section" aria-labelledby="work-title">
    <div class="section-title"><h2 id="work-title">projects</h2><LearningByDoing /></div>
    <div class="project-collections"><a href="/projects/" class="collection-link"><p>A collection of my research, projects, and smaller experiments.</p> <DotArrow /></a></div>
  </section>

  <section id="blogs" class="blog-section" aria-labelledby="home-blogs-title">
    <div class="section-title"><h2 id="home-blogs-title">blogs</h2><BlogSketch /></div>
    <BlogCategories />
  </section>

</template>
