import { SITE_IMAGE, SITE_NAME, SITE_ORIGIN } from '@/lib/seo'

const lodgingStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': `${SITE_ORIGIN}/#lodging`,
  name: SITE_NAME,
  url: SITE_ORIGIN,
  image: `${SITE_ORIGIN}${SITE_IMAGE}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Via Dante Alighieri 2, Frazione Naggio',
    addressLocality: 'Grandola ed Uniti',
    addressRegion: 'Como',
    postalCode: '22010',
    addressCountry: 'IT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 46.0411577,
    longitude: 9.201808,
  },
}

export function LodgingStructuredData() {
  const jsonLd = JSON.stringify(lodgingStructuredData).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  )
}
