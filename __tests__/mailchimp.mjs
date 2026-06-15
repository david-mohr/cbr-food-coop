import { jest } from '@jest/globals'
import { determineSignupTags, determineTags, formatMemberForMailchimp, formatDateForMailchimp, calculateDaysLeft, emailHash } from '../api/utils/mailchimp.mjs'

describe('Mailchimp Utilities', () => {
  describe('formatDateForMailchimp', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-02-15T10:30:00Z')
      expect(formatDateForMailchimp(date)).toEqual('2026-02-15')
    })

    it('should format date string correctly', () => {
      expect(formatDateForMailchimp('2026-02-15')).toEqual('2026-02-15')
    })

    it('should return empty string for null', () => {
      expect(formatDateForMailchimp(null)).toEqual('')
    })

    it('should return empty string for undefined', () => {
      expect(formatDateForMailchimp(undefined)).toEqual('')
    })

    it('should return empty string for empty string', () => {
      expect(formatDateForMailchimp('')).toEqual('')
    })
  })

  describe('calculateDaysLeft', () => {
    it('should calculate positive days for future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      const days = calculateDaysLeft(futureDate)
      expect(days).toBeGreaterThanOrEqual(29)
      expect(days).toBeLessThanOrEqual(30)
    })

    it('should calculate negative days for past date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30)
      const days = calculateDaysLeft(pastDate)
      expect(days).toBeLessThanOrEqual(-29)
      expect(days).toBeGreaterThanOrEqual(-31)
    })

    it('should calculate zero for today', () => {
      const today = new Date()
      const days = calculateDaysLeft(today)
      expect(days).toBeLessThanOrEqual(0)
      expect(days).toBeGreaterThanOrEqual(-1) // Allow for timing differences
    })

    it('should return null for null', () => {
      expect(calculateDaysLeft(null)).toBeNull()
    })

    it('should return null for undefined', () => {
      expect(calculateDaysLeft(undefined)).toBeNull()
    })
  })
  //   MD5 hash should never change for same email
  describe('emailHash', () => {
    it('should generate consistent MD5 hash', () => {
      const hash = emailHash('test@example.com')
      expect(hash).toEqual('55502f40dc8b7c769880b10874abc9d0')
    })

    it('should handle uppercase emails', () => {
      const hash1 = emailHash('TEST@EXAMPLE.COM')
      const hash2 = emailHash('test@example.com')
      expect(hash1).toEqual(hash2)
    })

    it('should handle mixed case emails', () => {
      const hash1 = emailHash('TeSt@ExAmPlE.CoM')
      const hash2 = emailHash('test@example.com')
      expect(hash1).toEqual(hash2)
    })

    it('should generate different hashes for different emails', () => {
      const hash1 = emailHash('test1@example.com')
      const hash2 = emailHash('test2@example.com')
      expect(hash1).not.toEqual(hash2)
    })
  })

  describe('determineSignupTags', () => {
    it('should include Active tag', () => {
      const tags = determineSignupTags({}, {})
      expect(tags).toContain('Active')
    })

    it('should include Provisional tag if not approved', () => {
      const tags = determineSignupTags({ is_approved: false }, {})
      expect(tags).toContain('Provisional')
    })

    it('should not include Provisional tag if approved', () => {
      const tags = determineSignupTags({ is_approved: true }, {})
      expect(tags).not.toContain('Provisional')
    })

    it('should include concession tag if present', () => {
      const tags = determineSignupTags({ concession_type: 'Pensioner' }, {})
      expect(tags).toContain('Pensioner')
    })

    it('should include concession tag as string', () => {
      const tags = determineSignupTags({ concession_type: 123 }, {})
      expect(tags).toContain('123')
    })

    it('should include Unclaimed First Shop tag', () => {
      const tags = determineSignupTags({}, {})
      expect(tags).toContain('Unclaimed First Shop')
    })

    it('should combine all applicable tags', () => {
      const tags = determineSignupTags(
        {
          is_approved: false,
          concession_type: 'Pensioner'
        },
        {}
      )
      expect(tags).toContain('Provisional')
      expect(tags).toContain('Pensioner')
      expect(tags).toContain('Active')
      expect(tags).toContain('Unclaimed First Shop')
      expect(tags.length).toEqual(5)
    })

    it('should handle minimal member data', () => {
      const tags = determineSignupTags(
        { is_approved: true },
        {}
      )
      expect(tags).toContain('Active')
      expect(tags).toContain('Unclaimed First Shop')
      expect(tags).not.toContain('Provisional')
      expect(tags.length).toEqual(3)
    })
  })
})

