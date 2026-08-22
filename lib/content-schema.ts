export const CONTENT_SECTIONS = [
  { label: 'Navigazione', keys: ['nav.apartment', 'nav.gallery', 'nav.amenities', 'nav.reviews', 'nav.location', 'nav.book', 'nav.login', 'nav.surname', 'nav.email', 'nav.loginButton'] },
  { label: 'Hero', keys: ['hero.badge', 'hero.title', 'hero.description'] },
  { label: 'Appartamento', keys: ['about.headline', 'about.p1', 'about.p2'] },
  { label: 'Layout', keys: ['gallery.headline', 'gallery.body'] },
  { label: 'Galleria', keys: ['stay.headline'] },
  { label: 'Servizi', keys: ['services.headline', 'services.body'] },
  { label: 'Comodità', keys: ['amenities.headline', 'amenities.body', 'amenities.list'] },
  { label: 'Esplora il territorio', keys: ['explore.headline', 'explore.body'] },
  { label: 'Recensioni', keys: ['reviews.headline', 'reviews.count'] },
  { label: 'Posizione', keys: ['location.headline', 'location.address', 'location.gettingAround', 'location.nearby.lakefront', 'location.nearby.lakefrontDetail', 'location.nearby.villa', 'location.nearby.villaDetail', 'location.nearby.airport', 'location.nearby.airportDetail'] },
  { label: 'Prenotazione', keys: ['booking.headline', 'booking.firstName', 'booking.lastName', 'booking.email', 'booking.dates', 'booking.guests', 'booking.message', 'booking.messagePlaceholder', 'booking.proceedToPayment', 'booking.processingPayment', 'booking.checkIn', 'booking.checkOut', 'booking.selectDates', 'booking.detailsTitle', 'booking.location'] },
  { label: 'Ricerca e calendario', keys: ['widgets.where', 'widgets.location', 'widgets.locationPlaceholder', 'widgets.checkIn', 'widgets.checkOut', 'widgets.guests', 'widgets.guestLabel', 'widgets.guestLabels', 'widgets.addDate', 'widgets.addGuests', 'widgets.reserve', 'widgets.enterDates', 'widgets.adults', 'widgets.adultsHint', 'widgets.children', 'widgets.childrenHint', 'widgets.pets', 'widgets.maxGuests', 'widgets.night', 'widgets.nights', 'widgets.councilTax', 'widgets.total', 'widgets.previousMonth', 'widgets.nextMonth'] },
  { label: 'Footer', keys: ['footer.explore', 'footer.contact', 'footer.privacy', 'footer.terms', 'footer.allRights', 'footer.description'] },
] as const

export const REQUIRED_CONTENT_KEYS = CONTENT_SECTIONS.flatMap((section) => [...section.keys])
export const ARRAY_CONTENT_KEYS = new Set<string>(['amenities.list'])

