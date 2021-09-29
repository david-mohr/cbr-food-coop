# The Food Co-op - Canberra

The Food Co-op membership app

To get this running, you will need:
* NodeJS >= 12
* Docker

## Install the project dependencies
```bash
yarn
```

## Start the test DB
This will launch the database in the background using `docker`
```bash
yarn db
```

The first time after the database is loaded, there are two important steps:
* Manually load the first admin user
* Generate some mock data

These steps are only required ONCE.
```bash
./api/scripts/adduser
yarn mockdata
```

### Start the API
```bash
yarn api
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

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
