import { httpRouter } from 'convex/server'
import { betterAuthComponent } from './auth'
import { createAuth } from './auth/config'

const http = httpRouter()

betterAuthComponent.registerRoutes(http, (ctx) => createAuth(ctx, betterAuthComponent))

export default http