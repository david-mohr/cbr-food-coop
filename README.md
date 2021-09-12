# CBR Food Coop (cbr-food-coop)

CBR Food Coop membership app

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Start the API
```bash
node server.js
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

# Table

```
CREATE TABLE SIGNUP(
  ID SERIAL PRIMARY KEY  NOT NULL,
  NAME           TEXT    NOT NULL,
  EMAIL          TEXT    NOT NULL,
  PHONE          TEXT    NOT NULL
);
```

## Test DB
```
docker pull postgres
docker run --rm -d --name dev-postgres -e POSTGRES_PASSWORD=Pass2021! -v ${PWD}/test_db/:/var/lib/postgresql/data -p 5432:5432 postgres
export DATABASE_URL='postgres://postgres:Pass2021!@localhost:5432/postgres'
```

* Disable ssl when in dev mode


# Deploy to Heroku (main)
```
git push heroku main
```

## Deploy to Heroku (branch)
```
git push heroku bravo-1:main
```
