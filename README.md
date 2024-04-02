Chatter Backend

Prisma Notes

- Look into validation
  https://www.prisma.io/docs/orm/prisma-client/queries/custom-models
- Add a route!

Quickstart: https://www.prisma.io/docs/getting-started/quickstart

To run

- Spin up a local postgres, adminer, and localstack instance using `docker compose up`
- Create the DB tables using `prisma db push`
- Run the backend using `npm start`

To do

- finish routes
  - get messages
  - send a message
  - "read" a message
- set up swagger
- validations using zod
- maybe use AWS cognito

In the FE, need to make an axios interceptor that moves the JWT cookie to a header in the auth

Add Swagger, zod validations
