import { expect, test } from '@playwright/test'

type Slot = {
  eventTypeId: string
  startAt: string
}

const API_BASE_URL = `http://127.0.0.1:${process.env.E2E_API_PORT || '3101'}`

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Yekaterinburg',
})

test('guest books the first available 30 minute slot', async ({ page, request }) => {
  const slotsResponse = await request.get(`${API_BASE_URL}/event-types/evt-30/slots`)
  expect(slotsResponse.ok()).toBe(true)

  const slots = (await slotsResponse.json()) as Slot[]
  expect(slots.length).toBeGreaterThan(0)

  const firstSlot = slots[0]!
  const slotTime = timeFormatter.format(new Date(firstSlot.startAt))
  const uniqueId = Date.now()
  const guestName = `Playwright Guest ${uniqueId}`
  const guestEmail = `playwright-${uniqueId}@example.com`

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Выберите тип события' })).toBeVisible()

  await page.locator('.event-card').filter({ hasText: '30 мин' }).click()
  await expect(page.getByRole('heading', { name: 'Свободное время' })).toBeVisible()

  const slotButton = page.locator('.slot-button').filter({ hasText: slotTime }).first()
  await expect(slotButton).toBeVisible()
  await expect(async () => {
    await slotButton.click()
    await expect(page.getByLabel('Имя')).toBeVisible({ timeout: 1_000 })
  }).toPass({ timeout: 10_000 })

  await page.getByLabel('Имя').fill(guestName)
  await page.getByLabel('Электронная почта').fill(guestEmail)
  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  await expect(page.getByText('Запись создана')).toBeVisible()
  await expect(page.getByText(guestName)).toBeVisible()
  await expect(page.getByText(guestEmail)).toBeVisible()

  const conflictResponse = await request.post(`${API_BASE_URL}/bookings`, {
    data: {
      eventTypeId: firstSlot.eventTypeId,
      startAt: firstSlot.startAt,
      guestName: `${guestName} Conflict`,
      guestEmail: `conflict-${guestEmail}`,
    },
  })
  expect(conflictResponse.status()).toBe(409)
  await expect(await conflictResponse.json()).toEqual(
    expect.objectContaining({
      code: 'BOOKING_CONFLICT',
    }),
  )

  await page.goto('/admin/bookings')
  await expect(page.getByRole('heading', { name: 'Предстоящие бронирования' })).toBeVisible()
  await expect(page.getByText(guestName)).toBeVisible()
  await expect(page.getByText(guestEmail)).toBeVisible()
})
