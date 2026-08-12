<script setup lang="ts">
import MarketTicker from './MarketTicker.vue'

const venues = ['Bitget', 'WEEX', 'Gate', 'Binance']

const steps = [
  { n: '01', t: '登录', h: '/guide/login' },
  { n: '02', t: '添加账户', h: '/guide/accounts-add' },
  { n: '03', t: 'DOM 点价', h: '/guide/dom' },
  { n: '04', t: '网格策略', h: '/guide/classic-grid' },
]
</script>

<template>
  <section class="hs" aria-label="Tradyna 用户手册首页">
    <!-- edge-to-edge product plane -->
    <div class="hs-hero">
      <div class="hs-shot-wrap" aria-hidden="true">
        <img
          class="hs-shot"
          src="/screenshots/03-dom-ladder.png"
          alt=""
          width="1440"
          height="900"
          decoding="async"
        />
        <div class="hs-shot-sheen" />
        <div class="hs-shot-scan" />
        <div class="hs-shot-veil" />
      </div>

      <div class="hs-copy">
        <div class="hs-brand">
          <img
            class="hs-mark"
            src="/brand/logo.svg"
            width="52"
            height="52"
            alt="Tradyna"
          />
          <div class="hs-brand-text">
            <span class="hs-wordmark">Tradyna</span>
            <span class="hs-sub">TERMINAL · DOCS</span>
          </div>
        </div>

        <h1 class="hs-title">多交易所永续 DOM 终端</h1>
        <p class="hs-lead">
          登录、加账户、点价与网格——只讲你会用到的操作。
        </p>

        <div class="hs-venues" aria-label="支持的交易所">
          <span v-for="v in venues" :key="v" class="hs-pill">{{ v }}</span>
        </div>

        <div class="hs-actions">
          <a class="hs-cta" href="/guide/getting-started">开始使用</a>
          <a
            class="hs-link"
            href="https://trader.tradyna.cc/"
            target="_blank"
            rel="noopener noreferrer"
          >DOM 终端</a>
        </div>

        <p class="hs-note">本手册面向终端用户。不含部署与开发排障。</p>
      </div>
    </div>

    <MarketTicker />

    <nav class="hs-path" aria-label="快速入口">
      <a
        v-for="s in steps"
        :key="s.n"
        class="hs-step"
        :href="s.h"
      >
        <span class="hs-step-n">{{ s.n }}</span>
        <span class="hs-step-t">{{ s.t }}</span>
      </a>
    </nav>
  </section>
</template>

<style scoped>
.hs {
  --gold: #c9a86c;
  --gold-hi: #d4b483;
  --ink: #07090d;
  --cream: #ebe8e2;
  --muted: #a8b0bd;
  --dim: #6b7380;

  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: var(--cream);
  background: var(--ink);
}

.hs-hero {
  position: relative;
  min-height: calc(100vh - 64px - 88px);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hs-shot-wrap {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #0a0c10;
}

.hs-shot {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 钉右侧，避免 cover+scale 切掉 EXECUTION 面板 */
  object-position: right 14%;
  transform: scale(1.02);
  animation: shot-in 1.15s cubic-bezier(0.22, 1, 0.36, 1) both,
    shot-parallax 24s ease-in-out infinite alternate;
  filter: saturate(1.06) contrast(1.05) brightness(0.92);
}

.hs-shot-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    108deg,
    transparent 34%,
    rgba(241, 235, 224, 0.08) 48%,
    transparent 62%
  );
  background-size: 220% 100%;
  animation: sheen-sweep 7.2s ease-in-out infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}

.hs-shot-scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 16%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(201, 168, 108, 0.035),
    transparent
  );
  animation: scan-sweep 6.2s ease-in-out infinite;
  pointer-events: none;
}

.hs-shot-veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      90deg,
      rgba(7, 9, 13, 0.94) 0%,
      rgba(7, 9, 13, 0.82) 28%,
      rgba(7, 9, 13, 0.45) 48%,
      rgba(7, 9, 13, 0.18) 68%,
      rgba(7, 9, 13, 0.28) 100%
    ),
    linear-gradient(
      180deg,
      rgba(7, 9, 13, 0.35) 0%,
      transparent 22%,
      transparent 78%,
      rgba(7, 9, 13, 0.55) 100%
    );
}

