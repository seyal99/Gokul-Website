<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import Spline from "./components/ui/Spline.vue";
import LiquidGlass from "./components/ui/LiquidGlass.vue";
import Timeline from "./components/ui/Timeline.vue";
import InteractiveHoverButton from "./components/ui/InteractiveHoverButton.vue";
import VanishInput from "./components/ui/VanishInput.vue";
import TextGenerateEffect from "./components/ui/TextGenerateEffect.vue";
import Dock from "./components/ui/Dock.vue";
import DockIcon from "./components/ui/DockIcon.vue";
import DockSeparator from "./components/ui/DockSeparator.vue";
import aboutMePhoto from "./assets/images/aboutme.png";
import project1Gif from "./assets/images/ssmdrone.gif";
import project2Gif from "./assets/images/eventflow.gif";
import project3Gif from "./assets/images/spaceship.gif";
import project4Gif from "./assets/images/soccer3d.gif";
import miniRagImage from "./assets/images/rag.png";
import miniTrtImage from "./assets/images/trt.png";
import miniPeftImage from "./assets/images/peft.png";
import miniComingSoonImage from "./assets/images/comingsoon.png";
import cvPdf from "./assets/docs/CV.pdf";

const projectTimelineItems = [
  { id: "proj1", label: "2024" },
  { id: "proj2", label: "2025" },
  { id: "proj3", label: "2026" },
  { id: "proj4", label: "2027" }
];

const miniProjects = [
  {
    id: "rag",
    title: "RAG Chat",
    description: "Chunking, vector retrieval, and answer synthesis experiments for document-grounded QA.",
    buttonText: "Code",
    href: "https://github.com/BjfpgZOC/RAG-Playground",
    image: miniRagImage,
    featured: true
  },
  {
    id: "trt",
    title: "TensorRT Playground",
    description: "Inference optimization and benchmarking across model variants.",
    buttonText: "Code",
    href: "https://github.com/BjfpgZOC/TensorRT-Playground",
    image: miniTrtImage,
    featured: false
  },
  {
    id: "peft",
    title: "PEFT Workflow",
    description: "LoRA/QLoRA fine-tuning workflows for lightweight adaptation and evaluation.",
    buttonText: "Code",
    href: "https://github.com/BjfpgZOC/PEFT-Playground",
    image: miniPeftImage,
    featured: false
  },
  {
    id: "none",
    title: "Coming Soon",
    description: "",
    buttonText: "",
    href: "",
    image: miniComingSoonImage,
    featured: true
  }
];

const sectionOffset = 96;
const navAnimated = ref(false);
const quoteVisible = ref(false);
const chatIconVisible = ref(false);
const quoteQueued = ref(false);
const chatOpen = ref(false);
const chatInput = ref("");
const resumeMode = ref(false);
const chatBodyRef = ref(null);
const chatMessages = ref([]);

function handleSplineLoad() {
  // Nav timing is controlled from page start (onMounted).
}

onMounted(() => {
  // Always start at the top on reload.
  window.scrollTo({ top: 0, behavior: "auto" });

  // Single delay from page start.
  window.setTimeout(() => {
    navAnimated.value = true;
  }, 3500);
});

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY - sectionOffset;
  window.scrollTo({ top, behavior: "smooth" });
}

function getSplineCanvas() {
  return document.querySelector(".spline-canvas");
}

function forwardPointerToSpline(event) {
  const canvas = getSplineCanvas();
  if (!canvas) return;

  canvas.dispatchEvent(
    new PointerEvent("pointermove", {
      clientX: event.clientX,
      clientY: event.clientY,
      bubbles: true
    })
  );

  canvas.dispatchEvent(
    new MouseEvent("mousemove", {
      clientX: event.clientX,
      clientY: event.clientY,
      bubbles: true
    })
  );
}

function clearSplinePointer(event) {
  const canvas = getSplineCanvas();
  if (!canvas) return;

  canvas.dispatchEvent(
    new PointerEvent("pointerleave", {
      clientX: event.clientX,
      clientY: event.clientY,
      bubbles: true
    })
  );

  canvas.dispatchEvent(
    new MouseEvent("mouseleave", {
      clientX: event.clientX,
      clientY: event.clientY,
      bubbles: true
    })
  );
}

function toggleChat() {
  chatOpen.value = !chatOpen.value;
}

