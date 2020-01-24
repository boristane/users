# users

The module managing users

## Env Variables

**Make sure the `.env` file is used in test only.**

| Variable               | Description                            |
|------------------------|----------------------------------------|
| ENV                    | dev or prod                            |
| DB_HOST                | The database host                      |
| DB_USER                | The databse username                   |
| DB_PASS                | The database password                  |
| DB_PORT                | The database password                  |
| DB_NAME                | The database name                      |
| JWT_USERS_KEY          | The key to sign users json web tokens  |
| JWT_ADMINS_KEY         | The key to sign admins json web tokens |
| USERS_SNS_TOPIC_ARN    | The sns to send all users events       |
| SNS_REGION             | The sns region                         |
| SNS_ENDPOINT           | The sns endpoint (for local dev)       |
| FORGOTTEN_PASSWORD_URL | The url to redirect to reset password  |

## Running Locally

```bash
make local
```

It starts the server an listen to port `8080`.

## Testing

Make sure there are no other `mysql` and `localstack` containers running on the machine to avoid port or name conflict.

```bash
make test
```

## Debugging

Debugging is set-up for VS-Code. Simply select the desired option from the debugging drop down.

`Current TS File`: Run the current TS file with the debugger attached.
`Jest Current TS File`: Run the current test file with jest and the debugger attached.

## Deploying

There are two options to deploy this service.

* Boot up the container in a server instance
* Run the server on an AWS lambda

```bash
npm run deploy:dev
```

## Functionality

### Users

The `/users` router manages all intercations with the users (login, signup, etc...).

| Method | Urls                     | Auth   | Description                       |
|--------|--------------------------|--------|-----------------------------------|
| GET    | `/`                      | Admins | Get all the users in the database |
| GET    | `/me/all`                | User   | Get their current properties      |
| GET    | `/activate/:token`       | None   | Activate a user                   |
| POST   | `/password-token`        | None   | Send a password reset token       |
| GET    | `/password-token/:token` | None   | Activate a reset password token   |
| POST   | `/reset-password`        | None   | Reset a users password            |
| POST   | `/signup`                | None   | Sign a user up                    |
| POST   | `/login`                 | None   | Logs a user in                    |
| GET    | `/:id`                   | Admins | Get a user                        |
| PATCH  | `/:id`                   | User   | Edit a user                       |
| DELETE | `/:id`                   | Admins | Delete a user                     |

### Admins

The `/admins` router manages all interactions with the admins (create, login, etc...)

| Method | Urls     | Auth   | Description                        |
|--------|----------|--------|------------------------------------|
| GET    | `/`      | Admins | Get all the admins in the database |
| POST   | `/`      | Admins | Create an admin                    |
| POST   | `/login` | None   | Log an admin in                    |
| DELETE | `/:id`   | Admins | Delete an admin                    |

### API Services

The `/api-services` router manages creation and editing of API services that can connect with this service

| Method | Urls   | Auth   | Description                           |
|--------|--------|--------|---------------------------------------|
| GET    | `/`    | Admins | Get all the api services              |
| POST   | `/`    | Admins | Create an API Service                 |
| PATCH  | `/:id` | Admins | Activate / De-activate an api service |

### Internal

The `/internal` router manages the resources that are accessible from other services

| Method | Urls                 | Auth | Description            |
|--------|----------------------|------|------------------------|
| GET    | `/users/:uuid`       | Apis | Check if a user exists |
| POST   | `/users/email/:uuid` | Apis | Get a users email      |

## API Service password

To create an APIService password run the following:

```bash
echo -n <password> | sha256sum
```
