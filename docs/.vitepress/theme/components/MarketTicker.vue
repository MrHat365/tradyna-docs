<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type Tick = {
  s: string
  p: string
  d: string
  up: boolean
}

const SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'DOGEUSDT',
] as const

const DISPLAY: Record<(typeof SYMBOLS)[number], string> = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  SOLUSDT: 'SOL',
  BNBUSDT: 'BNB',
  XRPUSDT: 'XRP',
  DOGEUSDT: 'DOGE',
}

const POLL_MS = 15_000

const tickers = ref<Tick[]>([])
const status = ref<'loading' | 'live' | 'stale' | 'unavailable'>('loading')
let timer: ReturnType<typeof setInterval> | null = null
let abort: AbortController | null = null

function formatPrice(raw: string): string {
  const n = Number(raw)
  if (!Number.isFinite(n)) return '—'
  if (n >= 1000) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }
  if (n >= 1) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  })
}

function formatChange(pct: string): { d: string; up: boolean } {
  const n = Number(pct)
  if (!Number.isFinite(n)) return { d: '—', up: true }
  const up = n >= 0
  const abs = Math.abs(n).toFixed(2)
  return { d: `${up ? '+' : '-'}${abs}%`, up }
}

async function fetchTickers(): Promise<boolean> {
  abort?.abort()
  abort = new AbortController()
  const symbols = encodeURIComponent(JSON.stringify([...SYMBOLS]))
  const urls = [
    `/binance-api/api/v3/ticker/24hr?symbols=${symbols}`,
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`,
    `https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${symbols}`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: abort.signal,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) continue
      const rows = (await res.json()) as Array<{
        symbol: string
        lastPrice: string
        priceChangePercent: string
      }>
      if (!Array.isArray(rows) || rows.length === 0) continue

      const bySym = new Map(rows.map((r) => [r.symbol, r]))
      const next: Tick[] = []
      for (const sym of SYMBOLS) {
        const row = bySym.get(sym)
        if (!row) continue
        const ch = formatChange(row.priceChangePercent)
        next.push({
          s: DISPLAY[sym],
          p: formatPrice(row.lastPrice),
          d: ch.d,
          up: ch.up,
        })
      }
      if (next.length === 0) continue

      tickers.value = next
      status.value = 'live'
      return true
    } catch {
      // try next source
    }
  }
  return false
}

async function refresh() {
  const ok = await fetchTickers()
  if (ok) return
  if (tickers.value.length > 0) {
    status.value = 'stale'
  } else {
    status.value = 'unavailable'
  }
}

const showUnavailable = computed(
  () => status.value === 'unavailable' && tickers.value.length === 0,
)

onMounted(() => {
  void refresh()
  timer = setInterval(() => void refresh(), POLL_MS)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  abort?.abort()
})
</script>

<template>
  <div
    class="mt"
    :aria-label="
      showUnavailable
        ? '行情暂不可用'
        : status === 'stale'
          ? '行情延迟，显示上次价格'
          : '实时行情'
    "
  >
    <div v-if="showUnavailable" class="mt-fallback">行情暂不可用</div>
    <div v-else-if="tickers.length === 0" class="mt-fallback">行情加载中…</div>
    <div v-else class="mt-track">
      <div v-for="pass in 2" :key="pass" class="mt-pass">
        <div
          v-for="(t, i) in tickers"
          :key="`${pass}-${i}`"
          class="mt-tick"
        >
          <span class="mt-s">{{ t.s }}</span>
          <span class="mt-p">{{ t.p }}</span>
          <span class="mt-d" :class="t.up ? 'up' : 'dn'">{{ t.d }}</span>
        </div>
      </div>
    </div>
    <span v-if="status === 'stale'" class="mt-stale" aria-hidden="true">延迟</span>
  </div>
</template>

<style scoped>
.mt {
  --gold-hi: #d4b483;
  position: relative;
  z-index: 2;
  border-top: 1px solid rgba(201, 168, 108, 0.16);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(8, 10, 14, 0.94);
  overflow: hidden;
  height: 40px;
}

.mt-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: #6b7380;
}

.mt-track {
  display: flex;
  width: max-content;
  height: 100%;
  animation: mt-roll 32s linear infinite;
}

.mt-pass {
  display: flex;
  align-items: center;
  height: 100%;
}

.mt-tick {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  padding: 0 1.35rem;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
}

.mt-s {
  color: var(--gold-hi);
  font-weight: 500;
}

.mt-p {
  color: #d8d0c4;
  font-variant-numeric: tabular-nums;
}

.mt-d.up {
  color: #6fbf8a;
}

.mt-d.dn {
  color: #e07a6a;
}

.mt-stale {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  color: #6b7380;
  pointer-events: none;
}

@keyframes mt-roll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mt-track {
    animation: none !important;
  }
}
</style>