function getBotReply(input) {
  return "Work in Progress";
}

function sendChatMessage(rawValue) {
  const value = (rawValue ?? chatInput.value).trim();
  if (!value) return;
  chatMessages.value.push({ role: "user", text: value });
  chatInput.value = "";
  chatMessages.value.push({ role: "bot", text: getBotReply(value) });
}

function clearChat() {
  chatMessages.value = [];
  chatInput.value = "";
}

function openResumeViewer() {
  resumeMode.value = true;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function closeResumeViewer() {
  resumeMode.value = false;
}

function handleQuoteComplete() {
  chatIconVisible.value = true;
}

function scrollChatToBottom() {
  if (!chatBodyRef.value) return;
  chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
}

watch(
  () => chatMessages.value.length,
  async () => {
    await nextTick();
    scrollChatToBottom();
  }
);

watch(
  () => chatOpen.value,
  async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    scrollChatToBottom();
  }
);

watch(
  () => navAnimated.value,
  (isReady) => {
    if (!isReady || quoteQueued.value) return;
    quoteQueued.value = true;
    window.setTimeout(() => {
      quoteVisible.value = true;
    }, 1000);
  }
);
</script>

<template>
  <div
    class="app-root"
    @pointermove.capture="forwardPointerToSpline"
    @pointerleave.capture="clearSplinePointer"
  >
    <section v-show="resumeMode" class="resume-page">
      <div class="resume-topbar">
        <InteractiveHoverButton
          text="Back"
          arrow-direction="left"
          class="resume-back-btn"
          @click="closeResumeViewer"
        />
      </div>
      <iframe class="resume-frame" :src="cvPdf" title="Resume PDF viewer" />
    </section>

    <div v-show="!resumeMode" class="home-shell">
    <section class="hero-stage">
      <div class="background-layer">
        <Spline
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          class="spline-canvas"
          :render-on-demand="true"
          @load="handleSplineLoad"
        />
      </div>
      <div class="hero-quote-layer" aria-hidden="true">
        <div class="hero-quote-shell">
          <TextGenerateEffect
            class="hero-quote-text"
            :words="'What I cannot create, I do not understand.'"
            :start="quoteVisible"
            :step-ms="125"
            @complete="handleQuoteComplete"
          />
        </div>
      </div>
    </section>

    <header class="nav-wrap">
      <LiquidGlass
        :container-class="`nav-frame ${navAnimated ? 'nav-frame--enter' : ''}`"
        class="nav-shell"
        :radius="999"
        :frost="0.05"
        :alpha="0.18"
        :lightness="18"
        :blur="0"
        :displace="30"
      >
        <a href="#" class="brand">Gokul Raju</a>
        <div class="links">
          <a href="#about" @click.prevent="scrollToSection('about')">About Me</a>
          <a href="#projects" @click.prevent="scrollToSection('projects')">Projects</a>
          <a href="#contact" @click.prevent="scrollToSection('contact')">Contact</a>
          <a href="#resume" @click.prevent="openResumeViewer">Resume</a>
        </div>
      </LiquidGlass>
    </header>

    <section class="content-zone">
      <main class="page-content">
        <section id="about" class="content-section content-section-plain about-section">
          <div class="about-layout">
            <div class="about-photo-placeholder">
              <img :src="aboutMePhoto" alt="About me photo" class="about-photo" />
            </div>
            <div class="about-copy">
              <h2>About Me</h2>
              <p>
                My name is Gokul Raju and I recently graduated with a Master's degree in Robotics, Systems & Control from ETH Zurich. My research interests focus on Machine Learning, Computer Vision, Reinforcement Learning, Embodied AI and LLMs.
                <br>
                <br>
                Over the course of my Master's degree, I implemented learning algorithms for complex computer vision tasks in both pixel-based and event-based domains and for dynamic real-world tasks such as autonomous drone racing at the Robotics and Perception Group in University of Zurich under Prof. Davide Scaramuzza.
                <br>
                <br>
                Prior to my Masters, I completed my BEng (Hons) in Mechanical Engineering at Heriot-Watt University, Dubai;I was awarded the Watt Club Medal and The James Anderson Memorial Prize.
              </p>
            </div>
          </div>
        </section>

        <section id="projects" class="content-section content-section-plain projects-section">
          <h2 class="projects-heading">Projects</h2>
          <Timeline :items="projectTimelineItems">
            <template #proj1>
              <article class="project-item">
                <img :src="project1Gif" alt="State space models project gif" class="project-media" />
                <div class="project-copy">
                  <h4>State Space Models for Efficient Reinforcement Learning in Quadrotors</h4>
                  <p>
                    Proposed the first SSM-based RL framework for Autonomous Drone Racing for both state and vision based domains.
                    Developed a novel PPO JAX RL framework for Flightmare Simulator, resulting in SOTA performance - 10% faster
                    lap times and 50% faster inference times compared to existing policies
                  </p>
                  <div class="project-actions">
                    <InteractiveHoverButton text="Report" href="https://github.com/BjfpgZOC/ETH-Master-Thesis" />
                  </div>
                </div>
              </article>
            </template>

            <template #proj2>
              <article class="project-item">
                <img :src="project2Gif" alt="Optical flow with event cameras project gif" class="project-media" />
                <div class="project-copy">
                  <h4>Pushing the limits of Optical Flow Estimation in Event Cameras</h4>
                  <p>
                    Pioneered the first multi-event optical flow framework for neuromorphic vision, achieving a 8% reduction in EPE.
                    Accelerated inference times by 30% when compared to existing baselines on DSEC and MVSEC benchmarks by
                    optimizing the model architecture with a SSM-based encoder
                    <br>
                    <br>
                    An extension of this work was published as a Workshop
                    Paper.
                    <br>
                    <strong>Perturbed State Space Feature Encoders for Optical Flow with Event Cameras</strong>
                    <br>
                    <i>Gokul Raju Govinda Raju, Nikola Zubic, Marco Cannici, Davide Scaramuzza
                    IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops (CVPRW), Nashville, 2025</i>
                  </p>
                  <div class="project-actions">
                    <InteractiveHoverButton text="Report" href="https://github.com/BjfpgZOC/ETH-Semester-Thesis" />
                    <InteractiveHoverButton text="arXiv" href="https://arxiv.org/abs/2504.10669" />
                    <InteractiveHoverButton text="Benchmark" href="https://dsec.ifi.uzh.ch/uzh/dsec-flow-optical-flow-benchmark/" />
                  </div>
                </div>
              </article>
            </template>

            <template #proj3>
              <article class="project-item">
                <img :src="project3Gif" alt="Spaceship obstacle avoidance project gif" class="project-media" />
                <div class="project-copy">
                  <h4>Spaceship Obstacle Avoidance and Trajectory Planning</h4>
                  <p>
                    Implemented a SCvx (Successive Convexification) planning and control algorithm for a 2-D spaceship to avoid static
                    obstacles (planets) & dynamic obstacles (satellites) and to dock with the docking station
                  </p>
                  <div class="project-actions">
                    <InteractiveHoverButton text="Code" href="https://github.com/BjfpgZOC/ETH-PDM4AR-Spaceship-Project" />
                  </div>
                </div>
              </article>
            </template>

            <template #proj4>
              <article class="project-item">
                <img :src="project4Gif" alt="Soccer ball detection and tracking project gif" class="project-media" />
                <div class="project-copy">
                  <h4>Robust Soccer Ball Detection and Tracking (FIFA)</h4>
                  <p>
                    Created an end-to-end pipeline to detect & track soccer balls in both sharp and blurred broadcast frames.
                    Integrated a fine-tuned YOLOv8n model with a state-of-the-art approach, Motion-from-Blur (MfB) to handle high-speed
                    blurry motion, resulting in a 8% improvement in soccer ball detections.
                    Combined multi-view detections with camera pose information to triangulate the position of the soccer ball (95.78%
                    tracking accuracy at 0.75 IoU) and visualized the tracking results by generating 3D trajectories for coaching analytics.
                  </p>
                  <div class="project-actions">
                    <InteractiveHoverButton text="Report" href="https://github.com/BjfpgZOC/ETH-3DVision-Project" />
                  </div>
                </div>
              </article>
            </template>
          </Timeline>
        </section>

        <section id="mini-projects" class="content-section content-section-plain mini-projects-section">
          <h2 class="projects-heading mini-projects-heading">Mini Projects</h2>
          <div class="mini-grid">
            <article
              v-for="item in miniProjects"
              :key="item.id"
              class="mini-card"
            >
              <img :src="item.image" :alt="`${item.title} thumbnail`" class="mini-thumb" />
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div v-if="item.href" class="mini-actions">
                <InteractiveHoverButton :text="item.buttonText" :href="item.href" />
              </div>
            </article>
          </div>
        </section>

        <section class="content-section content-section-plain contact-section">
          <div id="contact" class="contact-dock-anchor">
            <Dock :magnification="72" :distance="140" direction="middle" orientation="horizontal" class="mb-2 mt-2">
              <DockIcon>
                <a class="dock-link dock-email" href="mailto:gokul10012000@gmail.com" aria-label="Email" title="Email">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" stroke-width="1.8" />
                    <path d="M4.2 7.2 12 13l7.8-5.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </a>
              </DockIcon>

              <DockSeparator />

              <DockIcon>
                <a
                  class="dock-link dock-github"
                  href="https://github.com/BjfpgZOC"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.8-.25.8-.57v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.72 1.26 3.38.97.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.95 10.95 0 0 1 5.73 0c2.2-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.08 0 4.42-2.7 5.4-5.27 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.68.81.57A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                  </svg>
                </a>
              </DockIcon>

              <DockIcon>
                <a
                  class="dock-link dock-linkedin"
                  href="https://www.linkedin.com/in/gokul-8011a/?skipRedirect=true"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.03-1.84-3.03-1.85 0-2.13 1.44-2.13 2.93v5.68H9.36V9h3.42v1.56h.05c.48-.9 1.64-1.84 3.37-1.84 3.61 0 4.27 2.38 4.27 5.48v6.25ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.56V9h3.56v11.45Z" />
                  </svg>
                </a>
              </DockIcon>

              <DockIcon>
                <a
                  class="dock-link dock-scholar"
                  href="https://scholar.google.com/citations?user=16313Y8AAAAJ&hl=en"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Google Scholar"
                  title="Google Scholar"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3 1.8 8.6 12 14.2l8.3-4.55V16h1.9V8.6L12 3Z" fill="currentColor" />
                    <path d="M6.2 13.1V17c0 .26.14.5.36.63C8.14 18.59 10.02 19.2 12 19.2c1.98 0 3.86-.61 5.44-1.57.22-.13.36-.37.36-.63v-3.9L12 16.3l-5.8-3.2Z" fill="currentColor" />
                  </svg>
                </a>
              </DockIcon>
            </Dock>
          </div>
          <footer class="site-footer">
            <p>© 2026 Gokul Raju. All rights reserved.</p>
          </footer>
        </section>
      </main>
    </section>

    <div class="chatbot-wrap" :class="{ 'chatbot-wrap--in': chatIconVisible }" @pointermove.stop @pointerleave.stop>
      <LiquidGlass
        v-if="!chatOpen"
        container-class="chatbot-fab-glass"
        class="chatbot-fab-shell"
        :radius="999"
        :frost="0.05"
        :alpha="0.18"
        :lightness="18"
        :blur="0"
        :displace="30"
      >
        <button class="chatbot-fab" type="button" @click="toggleChat" aria-label="Open chatbot">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 5.5h16v10H8l-4 3v-13Z" stroke="currentColor" stroke-width="1.6" />
            <path d="M8 9h8M8 12h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </LiquidGlass>

      <section v-if="chatOpen" class="chatbot-panel">
        <div class="chatbot-top">
          <button class="chatbot-clear" type="button" @click="clearChat" aria-label="Clear conversation">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8.5 5h7M5 7h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
              <rect x="7.2" y="7" width="9.6" height="12" rx="1.6" stroke="currentColor" stroke-width="1.9" />
              <path d="M10.1 10.2v5.8M13.9 10.2v5.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
            </svg>
          </button>
          <button class="chatbot-close" type="button" @click="toggleChat" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <div ref="chatBodyRef" class="chatbot-body">
          <div v-if="chatMessages.length === 0" class="chatbot-empty">
            <p>Work in Progress</p>
          </div>
          <div
            v-for="(message, index) in chatMessages"
            :key="`${message.role}-${index}`"
            class="chat-row"
            :class="message.role === 'user' ? 'chat-row-user' : 'chat-row-bot'"
          >
            <p>{{ message.text }}</p>
          </div>
        </div>
        <div class="chatbot-input">
          <VanishInput
            v-model="chatInput"
            :placeholders="['Ask anything...']"
            @submit="sendChatMessage"
          />
        </div>
      </section>
    </div>
    </div>
  </div>
