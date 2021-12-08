# The Food Co-op - Canberra

The Food Co-op membership app

To get this running, you will need:
* NodeJS >= 16
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
* Manually load the first admin user


```bash
yarn mockdata
yarn adduser
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
Run ```yarn adduser``` which will send an invite to the email address you create.
Make sure you choose 'admin' for the first user.

Have a look at the ```invites``` table by running 
```bash
yarn db:shell
select * from invites;
\q
```

Copy the token from the email address you entered and browse to

http://localhost:8080/#/accept-invite/78a6618bcbd0b523fa7a64386f31a49c

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

# Roadmap

## Stage 1
* Replicate OpenBravo membership functions
* Replicate silicon reporting (approval sheets, mailchimp)

## Stage 2
* Member signup using online form
* Expand reporting features

## Stage 3
* Open platform to member logins
* Integration with Vend

## Stage 4
* Ambitious new stuff
