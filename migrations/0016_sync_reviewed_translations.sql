-- Synchronize reviewed locale corrections against the latest remote D1 export.
-- 365 locale entries changed or added.

INSERT INTO translations (locale, key, value) VALUES
  ('it', 'about.p3', '**4 ospiti · 1 letto + 1 divano letto matrimoniale · Giardino privato · Animali ammessi · Non fumatori**'),
  ('it', 'amenities.list', '["Forno","Lavastoviglie","Microonde","Macchine da caffè per espresso, moka e caffè americano","Tostapane","Bollitore","TV con accesso ai tuoi servizi di streaming preferiti","Wi-Fi gratuito","Armadio e cassettiera","Culla gratuita (120 × 60 cm), su richiesta","Biancheria da letto e da bagno inclusa","Asciugacapelli","Ferro da stiro","Giardino privato con tavolo e ombrellone","Locale con lavatrice, asciugatrice e lavatoio con acqua calda","Garage privato gratuito, per auto di piccole o medie dimensioni"]'),
  ('it', 'location.address', 'Via Dante Alighieri 2, Frazione Naggio, Grandola ed Uniti, Como, 22010'),
  ('it', 'location.nearby.airportDetail', '76 km'),
  ('it', 'location.nearby.lakefrontDetail', '18 min in macchina'),
  ('it', 'location.nearby.malpensa', 'Aeroporto Malpensa'),
  ('it', 'location.nearby.malpensaDetail', '87 km'),
  ('it', 'reviews.headline', 'Giudicato eccellente dagli ospiti'),
  ('it', 'services.body', 'Ogni soggiorno è pensato per offrirti comfort, ospitalità e il piacere di sentirti a casa.

Per chi viaggia in moto, è disponibile un parcheggio dedicato all''interno della struttura.

Su richiesta, Mara sarà felice di preparare colazioni e pasti fatti con cura, trasformando ingredienti semplici in piacevoli momenti da condividere e gustare.

La sua esperienza è arricchita dalla qualifica di pasticcere conseguita presso l’Accademia Italiana di Milano, dalla certificazione S.A.B. e dalla formazione H.A.C.C.P. della Regione Lombardia.

Tutte le informazioni per usufruire del servizio sono disponibili direttamente in loco.'),
  ('it', 'servicesPage.sectionBodies', '["Su richiesta, offriamo un servizio di colazione e cena pensato per rendere il tuo soggiorno ancora più piacevole. Potrai iniziare la giornata con una gustosa colazione e concederti momenti di relax gustando piatti preparati con cura, in un’atmosfera accogliente e familiare.\n\nOffriamo inoltre un servizio di pranzo al sacco, ideale per accompagnarti durante le tue gite e le tue escursioni.\n\nI costi dei servizi sono disponibili direttamente presso la struttura.","La nostra struttura si impegna a garantire elevati standard di qualità, sicurezza e sostenibilità, attraverso il rispetto delle normative vigenti e l’attenzione costante ai dettagli. Le certificazioni ottenute testimoniano la nostra dedizione a offrire un servizio affidabile e un’esperienza di soggiorno all’insegna della qualità."]'),
  ('en', 'about.headline', 'A characterful home in the heart of Lake Como'),
  ('en', 'about.p1', 'A small retreat in the mountains, just a few steps from the wonders of Lake Como.'),
  ('en', 'about.p2', 'In the historic heart of **Naggio**, a picturesque hamlet of Grandola ed Uniti, time seems to pass more slowly. Among ancient stone houses, the quiet of the mountains and enchanting views over the waters of **Lake Como and Lake Lugano**, every moment invites you to pause, breathe and be captivated by the beauty of the landscape.'),
  ('en', 'about.p3', '**4 Guests · 1 Bed + 1 Double Sofa Bed · Private Garden · Pets Allowed · Non-Smoking**'),
  ('en', 'amenities.body', '**Crooked House** has everything you need to make your stay pleasant, comfortable and worry-free.'),
  ('en', 'booking.checkIn', 'Arrival'),
  ('en', 'booking.dates', 'Dates'),
  ('en', 'booking.detailsTitle', 'Crooked House'),
  ('en', 'booking.email', 'Email'),
  ('en', 'booking.firstName', 'First name'),
  ('en', 'booking.lastName', 'Last name'),
  ('en', 'booking.location', 'Grandola ed Uniti · Lake Como'),
  ('en', 'booking.proceedToPayment', 'Continue to payment'),
  ('en', 'booking.processingPayment', 'Processing payment…'),
  ('en', 'booking.selectDates', 'Select dates'),
  ('en', 'explore.body', '**Crooked House** is an ideal base for discovering Lake Como and its mountains, offering a blend of **relaxation, nature, sport and culture.** Its location makes it easy to reach picturesque destinations such as **Menaggio, Tremezzina, Varenna and Bellagio,** as well as numerous hiking trails, walking routes and e-bike routes. You can also extend your trip to **Lugano,** in Switzerland.'),
  ('en', 'explore.headline', 'Explore the area'),
  ('en', 'footer.contact', 'Contact'),
  ('en', 'footer.description', 'A distinctive one-bedroom apartment in Grandola ed Uniti, above Menaggio on Lake Como.'),
  ('en', 'footer.privacy', 'Privacy'),
  ('en', 'gallery.body', '**Crooked House** is a one-bedroom apartment, carefully restored and furnished to offer a stay defined by comfort, beauty and simplicity. You’ll have all the space and privacy you need: **a private entrance, a cosy living room, a fully equipped kitchen and a private garden** nestled in tranquillity and framed by the mountains.'),
  ('en', 'gallery.headline', 'Every corner carefully considered'),
  ('en', 'hero.badge', '{score} · {count} {countLabel} · Grandola ed Uniti, Lake Como'),
  ('en', 'hero.description', 'A stay out of the ordinary in a home with a unique character, designed for those who love to experience something truly special.'),
  ('en', 'location.address', 'Via Dante Alighieri 2, Naggio, Grandola ed Uniti, Como, 22010'),
  ('en', 'location.gettingAround', 'Getting around'),
  ('en', 'location.nearby.airport', 'Orio al Serio Airport'),
  ('en', 'location.nearby.airportDetail', '76 km away'),
  ('en', 'location.nearby.lakefront', 'Menaggio lakefront'),
  ('en', 'location.nearby.lakefrontDetail', '18 min drive')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('en', 'location.nearby.malpensa', 'Malpensa Airport'),
  ('en', 'location.nearby.malpensaDetail', '87 km away'),
  ('en', 'nav.book', 'Book'),
  ('en', 'nav.email', 'Email'),
  ('en', 'nav.location', 'Location'),
  ('en', 'nav.login', 'Log in'),
  ('en', 'nav.loginButton', 'Log in'),
  ('en', 'nav.reviews', 'Reviews'),
  ('en', 'nav.surname', 'Last name'),
  ('en', 'reviews.headline', 'Rated exceptional by every guest'),
  ('en', 'services.body', 'Every stay is designed to offer comfort, hospitality and the pleasure of feeling at home.

For guests travelling by motorcycle, dedicated parking is available nearby.

On request, Mara will be happy to prepare breakfasts and meals with care, turning simple ingredients into enjoyable moments to share and savour.

Her experience is complemented by a qualification as a pastry chef from the Accademia Italiana in Milan, S.A.B. certification and H.A.C.C.P. training from the Lombardy Region.

All the information you need about this service is available at the property.'),
  ('en', 'services.headline', 'Services and thoughtful touches'),
  ('en', 'widgets.addDate', 'Add a date'),
  ('en', 'widgets.addGuests', 'Add guests'),
  ('en', 'widgets.adults', 'Adults'),
  ('en', 'widgets.adultsHint', 'Ages 13 and up'),
  ('en', 'widgets.animal', 'pet'),
  ('en', 'widgets.animals', 'pets'),
  ('en', 'widgets.booking', 'booking'),
  ('en', 'widgets.bookings', 'bookings'),
  ('en', 'widgets.checkIn', 'Check-in'),
  ('en', 'widgets.checkOut', 'Check-out'),
  ('en', 'widgets.children', 'Children'),
  ('en', 'widgets.childrenHint', 'Ages 2–12'),
  ('en', 'widgets.councilTax', 'Tourist tax'),
  ('en', 'widgets.enterDates', 'Enter your dates.'),
  ('en', 'widgets.guestLabel', '{count} guest'),
  ('en', 'widgets.guestLabels', '{count} guests'),
  ('en', 'widgets.guests', 'Guests'),
  ('en', 'widgets.maxGuests', 'This apartment accommodates up to {count} {guestsLabel}.'),
  ('en', 'widgets.nextMonth', 'Next month'),
  ('en', 'widgets.night', 'night'),
  ('en', 'widgets.nights', 'nights'),
  ('en', 'widgets.pets', 'Pets'),
  ('en', 'widgets.previousMonth', 'Previous month'),
  ('en', 'widgets.reserve', 'Book'),
  ('en', 'widgets.review', 'review'),
  ('en', 'widgets.reviews', 'reviews'),
  ('en', 'widgets.total', 'Total'),
  ('en', 'widgets.where', 'Where')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('fr', 'about.headline', 'Une maison de caractère au cœur du lac de Côme'),
  ('fr', 'about.p1', 'Un petit refuge dans les montagnes, à quelques pas des merveilles du lac de Côme.'),
  ('fr', 'about.p2', 'Au cœur historique de **Naggio**, charmant hameau de Grandola ed Uniti, le temps semble s’écouler plus lentement. Entre les vieilles maisons en pierre, les silences de la montagne et les magnifiques panoramas qui s’ouvrent sur les eaux du **lac de Côme et du lac de Lugano**, chaque instant invite à s’arrêter, à respirer et à se laisser séduire par la beauté du paysage.'),
  ('fr', 'amenities.body', '**Crooked House** dispose de tout ce dont vous avez besoin pour rendre votre séjour agréable, confortable et sans souci.'),
  ('fr', 'amenities.list', '["Four","Lave-vaisselle","Micro-ondes","Machines à café pour espresso, moka et café de type américain","Grille-pain","Bouilloire","Téléviseur à écran plat avec accès à vos services de streaming préférés","Wi-Fi gratuit dans tout l''appartement","Armoire et commode","Berceau gratuit (120 × 60 cm), sur demande","Linge de lit et de toilette inclus","Sèche-cheveux","Fer à repasser","Jardin privé avec table et parasol","Buanderie avec machine à laver, sèche-linge et grand évier avec eau chaude","Garage privé gratuit, adapté aux voitures de petite ou moyenne taille"]'),
  ('fr', 'booking.dates', 'Dates'),
  ('fr', 'booking.detailsTitle', 'Crooked House'),
  ('fr', 'booking.email', 'Adresse e-mail'),
  ('fr', 'booking.firstName', 'Prénom'),
  ('fr', 'booking.guests', 'Voyageurs'),
  ('fr', 'booking.lastName', 'Nom'),
  ('fr', 'booking.location', 'Grandola ed Uniti · Lac de Côme'),
  ('fr', 'booking.proceedToPayment', 'Continuer vers le paiement'),
  ('fr', 'booking.processingPayment', 'Traitement du paiement…'),
  ('fr', 'booking.selectDates', 'Sélectionnez des dates'),
  ('fr', 'explore.body', '**Crooked House** est un point de départ idéal pour découvrir le lac de Côme et ses montagnes, en alliant **détente, nature, sport et culture.** Son emplacement permet de rejoindre facilement des lieux emblématiques tels que **Menaggio, Tremezzina, Varenna et Bellagio,** ainsi que de nombreux itinéraires de randonnée, des excursions et des parcours à vélo électrique. Vous pouvez également prolonger votre découverte jusqu’à **Lugano,** en Suisse.'),
  ('fr', 'footer.contact', 'Contact'),
  ('fr', 'footer.description', 'Un appartement de caractère avec une chambre à Grandola ed Uniti, au-dessus de Menaggio, sur le lac de Côme.'),
  ('fr', 'footer.terms', 'Conditions générales'),
  ('fr', 'gallery.body', '**Crooked House** est un appartement entier comprenant une chambre, soigneusement restauré et aménagé pour offrir un séjour placé sous le signe du confort, de la beauté et de la simplicité. Vous disposerez de tout l’espace et de l’intimité souhaités : **une entrée privée, un salon confortable, une cuisine entièrement équipée et un jardin privé** baigné de tranquillité et encadré par les montagnes.'),
  ('fr', 'gallery.headline', 'Chaque recoin aménagé avec soin'),
  ('fr', 'hero.badge', '{score} · {count} {countLabel} · Grandola ed Uniti, lac de Côme'),
  ('fr', 'hero.description', 'Un séjour hors des sentiers battus, dans une maison au caractère unique, conçue pour ceux qui aiment vivre quelque chose de vraiment spécial.'),
  ('fr', 'location.gettingAround', 'Se déplacer'),
  ('fr', 'location.nearby.airport', 'Aéroport d’Orio al Serio'),
  ('fr', 'location.nearby.airportDetail', '76 km'),
  ('fr', 'location.nearby.lakefront', 'Promenade au bord du lac de Menaggio'),
  ('fr', 'location.nearby.lakefrontDetail', '18 min en voiture'),
  ('fr', 'location.nearby.malpensa', 'Aéroport de Malpensa'),
  ('fr', 'location.nearby.malpensaDetail', '87 km'),
  ('fr', 'nav.book', 'Réserver'),
  ('fr', 'nav.email', 'E-mail'),
  ('fr', 'nav.location', 'Emplacement'),
  ('fr', 'nav.login', 'Connexion'),
  ('fr', 'nav.loginButton', 'Se connecter'),
  ('fr', 'nav.reviews', 'Avis'),
  ('fr', 'nav.surname', 'Nom'),
  ('fr', 'reviews.headline', 'Noté exceptionnel par tous les voyageurs'),
  ('fr', 'services.body', 'Chaque séjour est pensé pour vous offrir confort, accueil et le plaisir de vous sentir chez vous.

Pour les personnes voyageant à moto, un parking dédié est disponible à proximité de l’établissement.

Sur demande, Mara se fera un plaisir de préparer des petits-déjeuners et des repas avec soin, en transformant des ingrédients simples en agréables moments à partager et à savourer.

Son expérience est enrichie par sa qualification de pâtissière obtenue auprès de l’Accademia Italiana de Milan, sa certification S.A.B. et sa formation H.A.C.C.P. de la région Lombardie.

Toutes les informations pour bénéficier du service sont disponibles directement sur place.'),
  ('fr', 'services.headline', 'Services et petites attentions')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('fr', 'widgets.addDate', 'Ajouter une date'),
  ('fr', 'widgets.addGuests', 'Ajouter des voyageurs'),
  ('fr', 'widgets.adults', 'Adultes'),
  ('fr', 'widgets.adultsHint', 'À partir de 13 ans'),
  ('fr', 'widgets.animal', 'animal de compagnie'),
  ('fr', 'widgets.animals', 'animaux de compagnie'),
  ('fr', 'widgets.booking', 'réservation'),
  ('fr', 'widgets.bookings', 'réservations'),
  ('fr', 'widgets.checkIn', 'Arrivée'),
  ('fr', 'widgets.checkOut', 'Départ'),
  ('fr', 'widgets.children', 'Enfants'),
  ('fr', 'widgets.childrenHint', 'Âge : 2–12 ans'),
  ('fr', 'widgets.councilTax', 'Taxe de séjour'),
  ('fr', 'widgets.enterDates', 'Saisissez les dates.'),
  ('fr', 'widgets.guestLabel', '{count} voyageur'),
  ('fr', 'widgets.guestLabels', '{count} voyageurs'),
  ('fr', 'widgets.guests', 'Voyageurs'),
  ('fr', 'widgets.maxGuests', 'Cet appartement peut accueillir jusqu’à {count} {guestsLabel}.'),
  ('fr', 'widgets.nextMonth', 'Mois suivant'),
  ('fr', 'widgets.night', 'nuit'),
  ('fr', 'widgets.nights', 'nuits'),
  ('fr', 'widgets.pets', 'Animaux de compagnie'),
  ('fr', 'widgets.previousMonth', 'Mois précédent'),
  ('fr', 'widgets.reserve', 'Réserver'),
  ('fr', 'widgets.review', 'avis'),
  ('fr', 'widgets.reviews', 'avis'),
  ('fr', 'widgets.total', 'Total'),
  ('fr', 'widgets.where', 'Où'),
  ('de', 'about.headline', 'Ein charakteristisches Haus im Herzen der Comer-See-Region'),
  ('de', 'about.p1', 'Ein kleiner Rückzugsort in den Bergen, nur wenige Schritte von den Wundern des Comer Sees entfernt.'),
  ('de', 'about.p2', 'Im historischen Herzen von **Naggio**, einem malerischen Ortsteil von Grandola ed Uniti, scheint die Zeit langsamer zu vergehen. Zwischen alten Steinhäusern, der Stille der Berge und herrlichen Ausblicken auf das Wasser des **Comer Sees und des Luganer Sees** lädt jeder Moment dazu ein, innezuhalten, durchzuatmen und sich von der Schönheit der Landschaft verzaubern zu lassen.'),
  ('de', 'about.p3', '**4 Gäste · 1 Bett + 1 Schlafsofa · Privater Garten · Haustiere erlaubt · Rauchen verboten**'),
  ('de', 'amenities.body', '**Crooked House** bietet alles, was Sie für einen angenehmen, komfortablen und unbeschwerten Aufenthalt brauchen.'),
  ('de', 'amenities.list', '["Backofen","Geschirrspüler","Mikrowelle","Kaffeemaschinen für Espresso, Mokka und Filterkaffee","Toaster","Wasserkocher","Flachbildfernseher mit Zugang zu Ihren Lieblings-Streamingdiensten","Kostenloses WLAN in der gesamten Wohnung","Kleiderschrank und Kommode","Kostenloses Babybett (120 × 60 cm), auf Anfrage","Bettwäsche und Handtücher inklusive","Föhn","Bügeleisen und Bügelbrett","Privater Garten mit Tisch und Sonnenschirm","Waschküche mit Waschmaschine, Trockner und großem Waschbecken mit Warmwasser","Kostenlose Privatgarage, geeignet für ein kleines oder mittelgroßes Auto"]'),
  ('de', 'booking.checkIn', 'Anreise'),
  ('de', 'booking.checkOut', 'Abreise'),
  ('de', 'booking.dates', 'Reisedaten'),
  ('de', 'booking.detailsTitle', 'Crooked House'),
  ('de', 'booking.firstName', 'Vorname'),
  ('de', 'booking.guests', 'Gäste')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('de', 'booking.lastName', 'Nachname'),
  ('de', 'booking.location', 'Grandola ed Uniti · Comer See'),
  ('de', 'booking.message', 'Gibt es etwas, das wir wissen sollten?'),
  ('de', 'booking.proceedToPayment', 'Weiter zur Zahlung'),
  ('de', 'booking.processingPayment', 'Zahlung wird geladen...'),
  ('de', 'explore.body', '**Crooked House** ist ein idealer Ausgangspunkt, um den Comer See und seine Berge zu entdecken und **Erholung, Natur, Sport und Kultur** zu verbinden. Dank der Lage erreichen Sie bequem sehenswerte Orte wie **Menaggio, Tremezzina, Varenna und Bellagio** sowie zahlreiche Wanderwege für Trekkingtouren, Ausflüge und E-Bike-Touren. Auch ein Abstecher ins schweizerische **Lugano** bietet sich an. Ein Aufenthalt, der dazu einlädt, die Region mit ihren Dörfern, historischen Villen, Seelandschaften und alpinen Ausblicken zu erleben.'),
  ('de', 'explore.headline', 'Entdecken Sie die Region'),
  ('de', 'footer.contact', 'Kontakt'),
  ('de', 'footer.description', 'Eine charakteristische Wohnung mit einem Schlafzimmer in Grandola ed Uniti, oberhalb von Menaggio am Comer See.'),
  ('de', 'footer.explore', 'Entdecken'),
  ('de', 'footer.privacy', 'Datenschutz'),
  ('de', 'footer.terms', 'Nutzungsbedingungen'),
  ('de', 'gallery.body', '**Crooked House** ist eine ganze Wohnung mit einem Schlafzimmer, die sorgfältig restauriert und eingerichtet wurde, um einen Aufenthalt voller Komfort, Schönheit und Einfachheit zu ermöglichen. Ihnen stehen der Raum und die Privatsphäre zur Verfügung, die Sie sich wünschen: **ein eigener Eingang, ein gemütliches Wohnzimmer, eine voll ausgestattete Küche und ein privater Garten** – eingebettet in eine ruhige Umgebung und umgeben von Bergen.'),
  ('de', 'gallery.headline', 'Jede Ecke liebevoll gestaltet'),
  ('de', 'hero.badge', '{score} · {count} {countLabel} · Grandola ed Uniti, Comer See'),
  ('de', 'hero.description', 'Ein Aufenthalt jenseits des Gewöhnlichen in einem Haus mit einzigartigem Charakter – für alle, die gerne etwas wirklich Besonderes erleben möchten.'),
  ('de', 'hero.title', 'Crooked House
Außen schief, innen außergewöhnlich'),
  ('de', 'location.gettingAround', 'Unterwegs vor Ort'),
  ('de', 'location.headline', 'In den Hügeln oberhalb von Menaggio'),
  ('de', 'location.nearby.airportDetail', '76 km'),
  ('de', 'location.nearby.lakefront', 'Uferpromenade von Menaggio'),
  ('de', 'location.nearby.lakefrontDetail', '18 Min. Fahrt'),
  ('de', 'location.nearby.malpensa', 'Flughafen Malpensa'),
  ('de', 'location.nearby.malpensaDetail', '87 km entfernt'),
  ('de', 'nav.amenities', 'Ausstattung'),
  ('de', 'nav.book', 'Buchen'),
  ('de', 'nav.location', 'Lage'),
  ('de', 'nav.login', 'Anmelden'),
  ('de', 'nav.loginButton', 'Anmelden'),
  ('de', 'nav.reviews', 'Bewertungen'),
  ('de', 'nav.surname', 'Nachname'),
  ('de', 'reviews.headline', 'Von allen Gästen als außergewöhnlich bewertet'),
  ('de', 'services.body', 'Jeder Aufenthalt ist darauf ausgerichtet, Ihnen Komfort und Gastfreundschaft zu bieten und Ihnen das Gefühl zu geben, zu Hause zu sein.

Für Motorradreisende steht in der Nähe der Unterkunft ein eigener Parkplatz zur Verfügung.

Auf Anfrage bereitet Mara gerne Frühstück und Mahlzeiten mit viel Sorgfalt zu. Aus einfachen Zutaten schafft sie so schöne Momente, die man gemeinsam genießen kann.

Mara ist ausgebildete Konditorin (Accademia Italiana in Mailand), verfügt über die S.A.B.-Zertifizierung und hat eine H.A.C.C.P.-Schulung der Region Lombardei absolviert.

Alle Informationen zur Nutzung des Angebots erhalten Sie direkt vor Ort.'),
  ('de', 'services.headline', 'Service und kleine Aufmerksamkeiten'),
  ('de', 'widgets.addDate', 'Datum hinzufügen'),
  ('de', 'widgets.addGuests', 'Gäste hinzufügen'),
  ('de', 'widgets.adults', 'Erwachsene'),
  ('de', 'widgets.adultsHint', 'Ab 13 Jahren'),
  ('de', 'widgets.animal', 'Haustier'),
  ('de', 'widgets.animals', 'Haustiere')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('de', 'widgets.booking', 'Buchung'),
  ('de', 'widgets.bookings', 'Buchungen'),
  ('de', 'widgets.checkIn', 'Anreise'),
  ('de', 'widgets.checkOut', 'Abreise'),
  ('de', 'widgets.children', 'Kinder'),
  ('de', 'widgets.childrenHint', 'Alter 2–12 Jahre'),
  ('de', 'widgets.councilTax', 'Gemeindesteuer'),
  ('de', 'widgets.enterDates', 'Geben Sie die Reisedaten ein.'),
  ('de', 'widgets.guestLabel', '{count} Gast'),
  ('de', 'widgets.guestLabels', '{count} Gäste'),
  ('de', 'widgets.guests', 'Gäste'),
  ('de', 'widgets.maxGuests', 'Diese Wohnung bietet Platz für bis zu {count} {guestsLabel}.'),
  ('de', 'widgets.nextMonth', 'Nächster Monat'),
  ('de', 'widgets.night', 'Nacht'),
  ('de', 'widgets.nights', 'Nächte'),
  ('de', 'widgets.pets', 'Haustiere'),
  ('de', 'widgets.previousMonth', 'Vorheriger Monat'),
  ('de', 'widgets.reserve', 'Reservieren'),
  ('de', 'widgets.review', 'Bewertung'),
  ('de', 'widgets.reviews', 'Bewertungen'),
  ('de', 'widgets.total', 'Gesamt'),
  ('de', 'widgets.where', 'Wo'),
  ('es', 'about.headline', 'Una casa con carácter en el corazón del Lago de Como'),
  ('es', 'about.p2', 'En el corazón histórico de **Naggio**, una pintoresca aldea de Grandola ed Uniti, el tiempo parece pasar más despacio. Entre las antiguas casas de piedra, la tranquilidad de la montaña y las maravillosas vistas de las aguas del **Lago de Como y del Lago de Lugano**, cada momento invita a detenerse, respirar y dejarse cautivar por la belleza del paisaje.'),
  ('es', 'about.p3', '**4 huéspedes · 1 cama + 1 sofá cama doble · Jardín privado · Se admiten mascotas · No se permite fumar**'),
  ('es', 'amenities.body', '**Crooked House** dispone de todo lo necesario para que la estancia sea agradable, cómoda y sin preocupaciones.'),
  ('es', 'amenities.list', '["Horno","Lavavajillas","Microondas","Cafeteras para preparar café espresso, moka y americano","Tostadora","Hervidor","Televisor de pantalla plana con acceso a sus servicios de streaming favoritos","Wi-Fi gratuito en todo el apartamento","Armario y cómoda","Cuna gratuita (120 × 60 cm), disponible bajo petición","Ropa de cama y toallas incluidas","Secador de pelo","Plancha y tabla de planchar","Jardín privado con mesa y sombrilla","Lavadero con lavadora, secadora y un amplio fregadero con agua caliente","Garaje privado gratuito, adecuado para un coche pequeño o mediano"]'),
  ('es', 'booking.dates', 'Fechas'),
  ('es', 'booking.detailsTitle', 'Crooked House'),
  ('es', 'booking.email', 'Correo electrónico'),
  ('es', 'booking.lastName', 'Apellido'),
  ('es', 'booking.proceedToPayment', 'Continuar con el pago'),
  ('es', 'booking.processingPayment', 'Procesando el pago...'),
  ('es', 'booking.selectDates', 'Selecciona las fechas'),
  ('es', 'explore.body', '**Crooked House** es un punto de partida ideal para descubrir el Lago de Como y sus montañas, combinando **relajación, naturaleza, deporte y cultura.** Desde aquí se puede llegar fácilmente a lugares fascinantes como **Menaggio, Tremezzina, Varenna y Bellagio,** además de recorrer numerosas rutas de senderismo, excursiones y caminos para bicicletas eléctricas. También se puede prolongar la experiencia hasta **Lugano,** en Suiza. Una estancia pensada para descubrir la zona, sus pueblos, villas históricas, paisajes lacustres y vistas alpinas.'),
  ('es', 'explore.headline', 'Explora la zona'),
  ('es', 'footer.description', 'Un apartamento con carácter y un dormitorio en Grandola ed Uniti, sobre Menaggio, a orillas del Lago de Como.'),
  ('es', 'footer.terms', 'Términos'),
  ('es', 'gallery.body', '**Crooked House** es un apartamento completo de un dormitorio, cuidadosamente restaurado y amueblado para ofrecer una estancia marcada por la comodidad, la belleza y la sencillez. Tendrás todo el espacio y la privacidad que quieras: **entrada privada, acogedor salón, cocina totalmente equipada y un jardín privado** rodeado de tranquilidad y enmarcado por las montañas. Un pequeño rincón de paz donde sentirte como en casa y disfrutar del lago a tu propio ritmo.'),
  ('es', 'gallery.headline', 'Cada rincón, cuidado al detalle')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('es', 'hero.description', 'Una estancia fuera de lo común, en una casa de carácter único, pensada para quienes quieren vivir algo realmente especial.'),
  ('es', 'location.headline', 'En las colinas sobre Menaggio'),
  ('es', 'location.nearby.airport', 'Aeropuerto de Orio al Serio'),
  ('es', 'location.nearby.airportDetail', '76 km'),
  ('es', 'location.nearby.lakefront', 'Paseo junto al lago de Menaggio'),
  ('es', 'location.nearby.lakefrontDetail', '18 min en coche'),
  ('es', 'location.nearby.malpensa', 'Aeropuerto de Malpensa'),
  ('es', 'location.nearby.malpensaDetail', '87 km'),
  ('es', 'nav.book', 'Reservar'),
  ('es', 'nav.email', 'Correo electrónico'),
  ('es', 'nav.location', 'Ubicación'),
  ('es', 'nav.login', 'Iniciar sesión'),
  ('es', 'nav.loginButton', 'Iniciar sesión'),
  ('es', 'nav.reviews', 'Reseñas'),
  ('es', 'nav.surname', 'Apellido'),
  ('es', 'reviews.headline', 'Valorado como excepcional por todos los huéspedes'),
  ('es', 'services.body', 'Cada estancia está pensada para ofrecer comodidad, hospitalidad y el placer de sentirse como en casa.

Quienes viajan en moto disponen de aparcamiento específico cerca del alojamiento.

Si lo solicitas, Mara estará encantada de preparar desayunos y comidas con esmero, transformando ingredientes sencillos en momentos agradables para compartir y disfrutar.

Su experiencia se complementa con su formación como pastelera en la Accademia Italiana de Milán, la certificación S.A.B. y la formación H.A.C.C.P. de la Región de Lombardía.

Toda la información para utilizar este servicio está disponible directamente en el alojamiento.'),
  ('es', 'services.headline', 'Servicios y pequeños detalles'),
  ('es', 'widgets.addDate', 'Añadir fecha'),
  ('es', 'widgets.addGuests', 'Añadir huéspedes'),
  ('es', 'widgets.adults', 'Adultos'),
  ('es', 'widgets.adultsHint', 'A partir de 13 años'),
  ('es', 'widgets.animal', 'mascota'),
  ('es', 'widgets.animals', 'mascotas'),
  ('es', 'widgets.booking', 'reserva'),
  ('es', 'widgets.bookings', 'reservas'),
  ('es', 'widgets.checkIn', 'Entrada'),
  ('es', 'widgets.checkOut', 'Salida'),
  ('es', 'widgets.children', 'Niños'),
  ('es', 'widgets.childrenHint', 'De 2 a 12 años'),
  ('es', 'widgets.councilTax', 'Tasa turística'),
  ('es', 'widgets.enterDates', 'Introduce las fechas.'),
  ('es', 'widgets.guestLabel', '{count} huésped'),
  ('es', 'widgets.guestLabels', '{count} huéspedes'),
  ('es', 'widgets.guests', 'Huéspedes'),
  ('es', 'widgets.maxGuests', 'Este apartamento admite hasta {count} {guestsLabel}.'),
  ('es', 'widgets.nextMonth', 'Mes siguiente'),
  ('es', 'widgets.night', 'noche'),
  ('es', 'widgets.nights', 'noches'),
  ('es', 'widgets.pets', 'Mascotas')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('es', 'widgets.previousMonth', 'Mes anterior'),
  ('es', 'widgets.reserve', 'Reservar'),
  ('es', 'widgets.review', 'reseña'),
  ('es', 'widgets.reviews', 'reseñas'),
  ('es', 'widgets.total', 'Total'),
  ('es', 'widgets.where', 'Dónde'),
  ('ru', 'about.headline', 'Дом с особым характером в самом сердце озера Комо'),
  ('ru', 'about.p1', 'Небольшой горный приют в нескольких шагах от красот озера Комо.'),
  ('ru', 'about.p2', 'В историческом центре **Naggio**, живописной деревушки муниципалитета Grandola ed Uniti, время будто течёт медленнее. Среди старинных каменных домов, тишины гор и чарующих видов на воды **озера Комо и озера Лугано** каждый миг приглашает остановиться, перевести дыхание и насладиться красотой пейзажа.'),
  ('ru', 'about.p3', '**4 гостя · 1 кровать + 1 двуспальный диван-кровать · Частный сад · Можно с домашними животными · Для некурящих**'),
  ('ru', 'amenities.body', 'В **Crooked House** есть всё необходимое, чтобы ваше пребывание было приятным, комфортным и без лишних забот.'),
  ('ru', 'amenities.headline', 'Всё для отдыха'),
  ('ru', 'amenities.list', '["Духовой шкаф","Посудомоечная машина","Микроволновая печь","Кофемашины для эспрессо, кофе в гейзерной кофеварке и фильтр-кофе","Тостер","Электрический чайник","Телевизор с доступом к вашим любимым стриминговым сервисам","Бесплатный Wi-Fi","Шкаф и комод","Бесплатная детская кроватка (120 × 60 см), по запросу","Постельное бельё и полотенца включены","Фен","Утюг","Собственный сад со столом и зонтом от солнца","Прачечная со стиральной и сушильной машинами и раковиной с горячей водой","Бесплатный частный гараж для автомобиля небольшого или среднего размера"]'),
  ('ru', 'booking.checkIn', 'Заезд'),
  ('ru', 'booking.checkOut', 'Выезд'),
  ('ru', 'booking.dates', 'Даты'),
  ('ru', 'booking.detailsTitle', 'Crooked House'),
  ('ru', 'booking.email', 'Эл. почта'),
  ('ru', 'booking.headline', 'Забронируйте отдых'),
  ('ru', 'booking.lastName', 'Фамилия'),
  ('ru', 'booking.location', 'Grandola ed Uniti · озеро Комо'),
  ('ru', 'booking.message', 'Есть ли что-то, о чём нам стоит знать?'),
  ('ru', 'booking.messagePlaceholder', 'Особые поводы, требования к питанию, время прибытия...'),
  ('ru', 'booking.proceedToPayment', 'Перейти к оплате'),
  ('ru', 'booking.processingPayment', 'Загрузка платёжных данных...'),
  ('ru', 'booking.selectDates', 'Выбрать даты'),
  ('ru', 'explore.body', '**Crooked House** — идеальная база для знакомства с озером Комо и его горами, где сочетаются отдых, природа, спорт и культура.** Расположение позволяет легко добраться до таких живописных мест, как **Menaggio, Tremezzina, Varenna и Bellagio,** а также до многочисленных маршрутов для пеших прогулок, походов и поездок на электровелосипеде. Вы также можете отправиться в **Lugano,** в Швейцарию.'),
  ('ru', 'explore.headline', 'Исследуйте окрестности'),
  ('ru', 'footer.contact', 'Контакты'),
  ('ru', 'footer.description', 'Уютная квартира с одной спальней в Grandola ed Uniti, над Menaggio на озере Комо.'),
  ('ru', 'footer.explore', 'Исследовать'),
  ('ru', 'footer.privacy', 'Конфиденциальность'),
  ('ru', 'footer.terms', 'Условия'),
  ('ru', 'gallery.body', '**Crooked House** — это отдельная квартира с одной спальней, тщательно отреставрированная и обставленная для отдыха, в котором сочетаются комфорт, красота и простота. В вашем распоряжении будет достаточно места и уединения: **отдельный вход, уютная гостиная, полностью оборудованная кухня и собственный сад**, утопающий в тишине и окружённый горами.'),
  ('ru', 'gallery.headline', 'Каждый уголок оформлен с заботой'),
  ('ru', 'hero.description', 'Необычное жильё в доме с неповторимым характером — для тех, кто любит открывать для себя что-то особенное.'),
  ('ru', 'hero.title', 'Crooked House
Снаружи кривой, внутри необыкновенный'),
  ('ru', 'location.address', 'Via Dante Alighieri 2, frazione Naggio, Grandola ed Uniti, Como, 22010'),
  ('ru', 'location.gettingAround', 'Как передвигаться'),
  ('ru', 'location.headline', 'На холмах над Menaggio')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('ru', 'location.nearby.airportDetail', '76 км'),
  ('ru', 'location.nearby.lakefront', 'Набережная в Menaggio'),
  ('ru', 'location.nearby.lakefrontDetail', '18 мин. на машине'),
  ('ru', 'location.nearby.malpensa', 'Аэропорт Мальпенса'),
  ('ru', 'location.nearby.malpensaDetail', '87 км'),
  ('ru', 'nav.amenities', 'Удобства'),
  ('ru', 'nav.apartment', 'Апартаменты'),
  ('ru', 'nav.book', 'Забронировать'),
  ('ru', 'nav.email', 'Эл. почта'),
  ('ru', 'nav.location', 'Расположение'),
  ('ru', 'nav.login', 'Войти'),
  ('ru', 'nav.loginButton', 'Войти'),
  ('ru', 'nav.reviews', 'Отзывы'),
  ('ru', 'nav.surname', 'Фамилия'),
  ('ru', 'reviews.headline', 'Каждый гость оценил нас на «Отлично»'),
  ('ru', 'services.body', 'Каждое пребывание продумано так, чтобы подарить вам комфорт, гостеприимство и ощущение домашнего уюта.

Для путешествующих на мотоцикле поблизости от жилья предусмотрена специальная парковка.

По запросу Mara с удовольствием приготовит завтраки и блюда, вложив в них заботу и превратив простые ингредиенты в приятные моменты, которыми можно поделиться и насладиться.

Её опыт подкреплён квалификацией кондитера, полученной в Accademia Italiana di Milano, сертификатом S.A.B. и обучением по стандартам H.A.C.C.P. в регионе Ломбардия.

Всю информацию об услуге можно получить непосредственно на месте.'),
  ('ru', 'services.headline', 'Услуги и приятные мелочи'),
  ('ru', 'widgets.addDate', 'Добавить дату'),
  ('ru', 'widgets.addGuests', 'Добавить гостей'),
  ('ru', 'widgets.adults', 'Взрослые'),
  ('ru', 'widgets.adultsHint', 'С 13 лет'),
  ('ru', 'widgets.animal', 'питомец'),
  ('ru', 'widgets.animals', 'питомцы'),
  ('ru', 'widgets.booking', 'бронирование'),
  ('ru', 'widgets.bookings', 'бронирования'),
  ('ru', 'widgets.checkIn', 'Заезд'),
  ('ru', 'widgets.checkOut', 'Выезд'),
  ('ru', 'widgets.children', 'Дети'),
  ('ru', 'widgets.childrenHint', 'От 2 до 12 лет'),
  ('ru', 'widgets.councilTax', 'Муниципальный налог'),
  ('ru', 'widgets.enterDates', 'Введите даты.'),
  ('ru', 'widgets.guestLabel', '{count} гость'),
  ('ru', 'widgets.guestLabels', '{count} гостей'),
  ('ru', 'widgets.guests', 'Гости'),
  ('ru', 'widgets.maxGuests', 'В этих апартаментах могут разместиться до {count} {guestsLabel}.'),
  ('ru', 'widgets.nextMonth', 'Следующий месяц'),
  ('ru', 'widgets.night', 'ночь'),
  ('ru', 'widgets.nights', 'ночей'),
  ('ru', 'widgets.pets', 'Домашние животные'),
  ('ru', 'widgets.previousMonth', 'Предыдущий месяц')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;

INSERT INTO translations (locale, key, value) VALUES
  ('ru', 'widgets.reserve', 'Забронировать'),
  ('ru', 'widgets.review', 'отзыв'),
  ('ru', 'widgets.reviews', 'отзывы'),
  ('ru', 'widgets.total', 'Итого'),
  ('ru', 'widgets.where', 'Где')
ON CONFLICT(locale, key) DO UPDATE SET value = excluded.value;
