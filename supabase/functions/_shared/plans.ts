export interface Plan {
  stripePriceId: string
  monthlyBookLimit: number
  name: string
  priceEurCents: number
}

export const PLANS: Record<string, Plan> = {
  plus: {
    stripePriceId: Deno.env.get('STRIPE_SUBSCRIPTION_PRICE_ID') ?? '',
    monthlyBookLimit: 25,
    name: 'Fableya Plus',
    priceEurCents: 1500,
  },
}

export function getPlanByPriceId(priceId: string): Plan | null {
  return Object.values(PLANS).find(p => p.stripePriceId === priceId) ?? null
}