.hs-copy {
  position: relative;
  z-index: 1;
  width: min(560px, 100%);
  padding: clamp(2.2rem, 6vh, 4rem) clamp(1.35rem, 5vw, 3.5rem);
  animation: copy-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hs-brand {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  margin-bottom: 1.55rem;
}

.hs-mark {
  width: 52px;
  height: 52px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(201, 168, 108, 0.1));
}

.hs-brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  line-height: 1;
}

.hs-wordmark {
  font-size: 1.7rem;
  font-weight: 560;
  letter-spacing: -0.03em;
  color: var(--cream);
  text-shadow: 0 1px 18px rgba(0, 0, 0, 0.45);
}

.hs-sub {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  color: var(--gold);
}

.hs-title {
  margin: 0;
  font-size: clamp(2.15rem, 4.6vw, 3.25rem);
  font-weight: 520;
  letter-spacing: -0.03em;
  line-height: 1.12;
  color: var(--cream);
  max-width: 11ch;
  text-shadow: 0 2px 28px rgba(0, 0, 0, 0.55);
}

.hs-lead {
  margin: 1.05rem 0 0;
  max-width: 28rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--muted);
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.5);
}

.hs-venues {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1.35rem;
}

.hs-pill {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  padding: 0.28rem 0.55rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: var(--muted);
  background: rgba(7, 9, 13, 0.45);
  backdrop-filter: blur(6px);
  border-radius: 3px;
}

.hs-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem 1.25rem;
  margin-top: 1.75rem;
}

.hs-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6rem;
  padding: 0 1.35rem;
  border-radius: 6px;
  background: var(--gold);
  color: #0a0c10;
  font-weight: 550;
  letter-spacing: 0.03em;
  text-decoration: none;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  transition: background 0.2s ease, transform 0.2s ease;
}

.hs-cta:hover {
  background: var(--gold-hi);
  transform: translateY(-1px);
}

.hs-link {
  color: var(--gold-hi);
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  border-bottom: 1px solid rgba(201, 168, 108, 0.28);
  padding-bottom: 1px;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.45);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.hs-link:hover {
  color: #e0c89a;
  border-color: rgba(224, 200, 154, 0.75);
}

.hs-note {
  margin: 1.7rem 0 0;
  font-size: 0.78rem;
  color: var(--dim);
  letter-spacing: 0.02em;
}

.hs-path {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: rgba(7, 9, 13, 0.96);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.hs-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem 1.25rem;
  text-decoration: none;
  color: var(--muted);
  border-right: 1px solid rgba(148, 163, 184, 0.08);
  transition: background 0.2s ease, color 0.2s ease;
}

.hs-step:last-child {
  border-right: none;
}

.hs-step:hover {
  background: rgba(148, 163, 184, 0.05);
  color: var(--cream);
}

.hs-step-n {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: var(--gold);
}

.hs-step-t {
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

@media (max-width: 720px) {
  .hs-hero {
    min-height: calc(100vh - 64px - 160px);
  }
  .hs-shot {
    object-position: right 10%;
  }
  .hs-shot-veil {
    background:
      linear-gradient(
        180deg,
        rgba(7, 9, 13, 0.55) 0%,
        rgba(7, 9, 13, 0.78) 42%,
        rgba(7, 9, 13, 0.92) 100%
      );
  }
  .hs-path {
    grid-template-columns: 1fr;
  }
  /* keep single-column stack on narrow screens */
  .hs-step {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  }
  .hs-step:last-child {
    border-bottom: none;
  }
}

@keyframes copy-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes shot-in {
  from {
    opacity: 0;
    transform: scale(1.06);
  }
  to {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes shot-parallax {
  from {
    object-position: right 10%;
  }
  to {
    object-position: right 22%;
  }
}

@keyframes sheen-sweep {
  0%,
  26% {
    background-position: 130% 0;
  }
  58%,
  100% {
    background-position: -50% 0;
  }
}

@keyframes scan-sweep {
  0% {
    top: -14%;
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  88% {
    opacity: 1;
  }
  100% {
    top: 90%;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hs-shot,
  .hs-shot-sheen,
  .hs-shot-scan,
  .hs-copy {
    animation: none !important;
  }
  .hs-shot {
    opacity: 1;
    transform: scale(1);
    object-position: right 14%;
  }
}
</style>
