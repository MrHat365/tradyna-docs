/**
 * Capture real UI screenshots for the user manual.
 * Requires the trading terminal on http://127.0.0.1:3000 and DOM_ACCESS_TOKEN in repo .env.
 * Token field is masked before capture; token is never written into docs.
 */
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsRoot = resolve(__dirname, '..')
const repoRoot = resolve(docsRoot, '..')
const outDir = join(docsRoot, 'docs', 'public', 'screenshots')
const BASE = process.env.DOC_SHOT_BASE || 'http://127.0.0.1:3000'

function loadToken() {
  const envPath = join(repoRoot, '.env')
  if (!existsSync(envPath)) throw new Error('missing repo .env')
  const line = readFileSync(envPath, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('DOM_ACCESS_TOKEN='))
  if (!line) throw new Error('DOM_ACCESS_TOKEN not in .env')
  return line.split('=', 2)[1].trim().replace(/^["']|["']$/g, '')
}

async function shot(page, name) {
  const path = join(outDir, name)
  await page.screenshot({ path, fullPage: false })
  console.log('wrote', path)
}

async function maskSecrets(page) {
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="password"], input[type="text"], input:not([type])')
    for (const el of inputs) {
      const input = /** @type {HTMLInputElement} */ (el)
      const ph = (input.placeholder || '') + (input.getAttribute('aria-label') || '') + (input.name || '')
      if (/令牌|token|password|密码|secret|key/i.test(ph) || input.type === 'password') {
        if (input.value) input.value = '••••••••••••••••••••••••••••••••'
      }
    }
  })
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  const token = loadToken()
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })

  // —— 01 login ——
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const ownerSwitch = page.getByRole('button', { name: /Owner|访问令牌/ })
  if (await ownerSwitch.count()) {
    await ownerSwitch.first().click()
    await page.waitForTimeout(300)
  }
  const tokenBox = page.getByLabel(/访问令牌|令牌/).or(page.getByPlaceholder(/令牌|token/i))
  if (await tokenBox.count()) {
    await tokenBox.first().fill(token)
  } else {
    await page.locator('input').last().fill(token)
  }
  await maskSecrets(page)
  await shot(page, '01-login.png')

  // real login (unmask by re-fill)
  if (await tokenBox.count()) await tokenBox.first().fill(token)
  else await page.locator('input').last().fill(token)
  await page.getByRole('button', { name: '登录终端' }).click()
  await page.waitForTimeout(2500)
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 15000 }).catch(() => {})

  // —— 02 dashboard ——
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await shot(page, '02-dashboard.png')

  // —— try open DOM ——
  let domOpened = false
  const rulesBtn = page.getByRole('button', { name: /交易规则/ })
  if (await rulesBtn.count()) {
    await rulesBtn.first().click()
    await page.waitForTimeout(1000)
  }

  const acct = page.getByLabel(/选择交易账户|交易账户/)
  if (await acct.count()) {
    await acct.first().click()
    await page.waitForTimeout(400)
    const opt = page.locator('[role=option]').filter({ hasNotText: /无可交易|无账户/ }).first()
    if (await opt.count()) {
      await opt.click()
      await page.waitForTimeout(600)
    } else {
      await page.keyboard.press('Escape')
    }
  }

  const domBtn = page.locator('button:not([disabled])', { hasText: /^DOM$/ }).first()
  if (await domBtn.count()) {
    const popupPromise = page.context().waitForEvent('page', { timeout: 8000 }).catch(() => null)
    await domBtn.click()
    const popup = await popupPromise
    if (popup) {
      await popup.waitForLoadState('networkidle').catch(() => {})
      await popup.waitForTimeout(3500)
      await popup.setViewportSize({ width: 1440, height: 900 })
      await popup.screenshot({ path: join(outDir, '03-dom-ladder.png') })
      console.log('wrote', join(outDir, '03-dom-ladder.png'))
      domOpened = true

      // grid parameter dialog (not statistics)
      const gridHeading = popup.getByText('网格策略')
      if (await gridHeading.count()) {
        await gridHeading.first().scrollIntoViewIfNeeded()
        await popup.waitForTimeout(300)
      }
      const setup = popup.getByRole('button', { name: '设置参数' })
      if (await setup.count()) {
        await setup.first().click()
        await popup.waitForTimeout(800)
        await popup.screenshot({ path: join(outDir, '04-classic-grid.png') })
        console.log('wrote', join(outDir, '04-classic-grid.png'))
        const proTab = popup.getByRole('tab', { name: '高级网格' }).or(popup.getByText('高级网格', { exact: true }))
        if (await proTab.count()) {
          await proTab.first().click()
          await popup.waitForTimeout(500)
          await popup.screenshot({ path: join(outDir, '05-pro-grid.png') })
          console.log('wrote', join(outDir, '05-pro-grid.png'))
        }
      }
      await popup.close().catch(() => {})
    }
  }

  if (!domOpened) {
    // direct URL fallback — may still show gate UI
    await page.goto(`${BASE}/dom?symbol=BTCUSDT`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await shot(page, '03-dom-ladder.png')
    console.warn('DOM via popup failed; captured /dom fallback (may lack account)')
  }

  // ensure grid shots exist as annotated placeholders if missing
  for (const name of ['04-classic-grid.png', '05-pro-grid.png']) {
    if (!existsSync(join(outDir, name)) && existsSync(join(outDir, '03-dom-ladder.png'))) {
      // leave missing; SVG fallbacks generated below
      console.warn('missing', name)
    }
  }

  // —— 06 strategies ——
  await page.goto(`${BASE}/strategies`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await shot(page, '06-console-strategies.png')

  await browser.close()
  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
