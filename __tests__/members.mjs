import { jest } from '@jest/globals'
import { DateTime } from 'luxon'

const mockDatabase = {
  __esModule: true,
  query: jest.fn()
}
// Jest >= 27.1.1
jest.unstable_mockModule('../api/database.mjs', () => mockDatabase)

const { updateVolunteerHours } = await import('../api/members.mjs')
const { getNextMemberId, getNextMembershipId } = await import('../api/signup.mjs')

it('should update the hours correctly', async () => {
  mockDatabase.query.mockResolvedValueOnce([{ discvaliduntil: null }])
  mockDatabase.query.mockResolvedValueOnce()
  await updateVolunteerHours('id', 3)
  expect(mockDatabase.query).toHaveBeenCalledTimes(2)
  const newDiscount = DateTime.now().startOf('day').plus({ days: 42 }).toString()
  expect(mockDatabase.query.mock.calls[1][1]).toEqual([newDiscount, 'id'])
})

it('should handle future startDate', async () => {
  const startDate = DateTime.now().startOf('day').plus({ days: 30 })
  mockDatabase.query.mockResolvedValueOnce([{ discvaliduntil: startDate.toJSDate() }])
  mockDatabase.query.mockResolvedValueOnce()
  await updateVolunteerHours('id', 1)
  const newDiscount = startDate.plus({ days: 14 }).toString()
  expect(mockDatabase.query.mock.calls[1][1]).toEqual([newDiscount, 'id'])
})

it('should handle past startDate (ignore it and use today)', async () => {
  const startDate = DateTime.now().startOf('day').minus({ days: 30 })
  mockDatabase.query.mockResolvedValueOnce([{ discvaliduntil: startDate.toString() }])
  mockDatabase.query.mockResolvedValueOnce()
  await updateVolunteerHours('id', 1)
  const newDiscount = DateTime.now().startOf('day').plus({ days: 14 }).toString()
  expect(mockDatabase.query.mock.calls[1][1]).toEqual([newDiscount, 'id'])
})

it('should calculate the next member ID', async () => {
  mockDatabase.query.mockResolvedValueOnce([{ max: 'c1009' }])
  const id = await getNextMemberId()
  expect(id).toEqual('c1010')
})

it('should calculate the next membership ID', async () => {
  mockDatabase.query.mockResolvedValueOnce([{ max: 'm5099' }])
  const id = await getNextMembershipId()
  expect(id).toEqual('m5100')
})
