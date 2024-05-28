import { Express } from 'express'
import swaggerUi, { JsonObject } from 'swagger-ui-express'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

const swaggerDocs = (app: Express, route: string) => {
  try {
    const apiSpec = yaml.load(
      fs.readFileSync('openapi/schema.yaml', 'utf8')
    ) as JsonObject
    app.use(route, swaggerUi.serve, swaggerUi.setup(apiSpec))
  } catch {
    console.info('Failed to load OpenAPI spec')
  }
}

export default swaggerDocs
