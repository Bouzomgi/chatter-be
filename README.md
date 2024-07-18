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

To Do

Immediate
  - write some integration tests
  - Pop over to the FE and tie it together!

Later
  - set up swagger
  - maybe use AWS cognito

! I can use the integration tests both locally and on AWS !

Need something that will validate the openapi schema

Add the username and avatar separately to userhead and messages


i need map of userId -> username + avatar