</template>

<style scoped>
.app-root {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.resume-page {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  background: #000;
}

.resume-topbar {
  display: flex;
  justify-content: flex-start;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.92);
}

.resume-topbar :deep(.resume-back-btn) {
  padding: 0.34rem 0.9rem;
  font-size: 0.82rem;
  border-color: rgba(255, 255, 255, 0.42);
}

.resume-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #000;
}

.chatbot-wrap {
  position: fixed;
  right: 1.1rem;
  bottom: 1rem;
  z-index: 60;
  display: grid;
  justify-items: end;
  gap: 0.65rem;
  opacity: 0;
  transform: translateY(14px) scale(0.94);
  transition: opacity 400ms ease, transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.chatbot-wrap--in {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.chatbot-fab {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 999px;
  border: 0;
  background: transparent;
  color: #f8fafc;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

:deep(.chatbot-fab-glass) {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 9999px;
  overflow: hidden;
}

:deep(.chatbot-fab-shell) {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-fab svg {
  width: 1.45rem;
  height: 1.45rem;
}

.chatbot-panel {
  width: min(430px, calc(100vw - 1.4rem));
  height: 500px;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000;
  color: #f8fafc;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
  overscroll-behavior: contain;
}

.chatbot-top {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.52rem 0.62rem 0;
}

.chatbot-close,
.chatbot-clear {
  width: 1.9rem;
  height: 1.9rem;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: rgba(248, 250, 252, 0.96);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: color 140ms ease, transform 140ms ease;
}

.chatbot-close:hover,
.chatbot-clear:hover {
  color: #ffffff;
  transform: scale(1.06);
}

.chatbot-close svg,
.chatbot-clear svg {
  width: 1.18rem;
  height: 1.18rem;
  display: block;
}

.chatbot-body {
  padding: 0.65rem 1.2rem 0.35rem;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.78rem;
}

.chatbot-body::-webkit-scrollbar {
  display: none;
}

.chatbot-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-empty p {
  margin: 0;
  color: rgba(248, 250, 252, 0.98);
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  letter-spacing: 0.01em;
  font-weight: 400;
}

.chat-row p {
  margin: 0;
  padding: 0.5rem 0.62rem;
  border-radius: 0.68rem;
  font-size: 0.84rem;
  line-height: 1.45;
}

.chat-row {
  width: 100%;
  display: flex;
}

.chat-row-bot p {
  width: fit-content;
  max-width: 90%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.chat-row-user {
  justify-content: flex-end;
}

.chat-row-bot {
  justify-content: flex-start;
}

.chat-row-user p {
  width: fit-content;
  max-width: 92%;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  background: rgba(255, 255, 255, 0.88);
  color: #020617;
}

.chatbot-input {
  padding: 0.5rem 1rem 1rem;
  border-top: 0;
}

.chatbot-input :deep(.vanish-input-wrap) {
  --send-size: 1.78rem;
  --send-inset: 0.28rem;
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0;
  min-height: calc(var(--send-size) + (var(--send-inset) * 2));
  border-radius: 0.72rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #24252c;
  padding: var(--send-inset);
  overflow: hidden;
}

.chatbot-input :deep(.vanish-input) {
  flex: 1;
  box-sizing: border-box;
  min-height: var(--send-size);
  max-height: 7.5rem;
  border-radius: 0.58rem;
  border: 0;
  background: transparent;
  color: rgba(248, 250, 252, 0.9);
  padding: 0.34rem calc(var(--send-size) + var(--send-inset) + 0.72rem) 0.34rem 0.84rem;
  font-size: 0.88rem;
  line-height: 1.32;
  display: block;
  overflow: hidden;
}

.chatbot-input :deep(.vanish-input::placeholder) {
  color: rgba(148, 152, 164, 0.72);
}

.chatbot-input :deep(.vanish-send) {
  position: absolute;
  right: var(--send-inset);
  bottom: var(--send-inset);
  width: var(--send-size);
  height: var(--send-size);
  border-radius: 0.52rem;
  border: 0;
  background: #444753;
  color: rgba(248, 250, 252, 0.9);
}

.chatbot-input :deep(.vanish-send:disabled) {
  background: #363944;
  color: rgba(248, 250, 252, 0.48);
}

.chatbot-input :deep(.vanish-send:not(:disabled):hover) {
  background: #ffffff;
  color: #020617;
}

.chatbot-input :deep(.vanish-send svg) {
  width: 0.72rem;
  height: 0.72rem;
}

.hero-stage {
  position: relative;
  height: 100vh;
  min-height: 620px;
}

.hero-stage::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 220px;
  pointer-events: none;
  z-index: 4;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.82) 68%, rgba(0, 0, 0, 1));
}

.background-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.background-layer :deep(.spline-canvas) {
  width: 100%;
  height: 100%;
  display: block;
}

.hero-quote-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 0 clamp(0.5rem, 3.6vw, 2.8rem) clamp(7.6rem, 24vh, 13.1rem);
  pointer-events: none;
}

.hero-quote-shell {
  width: min(420px, 52vw);
}

.hero-quote-text {
  margin: 0;
  text-align: left;
  color: #ffffff;
  font-family: "Poppins", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: clamp(0.96rem, 2.15vw, 1.55rem);
  line-height: 1.02;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-wrap: balance;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.12);
}

