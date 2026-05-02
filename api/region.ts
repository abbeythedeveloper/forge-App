export const config = { runtime: 'edge' }

const AFRICAN_COUNTRIES = new Set([
  'NG', 'GH', 'KE', 'ZA', 'TZ', 'UG', 'RW', 'ET', 'CI', 'SN',
  'CM', 'ZM', 'ZW', 'MZ', 'AO', 'EG', 'MA', 'TN', 'DZ', 'LY',
  'SD', 'SL', 'LR', 'GM', 'GN', 'BF', 'ML', 'NE', 'TD', 'BJ',
  'TG', 'MR', 'SO', 'DJ', 'ER', 'MW', 'NA', 'BW', 'LS', 'SZ',
  'GA', 'CG', 'CD', 'CF', 'GQ', 'ST', 'CV', 'KM', 'MG', 'SC',
  'MU', 'RE', 'YT', 'SS', 'BI', 'MZ'
])

export default async function handler(req: Request) {
  try {
    // Get IP from Vercel headers
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '0.0.0.0'

    // Use ip-api.com free tier for geolocation
    const geo = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,country`)
    const data = await geo.json()

    const countryCode = data.countryCode || 'US'
    const country = data.country || 'Unknown'
    const isAfrica = AFRICAN_COUNTRIES.has(countryCode)

    return new Response(JSON.stringify({ countryCode, country, isAfrica }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    // Default to international on error
    return new Response(JSON.stringify({ countryCode: 'US', country: 'Unknown', isAfrica: false }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
