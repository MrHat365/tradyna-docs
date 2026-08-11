/**
 * Re-capture classic / pro grid parameter dialogs (not statistics).
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
  const line = readFileSync(join(repoRoot, '.env'), 'utf8')
    .split('\n')
    .find((l) => l.startsWith('DOM_ACCESS_TOKEN='))
  return line.split('=', 2)[1].trim().replace(/^["']|["']$/g, '')
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  const token = loadToken()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const ownerSwitch = page.getByRole('button', { name: /Owner|访问令牌/ })
  if (await ownerSwitch.count()) await ownerSwitch.first().click()
  await page.waitForTimeout(200)
  const tokenBox = page.getByLabel(/访问令牌/)
  await tokenBox.fill(token)
  await page.getByRole('button', { name: '登录终端' }).click()
  await page.waitForTimeout(2000)

  // Prefer known account+symbol from trading rules flow
  await page.goto(`${BASE}/rules`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // pick first account if selector exists
  const acct = page.getByLabel(/选择交易账户|交易账户/)
  if (await acct.count()) {
    await acct.first().click()
    await page.waitForTimeout(300)
    const opt = page.locator('[role=option]').filter({ hasNotText: /无可|无账户/ }).first()
    if (await opt.count()) await opt.click()
    await page.waitForTimeout(500)
  }

  // click first enabled DOM
  const popupPromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null)
  const domBtn = page.locator('button:not([disabled])', { hasText: /^DOM$/ }).first()
  if (!(await domBtn.count())) {
    // try overview
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
  }
  const btn2 = page.locator('button:not([disabled])', { hasText: /^DOM$/ }).first()
  if (await btn2.count()) await btn2.click()
  else {
    // direct with query if we can find account id from page
    console.log('no DOM button; dumping body text snippet')
    console.log((await page.locator('body').innerText()).slice(0, 500))
  }

  let popup = await popupPromise
  if (!popup) {
    // maybe same-tab navigation
    await page.waitForTimeout(1500)
    if (page.url().includes('/dom')) popup = page
  }
  if (!popup) throw new Error('DOM window not opened')

  await popup.waitForLoadState('domcontentloaded')
  await popup.waitForTimeout(4000)
  await popup.setViewportSize({ width: 1440, height: 900 })

  // scroll sidebar to grid section
  const gridHeading = popup.getByText('网格策略')
  if (await gridHeading.count()) {
    await gridHeading.first().scrollIntoViewIfNeeded()
    await popup.waitForTimeout(400)
  }

  // open editor via 设置参数
  const setup = popup.getByRole('button', { name: '设置参数' })
  const edit = popup.getByRole('button', { name: /编辑参数|参数/ })
  if (await setup.count()) {
    await setup.first().click()
  } else if (await edit.count()) {
    await edit.first().click()
  } else {
    // click gear near 网格策略
    const gears = popup.locator('button').filter({ hasText: /设置|参数/ })
    console.log('setup buttons', await gears.count())
    // dump buttons near grid
    const texts = await popup.locator('button').allTextContents()
    console.log('buttons', texts.filter((t) => /网格|参数|启动|统计|设置/.test(t)).slice(0, 30))
    throw new Error('cannot find 设置参数')
  }

  await popup.waitForTimeout(900)
  // ensure classic tab
  const classic = popup.getByRole('tab', { name: '经典网格' }).or(popup.getByText('经典网格', { exact: true }))
  if (await classic.count()) await classic.first().click()
  await popup.waitForTimeout(400)
  await popup.screenshot({ path: join(outDir, '04-classic-grid.png') })
  console.log('wrote 04-classic-grid.png')

  const pro = popup.getByRole('tab', { name: '高级网格' }).or(popup.getByText('高级网格', { exact: true }))
  if (await pro.count()) {
    await pro.first().click()
    await popup.waitForTimeout(500)
    await popup.screenshot({ path: join(outDir, '05-pro-grid.png') })
    console.log('wrote 05-pro-grid.png')
  } else {
    console.warn('no pro tab')
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
