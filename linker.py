import requests
import json
from sqlalchemy import create_engine
import pandas as pd
import os


# Pull customers from vend
url = "https://thefoodcooperativeshop.vendhq.com/api/2.0/customers"
headers = {'authorization': "Bearer " + os.environ.get('VEND_API_KEY')}
querystring = {"page_size":"4000"}
response = requests.request("GET", url, headers=headers, params=querystring)
j_vend_customers = json.loads(response.text)["data"]
vend_customers = pd.DataFrame(j_vend_customers)
vend_customers['email'] = vend_customers['email'].lower()


# pull sql data. note that this url is slightly different.
engine = create_engine('postgresql://postgres:Pass2021!@localhost:5432/postgres')
connection = engine.connect()
members = pd.read_sql("SELECT id, name, lower(firstname) AS first_name, lower(lastname) AS last_name, lower(email) AS email, membershipexpires \
     FROM customers NATURAL JOIN members_extra", connection)

'''
Matching is done very simply - exact matches in at least one of email, pasted ID,
or first and last name, allowing for group memberships split by `/` (or sharing email or ID)
to be matched to multiple vend accounts.
'''

# treating email as a primary key, sort so that when we remove duplicates, the most up-to-date 
# membership is kept.
members.sort_values("membershipexpires", inplace=True)
unique_members = members.drop_duplicates(subset="email").set_index("email")

# match on matching emails.
matching_emails = vend_customers.join(unique_members, on="email", lsuffix="_vend", rsuffix="_pos")
matching_emails = matching_emails[["id_vend","id_pos"]].drop_duplicates()

# match on matching pos ids.
matching_ids = vend_customers.merge(members, 
    left_on="customer_code",
    right_on="id",
    how = 'inner', 
    suffixes=("_vend", "_pos"))[["id_vend","id_pos"]]

# Split multi-person memberships, then match by name.
members["first_name"] = members["first_name"].map(lambda x : x.split("/"))
members["last_name"] = members["last_name"].map(lambda x : x.split("/")) 
unique_fnames = members.explode("first_name") 
unique_members = unique_fnames.explode("last_name")

matching_names = vend_customers.merge(unique_members, 
    left_on=["first_name", "last_name"],
    right_on=["first_name", "last_name"],
    how = 'inner', 
    suffixes=("_vend", "_pos"))[["id_vend","id_pos"]]

out = pd.concat([matching_emails, matching_ids, matching_names], verify_integrity=True, ignore_index=True).dropna()

# May want to also verify integrity on each if the individual columns 
# (there may simply be repeated customers) but note that this also includes
# Joint accounts. 
unmatched_vend = pd.concat([vend_customers["id"], out["id_vend"].drop_duplicates()])\
    .drop_duplicates(keep = False)

# Only count unmatched POS members that have active memberships, or memberships that 
# have expired in the past 12 months, other (former) members will be ignored.
# this could be moved to the top to just remove them, but that is probably unnecessary.
members = members[pd.to_datetime(
    members.membershipexpires).dt.tz_localize(None) > (pd.Timestamp.today() - pd.to_timedelta(365, unit = 'D'))]

unmatched_pos = pd.concat([members["id"], out["id_pos"].drop_duplicates()])\
    .drop_duplicates(keep=False)

print("there are " + str(unmatched_vend.size) + " of " + str(vend_customers.shape[0]) + " unmatched vend profiles, and")
print( str(unmatched_pos.size) + " of " + str(members.shape[0]) + " unmatched profiles from the old POS")

# add "vend_accounts" table to sql with columns "id_pos" and "id_vend" - may be worth changing 
# "id_pos" to just "id" so it matches the other tables in the db.
## Deletes table, change to 
out.to_sql("vend_accounts",connection,if_exists="append")
connection.drop()

# this last part not tested, pushing back to vend.
dict = out.to_dict('records')
url = "https://thefoodcooperativeshop.vendhq.com/api/2.0/customers/"
for r in dict:
    headers = {}
    # probably should be changed to "customer code" for actual use.
    payload = "custom_field_4=" + r["id_pos"]
    headers = {
    'content-type': "application/x-www-form-urlencoded",
    'authorization': "Bearer " + os.environ.get('VEND_API_KEY')
    }
    response = requests.request("PUT", url+r['id_vend'], data=update)