.nav-wrap {
  position: fixed;
  top: 1.25rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 30;
}

@keyframes nav-enter {
  0% {
    opacity: 0;
    transform: translateY(-14px) scaleX(0.18) scaleY(0.88);
    filter: blur(4px);
  }
  60% {
    opacity: 1;
    transform: translateY(1px) scaleX(1.03) scaleY(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scaleX(1) scaleY(1);
    filter: blur(0);
  }
}

:deep(.nav-frame) {
  width: min(860px, calc(100vw - 2rem));
  border-radius: 9999px;
  overflow: hidden;
  transform-origin: center top;
  will-change: transform, opacity, filter;
  opacity: 0;
  transform: translateY(-14px) scaleX(0.18) scaleY(0.88);
  filter: blur(4px);
}

:deep(.nav-frame--enter) {
  animation: nav-enter 2400ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

:deep(.nav-shell) {
  width: 100%;
  min-height: 3.35rem;
  border-radius: 9999px;
  padding: 0.42rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: #f8fafc;
  font-family: "Poppins", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

.brand {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-size: 1.1rem;
  padding: 0.38rem 0.78rem;
  line-height: 1;
  white-space: nowrap;
}

.links {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  margin-left: auto;
}

.links a {
  color: rgba(248, 250, 252, 0.92);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.36rem 0.72rem;
  border-radius: 999px;
  transition: background-color 140ms ease;
}

.links a:hover {
  background: rgba(255, 255, 255, 0.14);
}

.content-zone {
  --section-gap: 6rem;
  --hero-overlap: 6.5rem;
  position: relative;
  z-index: 5;
  margin-top: calc(-1 * var(--hero-overlap));
  padding-top: calc(var(--hero-overlap) + var(--section-gap));
  padding-bottom: 2rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.42) 18%,
    rgba(0, 0, 0, 0.75) 34%,
    rgba(0, 0, 0, 0.94) 54%,
    rgba(0, 0, 0, 1) 100%
  );
}

.page-content {
  position: relative;
  width: min(1320px, calc(100vw - 3.5rem));
  margin: 0 auto;
  display: grid;
  gap: var(--section-gap);
}

.content-section {
  padding: 1.8rem 0.2rem;
  scroll-margin-top: 6.25rem;
}

#about,
#projects {
  scroll-margin-top: 12.75rem;
}

