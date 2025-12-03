-- SQL script to export current and prospective members for Mailchimp import
-- Formats output as CSV with columns: Email Address, First Name, Last Name, Address, Phone Number

-- Current members (customers with active memberships)
SELECT 
  c.email AS "Email Address",
  c.firstname AS "First Name", 
  c.lastname AS "Last Name",
  null AS "Address",
  c.phone AS "Phone Number"
FROM customers c
LEFT JOIN memberships m ON c.membership_id = m.membership_id
LEFT JOIN members_extra me ON c.id = me.id
WHERE 
  c.email IS NOT NULL 
  AND c.email != '' and c.email LIKE '%@%'
  AND (m.expires IS NULL OR m.expires > CURRENT_TIMESTAMP)
  AND COALESCE(me.sendemails, true) = true

UNION

-- Prospective members (signup_members)
SELECT 
  sm.email AS "Email Address",
  sm.firstname AS "First Name",
  sm.lastname AS "Last Name", 
  null AS "Address",
  sm.phone AS "Phone Number"
FROM signup_members sm
WHERE 
  sm.email IS NOT NULL 
  AND sm.email != '' and sm.email LIKE '%@%'
  AND COALESCE(sm.sendemails, true) = true

ORDER BY "Email Address";