describe('determineTags', () => {
  const futureDate = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString()
  }
  const pastDate = (days) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString()
  }

  it('should return no expiry tags for Active member with expiry far in future', () => {
    const tags = determineTags({ membership_status: 'Active', expiry_date: futureDate(60), claimed_first_shop: true })
    expect(tags).not.toContain('Expiring This Month')
    expect(tags).not.toContain('Expired')
  })

  it('should tag Active member expiring this month', () => {
    const tags = determineTags({ membership_status: 'Active', expiry_date: futureDate(15), claimed_first_shop: true })
    expect(tags).toContain('Expiring This Month')
    expect(tags).not.toContain('Expiring This Week')
  })

  it('should tag Active member expiring this week', () => {
    const tags = determineTags({ membership_status: 'Active', expiry_date: futureDate(3), claimed_first_shop: true })
    expect(tags).toContain('Expiring This Month')
    expect(tags).toContain('Expiring This Week')
    expect(tags).not.toContain('Expiring Today')
  })

  it('should tag Active member expiring today', () => {
    const tags = determineTags({ membership_status: 'Active', expiry_date: futureDate(0), claimed_first_shop: true })
    expect(tags).toContain('Expiring Today')
    expect(tags).toContain('Expiring This Week')
    expect(tags).toContain('Expiring This Month')
  })

  it('should tag Expired member with Expired and Recently Expired within 90 days', () => {
    const tags = determineTags({ membership_status: 'Expired', expiry_date: pastDate(30), claimed_first_shop: true })
    expect(tags).toContain('Expired')
    expect(tags).toContain('Recently Expired')
  })

  it('should tag Expired member with only Expired after 90 days', () => {
    const tags = determineTags({ membership_status: 'Expired', expiry_date: pastDate(100), claimed_first_shop: true })
    expect(tags).toContain('Expired')
    expect(tags).not.toContain('Recently Expired')
  })

  it('should add Working Member tag if last_volunteered set', () => {
    const tags = determineTags({ claimed_first_shop: true, last_volunteered: '2026-01-01' })
    expect(tags).toContain('Working Member')
  })

  it('should add Working Member tag if discount_status is Discount Active', () => {
    const tags = determineTags({ claimed_first_shop: true, discount_status: 'Discount Active' })
    expect(tags).toContain('Working Member')
  })

  it('should add Coordinator tag if has_coordinator_account', () => {
    const tags = determineTags({ claimed_first_shop: true, has_coordinator_account: true })
    expect(tags).toContain('Coordinator')
  })

  it('should add Provisional tag if not approved', () => {
    const tags = determineTags({ claimed_first_shop: true, is_approved: false })
    expect(tags).toContain('Provisional')
  })

  it('should add concession and discount_status tags', () => {
    const tags = determineTags({ claimed_first_shop: true, concession_type: 'Pensioner', discount_status: 'Discount Active' })
    expect(tags).toContain('Pensioner')
    expect(tags).toContain('Discount Active')
  })

  it('should add Unclaimed First Shop if claimed_first_shop is falsy', () => {
    const tags = determineTags({ claimed_first_shop: false })
    expect(tags).toContain('Unclaimed First Shop')
  })

  it('should not add Unclaimed First Shop if claimed_first_shop is true', () => {
    const tags = determineTags({ claimed_first_shop: true })
    expect(tags).not.toContain('Unclaimed First Shop')
  })
})

describe('formatMemberForMailchimp', () => {
  const baseMember = {
    email: 'jane@example.com',
    firstname: 'Jane',
    lastname: 'Smith',
    phone: '0400000000',
    suburb: 'Braddon',
    membership_type: 'Full',
    concession_type: null,
    first_action_date: '2024-01-01',
    last_volunteered: null,
    expiry_date: null,
    discount_expiry: null,
    claimed_first_shop: true,
    membership_status: 'Active',
    is_approved: true,
    has_coordinator_account: false,
    discount_status: null
  }

  it('should return correct email_address and status_if_new', () => {
    const result = formatMemberForMailchimp(baseMember)
    expect(result.email_address).toBe('jane@example.com')
    expect(result.status_if_new).toBe('subscribed')
  })

  it('should default status to subscribed for new members', () => {
    const result = formatMemberForMailchimp(baseMember, null)
    expect(result.status).toBe('subscribed')
  })

  it('should preserve existing Mailchimp status', () => {
    const result = formatMemberForMailchimp(baseMember, { status: 'unsubscribed', merge_fields: {}, tags: [] })
    expect(result.status).toBe('unsubscribed')
  })

  it('should populate merge fields from member data', () => {
    const result = formatMemberForMailchimp(baseMember)
    expect(result.merge_fields.FNAME).toBe('Jane')
    expect(result.merge_fields.LNAME).toBe('Smith')
    expect(result.merge_fields.PHONE).toBe('0400000000')
    expect(result.merge_fields.SUBURB).toBe('Braddon')
    expect(result.merge_fields.MTYPE).toBe('Full')
  })

  it('should use JOINED date from Mailchimp if present', () => {
    const existing = { status: 'subscribed', merge_fields: { JOINED: '2023-06-01' }, tags: [] }
    const result = formatMemberForMailchimp(baseMember, existing)
    expect(result.merge_fields.JOINED).toBe('2023-06-01')
  })

  it('should use DB first_action_date for JOINED if not in Mailchimp', () => {
    const result = formatMemberForMailchimp(baseMember, null)
    expect(result.merge_fields.JOINED).toBe('2024-01-01')
  })

  it('should include existingTags from Mailchimp member', () => {
    const existing = { status: 'subscribed', merge_fields: {}, tags: [{ name: 'OldTag' }] }
    const result = formatMemberForMailchimp(baseMember, existing)
    expect(result.existingTags).toEqual(['OldTag'])
  })

  it('should set empty existingTags when no existing member', () => {
    const result = formatMemberForMailchimp(baseMember, null)
    expect(result.existingTags).toEqual([])
  })

  it('should include EXPIRY and DAYSLEFT merge fields when expiry_date is set and in future', () => {
    const d = new Date()
    d.setDate(d.getDate() + 10)
    const result = formatMemberForMailchimp({ ...baseMember, expiry_date: d.toISOString() })
    expect(result.merge_fields.EXPIRY).toBeDefined()
    expect(result.merge_fields.DAYSLEFT).toBeGreaterThanOrEqual(9)
  })

  it('should not include DAYSLEFT if expiry is in the past', () => {
    const d = new Date()
    d.setDate(d.getDate() - 5)
    const result = formatMemberForMailchimp({ ...baseMember, expiry_date: d.toISOString(), membership_status: 'Expired' })
    expect(result.merge_fields.EXPIRY).toBeDefined()
    expect(result.merge_fields.DAYSLEFT).toBeUndefined()
  })
})
