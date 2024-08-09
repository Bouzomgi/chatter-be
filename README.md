Chatter Backend

Prisma Notes

- Look into validation
  https://www.prisma.io/docs/orm/prisma-client/queries/custom-models
- Add a route!

Quickstart: https://www.prisma.io/docs/getting-started/quickstart

To run

- Spin up a local postgres, adminer, and localstack instance using `docker compose up`
- Create the DB tables using `npx prisma db push`
- Seed database using `npx prisma db seed`
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

Need to combine getUserHeads and getChatUserDetails, all users with the threadId as well