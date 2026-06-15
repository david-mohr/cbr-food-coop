-- Member data export for Mailchimp
-- Parameter: lookback_days - how far back to check for volunteer activity
-- Usage: 
--   Initial sync: lookback_days = 18250 (50 years)
--   Daily sync: lookback_days = 1
--   Weekly sync: lookback_days = 7

WITH recent_actions AS (
  SELECT 
    member,
    datenew,
    action
  FROM members_history
  WHERE 
    datenew > CURRENT_TIMESTAMP - INTERVAL ':lookback_days days'
), 

volunteer_last_date AS (
  SELECT 
    member,
    MAX(datenew) as last_volunteer_date
  FROM recent_actions   
  WHERE action = 'Volunteered'
  GROUP BY member
),

-- this can be used to find first join date if needed
-- only valid for new members - existing members should have join date already recorded.
earliest_action AS (
  SELECT 
    member,
    MIN(datenew) as first_action_date
  FROM recent_actions
  WHERE action = 'Applied' OR action = 'Registered' or action = 'Approved'
  GROUP BY member
)

SELECT 
  LOWER(TRIM(c.email)) AS "email",
  c.firstname AS "firstname",
  c.lastname AS "lastname",
  c.city AS "suburb",
  COALESCE(c.phone, c.phone2) AS "phone",
  
  -- Membership data
  mt.label AS "membership_type",
  m.concession AS "concession_type",
  m.expires AS "expiry_date",
  m.discvaliduntil AS "discount_expiry",
  CASE
    WHEN m.discvaliduntil IS NULL THEN 'Non-Working Member'
    WHEN m.discvaliduntil > CURRENT_TIMESTAMP THEN 'Discount Active'
    ELSE 'Discount Expired' 
  END AS "discount_status",
  CASE 
    WHEN m.expires IS NULL THEN 'Unknown'
    WHEN m.expires > CURRENT_TIMESTAMP THEN 'Active'
    ELSE 'Expired'
  END AS "membership_status",
  COALESCE(m.first_shop, true) AS "claimed_first_shop",
  ea.first_action_date AS "first_action_date",
  
  -- Volunteer data
  vl.last_volunteer_date AS "last_volunteered",

  -- Status flags
  CASE WHEN auth.email IS NOT NULL THEN true ELSE false END AS "has_coordinator_account",
  c.approved AS "is_approved"
  
FROM customers c
LEFT JOIN memberships m ON c.membership_id = m.membership_id
LEFT JOIN membership_types mt ON m.membership_type_id = mt.membership_type_id
LEFT JOIN members_extra me ON c.id = me.id
LEFT JOIN auth ON LOWER(TRIM(auth.email)) = LOWER(TRIM(c.email))
LEFT JOIN volunteer_last_date vl ON c.id = vl.member
LEFT JOIN earliest_action ea ON c.id = ea.member
WHERE 
  c.email IS NOT NULL 
  AND c.email != '' 
  AND c.email LIKE '%@%'
  AND COALESCE(me.sendemails, true) = true
  AND m.expires IS NOT NULL

ORDER BY m.expires DESC
LIMIT :max_list_size;