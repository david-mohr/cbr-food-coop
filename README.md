# The Food Co-op - Canberra

The Food Co-op membership app

To get this running, you will need:
* NodeJS >= 20
* Docker

## Setup
A series of one-time-only steps to get everything ready for development

### Install the project dependencies
```bash
yarn
```
### Make sure Docker is running
On MacOS this requires running the docker desktop app

On Linux run the command
```
systemctl status docker
```

### Prepare the test DB
This will launch the database in the background using `docker`
```bash
yarn db
```

The first time after the database is loaded, there are two important steps:
* Generate some mock data 
* Manually load the first admin user (see below)


```bash
yarn mockdata
```
### Generate Secret
We need a real token secret for production but for development purposes we can use a mock one.

```bash
echo TOKEN_SECRET=abcd1234abcd1234 >> .env
```

### Sign up for a mailgun account

Go to https://www.mailgun.com/ and sign up for a free account

Verify your email address (you'll also need to give a mobile phone number so they can authenticate you) and see if you can send a test email using a curl command - this will use the provided sandbox domain, you don't need to set up a domain at this stage.

Set up a template (Sending->Templates) called 'invite' (you can use the 'action' pre-fab template)

Test this with a curl command also if you want

Look at the test curl code and find the key and domain then add these two your .env file

```bash
echo MAILGUN_API_KEY=api-key-from-your-mailgun-account >> .env
echo MAILGUN_DOMAIN=sandbox-domain-from-your-mailgun-account >> .env
```

### Generate an admin account
#### 1. Use the script to create a new user
```bash
yarn adduser
``` 
Make sure you choose 'admin' for the type of user

#### 2. Launch the api
```bash
yarn api
```

#### 3. Start the web app in development mode 
```bash
quasar dev
```
This will get a server up and running at http://localhost:8080

#### 4. Have a look at the ```invites``` table by running 
```bash
yarn db:shell
select * from invites;
\q
```
Copy the token next to the email address you entered into the clipboard

#### 5. Open up a browser tap and put in the following url

http://localhost:8080/accept-invite/78a6618bcbd0b523fa7a64386f31a49c

Where 78a66... is the token you copied from the ```invites``` table.

Fill out the name and password in the form and the invite should be accepted.

You're now ready to start development!

## Development
### Launch the test DB
If you already started the database during setup, you don't need to run it
again. This will launch in the background
```bash
# make sure docker is running (see above) then...
yarn db
```

### Start the API
This will stay running in your terminal and print HTTP logs
```bash
yarn api
```

### Start the web app in development mode
This will stay running in your terminal and continually rebuild the web app
each time you save changes
```bash
quasar dev
```

### Code!
Changes to the web app (`/src`) will be auto compiled and hot-reloaded into the
browser.

Changes to any API code (`/api`) will automatically detected and the API will
be restarted

# Deploy to Heroku (main)
```bash
git push heroku main
```

## Deploy to Heroku (branch)
```bash
git push heroku bravo-1:main
```


# Mailchimp Integration

## Overview

The Mailchimp integration keeps the mailing list in sync with the membership database. It handles two scenarios:

- **New member signup** — when a coordinator approves a signup, the new member is immediately added to the Mailchimp list with their membership details and relevant tags
- **Ongoing sync** — a scheduled script reconciles the full membership database against Mailchimp, updating merge fields and tags, archiving lapsed members and members who unsubscribe, and re-subscribing returning members

### Merge fields synced
`FNAME`, `LNAME`, `PHONE`, `SUBURB`, `MTYPE` (membership type), `CONCESSION`, `EXPIRY`, `DAYSLEFT`, `DISCEXP` (discount expiry), `JOINED`, `LASTVOL` (last volunteered)

### Tags applied automatically
`Expiring Today`, `Expiring This Week`, `Expiring This Month`, `Expired`, `Recently Expired`, `Working Member`, `Coordinator`, `Provisional`, `Unclaimed First Shop`, concession type, discount status

## Welcome Email via Mailchimp Event API

Welcome email is sent via a MailChimp Flow, triggered by posting the member's email address to:

https://us4.api.mailchimp.com/3.0/customer-journeys/journeys/2032/steps/13820/actions/trigger

## Scheduled Sync (Heroku Scheduler)

The sync runs daily via [Heroku Scheduler](https://devcenter.heroku.com/articles/scheduler).

### First-time setup

1. Add the Heroku Scheduler add-on:
   ```bash
   heroku addons:create scheduler:standard -a cbrfoodcoop
   ```

2. Open the scheduler dashboard:
   ```bash
   heroku addons:open scheduler -a cbrfoodcoop
   ```

3. Add a new job with:
   - **Command:** `node api/scripts/syncmailchimp.mjs`
   - **Frequency:** Every day
   - **Time:** ~Midnight AEST

### Running the sync manually

Against production:
```bash
yarn sync-mailchimp:prod
```

Against local DB (for testing):
```bash
yarn sync-mailchimp
```

### Environment variables required

| Variable | Description |
|---|---|
| `MAILCHIMP_API_KEY` | Mailchimp API key |
| `MAILCHIMP_SERVER_PREFIX` | e.g. `us4` |
| `MAILCHIMP_LIST_ID` | The audience/list ID |
| `MAILCHIMP_MAX_LIST_SIZE` | Max members to sync (default: 2000, mailchimp membership tier increases at 2500) |
| `LOOKBACK_DAYS` | How many days back to look for changes (default: 7, use `18250` for full history) |
# Roadmap

## Stage 1
[x] Replicate OpenBravo membership functions 
[x] Replicate silicon reporting (approval sheets, mailchimp)

## Stage 2
[~] Member signup using online form
[x] Expand reporting features

## Stage 3
[ ] Open platform to member logins
[~] Integration with Vend

## Stage 4
* Ambitious new stuff

# SQL Helper scripts
Count the number of active members
```
yarn cloud-sql sql/current-member-count.sql
```
