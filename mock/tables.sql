CREATE TABLE IF NOT EXISTS signup (
  id SERIAL PRIMARY KEY  NOT NULL,
  firstname varchar(255),
  lastname varchar(255),
  address varchar(255),
  postal varchar(255),
  city varchar(255),
  email varchar(255),
  phone varchar(255),
  anuaffiliation varchar(255),
  incomelevel varchar(255),
  sendemails boolean NOT NULL DEFAULT true,
);

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
    id SERIAL NOT NULL,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    salt varchar(32) NOT NULL,
    role varchar(255) NOT NULL,
    PRIMARY KEY (id)
);
