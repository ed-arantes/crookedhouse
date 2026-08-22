type PagesContext = {
  request: Request
  env: { ALLOWED_ORIGINS?: string }
  next: () => Promise<Response>
}

const LOCAL_ORIGINS = ['http://localhost:3000', 'http://localhost:8788', 'http://127.0.0.1:3000', 'http://127.0.0.1:8788']

function allowedOrigins(env: PagesContext['env']): Set<string> {
  const configured = env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? []
  return new Set([...LOCAL_ORIGINS, ...configured])
}

export const onRequest = async ({ request, env, next }: PagesContext): Promise<Response> => {
  const origin = request.headers.get('Origin')
  const allowOrigin = origin && allowedOrigins(env).has(origin) ? origin : null

  if (request.method === 'OPTIONS') {
    if (!allowOrigin) return new Response(null, { status: 403 })
    return new Response(null, { status: 204, headers: corsHeaders(allowOrigin) })
  }

  const response = await next()
  if (!allowOrigin) return response

  const withCors = new Response(response.body, response)
  for (const [key, value] of Object.entries(corsHeaders(allowOrigin))) withCors.headers.set(key, value)
  return withCors
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

