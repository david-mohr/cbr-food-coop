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
  AND (m.expires <= CURRENT_TIMESTAMP and m.expires > (CURRENT_TIMESTAMP - '3 months'::interval))
  AND COALESCE(me.sendemails, true) = true

ORDER BY "Email Address";