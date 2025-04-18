Chatter Backend

Spin up surrounds:
> `docker compose -f docker-compose.surrounds.yaml --env-file .env.docker up`

Spin up server and surrounds:
> `docker compose -f docker-compose.surrounds.yaml -f docker-compose.yaml --env-file .env.docker up`

# FIX
Run chatter-be image locally
> `docker build -t chatter-be .`
> `docker run -p 80:80 --env-file .env chatter-be`

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

TESTING TODOS: 
* add onMessage websocket test in userFlow
* check coverage
* figure out how i will do the test with failing prisma guy
  * I think i will have to do dependency injection
* add prod seeding
* add service tests (need a new url envvar)
* targets for extensions 
  * adding auth token for supertests
  * custom prisma queries
* clean up imports file headers
* clean up package.json imports

* how do acceptance tests in CICD?
* right now the seeding is also gonna reset, this is bad for prod


Plan forward:
- make sure i can seed from local to aws
- make sure i can call acceptance tests from local to aws
- fix the stupid GHA
  - acceptance tests
  - unit tests
  - integration tests (w/ docker)


LEARNINGS: 
When you use aliases, it can make imports load multiple times. aka if i import the same file into two different files, the original file should load once. but if i use aliases and refer to that file differently with those aliases, it make load twice. 