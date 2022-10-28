select count(*) from customers
  left join memberships on customers.membership_id = memberships.membership_id
where
  expires > now()
