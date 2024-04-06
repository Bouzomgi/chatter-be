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

Immediate
  - finish BE tests
    - get them working in CICD
  - I would like to set up zod or express validator
  - Write some integration tests?
  - Pop over to the FE and tie it together!
Later
  - set up swagger
  - maybe use AWS cognito

In the FE, need to make an axios interceptor that moves the JWT cookie to a header in the auth

Add Swagger, zod validations
