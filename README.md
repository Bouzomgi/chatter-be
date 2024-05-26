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

In the FE, need to make an axios interceptor that moves the JWT cookie to a header in the auth

Routes

overall
  GET /health
    --

authRoutes 
  POST /register
    [body]
      email: String
      username: String
      password: String (min 5)
  POST /login
    [body]
      username: String,
      password: String

settingsRoutes (/authed)
  POST /setAvatar
    [body]
      avatar: String

chatRoutes (/authed)
  update /readThread
    [params]
      threadId: Number
  GET /chatHeads
    --
  GET /messages/:threadId
    [params]
      threadId
  GET /userHeads
    --
  POST /message
    [body]
      members: [Number] (min 2)
      content: String