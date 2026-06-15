import crypto from 'crypto'

/**
 * Format date for Mailchimp (YYYY-MM-DD)
 */
export function formatDateForMailchimp (dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

/**
 * Calculate days until/since expiry
 */
export function calculateDaysLeft (expiryDate) {
  if (!expiryDate) return null
  return Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
}

/**
 * Generate MD5 hash for email (used by Mailchimp)
 */
export function emailHash (email) {
  return crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex')
}

/**
 * Determine tags for a member based on their data
 * @param {object} member - Member data from database
 * @returns {Array<string>} Array of tag names
 */
export function determineTags (member) {
  const tags = []

  const daysUntilExpiry = calculateDaysLeft(member.expiry_date)
  // Membership status tags
  if (member.membership_status === 'Active' && daysUntilExpiry !== null) {
    if (daysUntilExpiry < 1) {
      tags.push('Expiring Today')
    }
    if (daysUntilExpiry < 7) {
      tags.push('Expiring This Week')
    }
    if (daysUntilExpiry < 31) {
      tags.push('Expiring This Month')
    }
  } else if (member.membership_status === 'Expired' && daysUntilExpiry !== null) {
    const daysSinceExpiry = -daysUntilExpiry
    tags.push('Expired')
    if (daysSinceExpiry <= 90 && daysSinceExpiry >= 0) {
      tags.push('Recently Expired')
    }
  }

  // Volunteer status
  if (member.last_volunteered || member.discount_status === 'Discount Active') {
    tags.push('Working Member')
  }

  // Coordinator status
  if (member.has_coordinator_account) {
    tags.push('Coordinator')
  }

  // Approval status
  if (!member.is_approved) {
    tags.push('Provisional')
  }

  // Concession status
  if (member.concession_type) {
    tags.push(String(member.concession_type))
  }

  // Discount status
  if (member.discount_status) {
    tags.push(String(member.discount_status))
  }

  if (!member.claimed_first_shop) {
    tags.push('Unclaimed First Shop')
  }
  return tags
}

/**
 * Convert member data to Mailchimp format
 * @param {object} member - Member data from database
 * @param {object} existingMailchimpMember - Existing member data from Mailchimp (if any)
 *
 * Note on join date preservation:
 * - Preserves JOINED date from Mailchimp if present (including for archived members who are unarchiving)
 * - Mailchimp preserves all member data when archiving, so unarchiving restores the join date.
 */
export function formatMemberForMailchimp (member, existingMailchimpMember = null) {
  const hash = emailHash(member.email)

  const tags = determineTags(member)

  // Preserve existing JOINED date if present in Mailchimp, otherwise use DB value
  const joinedDate = (existingMailchimpMember?.merge_fields?.JOINED && existingMailchimpMember.merge_fields.JOINED !== '')
    ? existingMailchimpMember.merge_fields.JOINED
    : (member.first_action_date ? formatDateForMailchimp(member.first_action_date) : '')

  // Preserve subscription status if member exists and has a valid status
  const validStatuses = ['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional']
  const status = (existingMailchimpMember && validStatuses.includes(existingMailchimpMember.status))
    ? existingMailchimpMember.status
    : 'subscribed'

  // MailChimp does not accept null or undefined merge field values, so we default to empty strings
  // even where the datatype is not a string (e.g. phone number or dates) to ensure the API
  // call succeeds without validation errors.
  const mergeFields = {
    FNAME: member.firstname || '',
    LNAME: member.lastname || '',
    PHONE: member.phone || '',
    SUBURB: member.suburb || '',
    MTYPE: member.membership_type || '',
    CONCESSION: member.concession_type || '',
    JOINED: joinedDate
  }

  if (member.expiry_date) {
    mergeFields.EXPIRY = formatDateForMailchimp(member.expiry_date)
    const daysLeft = calculateDaysLeft(member.expiry_date)
    if (daysLeft >= 0) {
      mergeFields.DAYSLEFT = daysLeft
    }
  }

  if (member.discount_expiry) {
    mergeFields.DISCEXP = formatDateForMailchimp(member.discount_expiry)
    const previousLastVolunteered = existingMailchimpMember?.merge_fields?.LASTVOL ?? ''
    mergeFields.LASTVOL = member.last_volunteered ? formatDateForMailchimp(member.last_volunteered) : previousLastVolunteered
    const dDaysLeft = calculateDaysLeft(member.discount_expiry)
    mergeFields.DDAYSLEFT = Math.max(dDaysLeft, 0)
  }

  return {
    email_address: member.email,
    email_hash: hash,
    status_if_new: 'subscribed',
    status,
    merge_fields: mergeFields,
    tags,
    existingTags: existingMailchimpMember?.tags?.map(t => t.name) || []
  }
}

/**
 * Determine tags for a new signup member
 * @param {object} member - Member data
 * @param {object} membership - Membership data
 * @returns {Array<string>} Array of tag names
 */
export function determineSignupTags (member, membership) {
  const tags = ['new_signup']

  // Add provisional tag if not approved
  if (!member.is_approved) {
    tags.push('Provisional')
  }

  // Add concession tag if applicable
  if (member.concession_type) {
    tags.push(String(member.concession_type))
  }

  // Add membership status tag (new signups are always Active)
  tags.push('Active')

  // Add unclaimed first shop tag (new signups haven't shopped yet)
  tags.push('Unclaimed First Shop')

  return tags
}
