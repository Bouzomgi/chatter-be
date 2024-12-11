Chatter Backend

Spin up docker:
> `docker compose --env-file .env up`

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


WEBSOCKET APPROACH:
how do I want to go about this?
i need info in the frontend:
* if there is a new message (existing OR new)

I think that is it. What will this payload look like?

probably like this:
{
  "conversationId": 1,
  "threadId": 1,
  "members": [
    1,
    2
  ],
  message: {
    "messageId": 1,
    "fromUserId": 1,
    "createdAt": "2024-03-15T10:01:00Z",
    "content": "lorem ipsum"
  },
}