.content-section-plain {
  border: 0;
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
}

.content-section h2 {
  margin: 0 0 0.55rem;
  font-family: "Poppins", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 2.0rem;
  font-weight: 500;
}

.content-section p {
  margin: 0;
  color: rgba(248, 250, 252, 0.9);
  line-height: 1.55;
}

.about-copy p {
  text-align: justify;
  text-justify: inter-word;
  font-weight: 400;
  font-size: 0.9rem;
  letter-spacing: 0.005em;
}

.about-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 5.5rem;
  align-items: center;
}

.about-section {
  width: min(1020px, calc(100vw - 3.5rem));
  margin: 0 auto;
}

.about-photo-placeholder {
  min-height: 260px;
  border-radius: 0.9rem;
  overflow: hidden;
}

.about-photo {
  width: 100%;
  height: 100%;
  min-height: 260px;
  object-fit: cover;
  display: block;
}

.about-copy {
  display: grid;
  gap: 0.7rem;
  padding-block: 0.8rem;
}

.project-item {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(340px, 500px) minmax(0, 1fr);
  gap: 2.5rem;
  padding: 0.25rem 0 1.4rem 0;
  align-items: start;
}

.projects-heading {
  margin: 0 0 0.65rem 0;
}

.projects-section .projects-heading {
  margin-bottom: 0;
}

