CREATE TABLE IF NOT EXISTS signup (
  id SERIAL PRIMARY KEY  NOT NULL,
  firstname varchar(255),
  lastname varchar(255),
  postcode varchar(255),
  suburb varchar(255),
  email varchar(255),
  phone varchar(255),
  membership_type_id int NOT NULL REFERENCES membership_types,
  concession varchar(255),
  sendemails boolean NOT NULL DEFAULT true,
  vendid varchar(255)
);

CREATE TABLE IF NOT EXISTS membership_types (
  membership_type_id SERIAL PRIMARY KEY NOT NULL,
  label varchar(255) NOT NULL,
  price decimal,
  concession decimal,
  concession_caption varchar(255)
);

INSERT INTO membership_types (membership_type_id, label, price, concession, concession_caption) VALUES
  (1, 'Single', 25, 15, NULL),
  (2, 'Couple', 40, 25, 'Where both people hold a concession'),
  (3, 'Household', 50, 40, 'Majority concession holders')
  ON CONFLICT (membership_type_id) DO NOTHING;;

CREATE TABLE IF NOT EXISTS customers (
    id varchar(255) PRIMARY KEY NOT NULL,
    name varchar(255) NOT NULL,
    maxdebt decimal NOT NULL DEFAULT '0',
    address varchar(255),
    address2 varchar(255),
    postal varchar(255),
    city varchar(255),
    country varchar(255),
    firstname varchar(255),
    lastname varchar(255),
    email varchar(255),
    phone varchar(255),
    phone2 varchar(255),
    notes varchar(255),
    curdate timestamp with time zone,
    curdebt decimal,
    visible boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS members_extra (
    id varchar(255) NOT NULL,
    discvaliduntil timestamp with time zone,
    anuaffiliation varchar(255),
    incomelevel varchar(255),
    sendemails boolean NOT NULL DEFAULT true,
    membershipexpires timestamp with time zone,
    hadfirstshop boolean NOT NULL DEFAULT false,
    hadfreelunch boolean NOT NULL DEFAULT false,
    discountstatus varchar(255),
    discountrate decimal NOT NULL DEFAULT 20,
    isapproved boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id),
    CONSTRAINT members_extras_id FOREIGN KEY (id) REFERENCES customers (id)
);

CREATE TABLE IF NOT EXISTS members_history (
    id varchar(255) NOT NULL,
    datenew timestamp with time zone NOT NULL,
    member varchar(255) NOT NULL,
    action varchar(255),
    amountpaid decimal,
    notes varchar(255),
    PRIMARY KEY (id),
    CONSTRAINT member_history_customer FOREIGN KEY (member) REFERENCES customers (id)
);

CREATE TABLE IF NOT EXISTS auth (
    id SERIAL PRIMARY KEY NOT NULL,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    salt varchar(32) NOT NULL,
    role varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS invites (
    id SERIAL PRIMARY KEY NOT NULL,
    email varchar(255) NOT NULL,
    role varchar(255) NOT NULL,
    token varchar(255) NOT NULL,
    accepted boolean NOT NULL DEFAULT false
);
