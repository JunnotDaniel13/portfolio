import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'
import { applySecurityHeaders } from '~/server/http'
import { assertRuntimeConfigOnce } from '~/server/runtime'

const securityMiddleware = createMiddleware({ type: 'request' }).server(async ({ next, request }) => {
  assertRuntimeConfigOnce()
  const result = await next()
  applySecurityHeaders(request, result.response)
  return result
})

export const startInstance = createStart(() => ({
  requestMiddleware: [
    securityMiddleware,
    createCsrfMiddleware({ filter: (context) => context.handlerType === 'serverFn' }),
  ],
}))