.projects-section :deep(.timeline-track-area) {
  padding-top: 2rem;
}

.projects-section :deep(.timeline-row:first-child) {
  padding-top: 0;
}

.projects-section :deep(.timeline-row:first-child .project-item) {
  padding-top: 0;
}

.projects-section {
  width: 100%;
}

.mini-projects-section {
  --mini-title-grid-gap: 2rem;
  width: 100%;
  margin-top: -6rem;
}

.mini-projects-heading {
  margin-bottom: 0;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: var(--mini-title-grid-gap);
}

.contact-section {
  width: 100%;
  display: grid;
  justify-items: center;
  gap: 1.5rem;
  padding-top: 2.2rem;
  padding-bottom: 1rem;
}

.contact-dock-anchor {
  scroll-margin-top: 7rem;
}

.site-footer {
  width: min(860px, calc(100vw - 3.5rem));
  border-top: 1px solid rgba(148, 163, 184, 0.28);
  padding-top: 1rem;
  margin-top: 0.25rem;
  text-align: center;
}

.site-footer p {
  margin: 0;
  color: rgba(203, 213, 225, 0.86);
  font-size: 0.83rem;
  line-height: 1.5;
}

.dock-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.45);
  color: #fff;
  text-decoration: none;
}

.dock-link svg {
  width: 62%;
  height: 62%;
}

