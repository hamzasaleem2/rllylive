import { httpRouter } from 'convex/server'
import { betterAuthComponent } from './auth'
import { createAuth } from '@workspace/auth'

const http = httpRouter()

betterAuthComponent.registerRoutes(http, (ctx) => createAuth(ctx, betterAuthComponent))

export default http