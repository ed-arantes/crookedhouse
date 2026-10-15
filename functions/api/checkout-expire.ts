import { handlePaymentExpirationRequest, type ExpirationEnv } from '../_lib/payment-expiration'

type PagesContext = {
 request: Request
 env: ExpirationEnv
}

export const onRequestPost = ({ request, env }: PagesContext): Promise<Response> =>
 handlePaymentExpirationRequest(request, env)