.dock-email {
  background: linear-gradient(180deg, #ef4444, #dc2626);
  border-color: rgba(254, 202, 202, 0.75);
  color: #fff;
}

.dock-github {
  background: linear-gradient(180deg, #1f2937, #111827);
  border-color: rgba(203, 213, 225, 0.7);
  color: #fff;
}

.dock-linkedin {
  background: linear-gradient(180deg, #2563eb, #1d4ed8);
  border-color: rgba(191, 219, 254, 0.75);
  color: #fff;
}

.dock-scholar {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  border-color: rgba(191, 219, 254, 0.75);
  color: #ffffff;
}

.mini-card {
  border-radius: 0.95rem;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.04);
  padding: 1rem;
  min-height: 140px;
  display: flex;
  flex-direction: column;
}

.mini-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 0.65rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  margin-bottom: 0.75rem;
}

.mini-card h3 {
  margin: 0 0 0.4rem;
  font-size: 1.02rem;
  font-weight: 500;
  color: #f8fafc;
}

.mini-card p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: rgba(226, 232, 240, 0.9);
}

.mini-actions {
  margin-top: auto;
  padding-top: 0.9rem;
}

.project-media {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 0.85rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.project-copy {
  display: grid;
  gap: 0.5rem;
}

.project-copy h4 {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 500;
  color: #f8fafc;
}

.project-copy p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.58;
  color: rgba(226, 232, 240, 0.92);
  text-align: justify;
}

.project-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.7rem;
}

@media (max-width: 800px) {
  .hero-quote-layer {
    align-items: flex-end;
    justify-content: flex-start;
    padding: 0 0.65rem clamp(7.3rem, 15vh, 9rem);
  }

  .hero-quote-shell {
    width: min(100%, 360px);
  }

  .hero-quote-text {
    color: rgba(255, 255, 255, 0.78);
    font-size: clamp(0.82rem, 4.1vw, 1.08rem);
    line-height: 1.05;
    letter-spacing: 0.05em;
  }

  .about-layout {
    grid-template-columns: 1fr;
  }

  .about-photo-placeholder {
    min-height: 220px;
  }

  .project-item {
    grid-template-columns: 1fr;
    gap: 0.9rem;
    padding: 0.4rem 0 1rem 0;
  }

  .mini-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .mini-grid {
    grid-template-columns: 1fr;
  }
}
</style>
