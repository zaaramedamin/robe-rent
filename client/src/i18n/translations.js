// UI string dictionary for the English / French language toggle.
// Keys are dot-namespaced; `{var}` placeholders are filled by t(key, vars).
export const translations = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.availability': 'Availability',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'nav.adminLogin': 'Admin Login',
    'nav.logout': 'Logout',
    'nav.toggleMenu': 'Toggle menu',
    'nav.language': 'Language',

    // Common
    'common.loading': 'Loading…',
    'common.tryAgain': 'Try again',
    'unit.day': 'day',
    'unit.days': 'days',

    // Footer
    'footer.tagline': 'Elegant wedding dress rentals across Tunisia · Pre-reserve online',
    'footer.rights': '© {year} RobeRent · Prototype demo',

    // Home
    'home.badge': 'Wedding dress rental · Tunisia',
    'home.heroTitle': 'Find your dream dress,',
    'home.heroAccent': 'reserve in seconds.',
    'home.heroSubtitle':
      'Browse our curated collection of bridal and oriental gowns, check real-time availability, and pre-reserve your favourite — all online.',
    'home.browse': 'Browse the gallery',
    'home.checkAvailability': 'Check availability',
    'home.startingFrom': 'Starting from',
    'home.perDay': '{price} TND / day',
    'home.featured': 'Featured gowns',
    'home.featuredSub': 'A glimpse of our collection.',
    'home.viewAll': 'View all →',
    'home.howItWorks': 'How it works',
    'home.step1Title': 'Browse',
    'home.step1Desc': 'Explore our gallery and filter by style, price, or date.',
    'home.step2Title': 'Check availability',
    'home.step2Desc': 'See exactly which days each dress is free on its calendar.',
    'home.step3Title': 'Pre-reserve',
    'home.step3Desc': 'Fill in your details and we confirm your booking shortly.',

    // Gallery
    'gallery.title': 'The Collection',
    'gallery.subtitle': 'Filter by style, budget, or a specific date.',
    'gallery.search': 'Search',
    'gallery.searchPlaceholder': 'Dress name…',
    'gallery.category': 'Category',
    'gallery.cat.all': 'All',
    'gallery.cat.classic': 'Classic',
    'gallery.cat.modern': 'Modern',
    'gallery.cat.oriental': 'Oriental',
    'gallery.maxPrice': 'Max price (TND/day)',
    'gallery.anyPrice': 'Any',
    'gallery.availableOn': 'Available on',
    'gallery.checking': 'Checking availability…',
    'gallery.showingFree': 'Showing dresses free on {date}.',
    'gallery.clearDate': 'clear date',
    'gallery.noMatch': 'No dresses match your filters.',
    'gallery.loadError': 'Could not load dresses. Is the server running?',

    // Dress card
    'dress.perDay': '/ day',
    'dress.unavailable': 'Unavailable',
    'dress.view': 'View →',

    // Dress detail
    'detail.back': '← Back to gallery',
    'detail.refundableDeposit': 'Refundable deposit:',
    'detail.availableSizes': 'Available sizes',
    'detail.notAvailable': 'This dress is currently not available for rental.',
    'detail.availability': 'Availability',
    'detail.availabilityHelp':
      'Click your start date, then your return date. A cleaning buffer between rentals is shown as reserved.',
    'detail.crosses': 'Your selected period includes an unavailable day. Pick a clear range.',
    'detail.loadError': 'Could not load this dress.',

    // Reservation form
    'res.title': 'Pre-reserve this dress',
    'res.pickDatesFirst': 'Please select your rental dates on the calendar first.',
    'res.rangeTaken':
      'Your selected dates include an unavailable (red) day. Please pick a clear period.',
    'res.chooseSize': 'Please choose a size.',
    'res.fixFields': 'Please fix the highlighted fields.',
    'res.dates': 'Dates:',
    'res.rental': 'Rental:',
    'res.deposit': 'Refundable deposit:',
    'res.pickHint': 'Pick your start and end dates on the calendar above.',
    'res.fullName': 'Full name',
    'res.namePlaceholder': 'e.g. Amira Ben Salah',
    'res.phone': 'Phone number',
    'res.email': 'Email',
    'res.selectedDress': 'Selected dress',
    'res.size': 'Size',
    'res.chooseSizeOpt': 'Choose a size…',
    'res.notes': 'Notes (optional)',
    'res.notesPlaceholder': 'Alterations, fitting preferences, etc.',
    'res.reviewConfirm': 'Review & confirm',
    'res.reviewIntro': 'Please review your details before sending:',
    'res.lblName': 'Name',
    'res.lblPhone': 'Phone',
    'res.lblEmail': 'Email',
    'res.lblDress': 'Dress',
    'res.lblSize': 'Size',
    'res.lblDates': 'Dates',
    'res.lblTotal': 'Rental total',
    'res.lblNotes': 'Notes',
    'res.edit': 'Edit',
    'res.confirmSend': 'Confirm & send',
    'res.sending': 'Sending…',
    'res.received': 'Reservation received!',
    'res.thankYou': "Thank you, {name}. We've pre-reserved {dress} for {range}{days}.",
    'res.nextTitle': 'What happens next?',
    'res.next1': 'Our team reviews your request and confirms availability.',
    'res.next2': 'We contact you at {email} or {phone} to arrange a fitting.',
    'res.next3': 'You pay any deposit at pickup and the dress is yours for the dates.',
    'res.makeAnother': 'Make another reservation',
    'res.submitError': 'Could not submit your reservation. Please try again.',

    // Validation
    'validation.nameRequired': 'Please enter your full name.',
    'validation.emailRequired': 'Email is required.',
    'validation.emailInvalid': 'Please enter a valid email address.',
    'validation.phoneRequired': 'Phone number is required.',
    'validation.phoneInvalid': 'Please enter a valid phone number.',

    // Calendar page
    'cal.title': 'Availability calendar',
    'cal.subtitle': 'Click a date to see which dresses are reserved and which are free.',
    'cal.fullyAvailable': 'Fully available',
    'cal.hasReservations': 'Has reservations',
    'cal.reserved': 'Reserved ({count})',
    'cal.available': 'Available ({count})',
    'cal.noReservations': 'No reservations this day.',
    'cal.view': 'view',
    'cal.reserveArrow': 'reserve →',
    'cal.loadError': 'Could not load availability.',
    'cal.loading': 'Loading availability…',

    // Calendar view legend
    'calview.available': 'Available',
    'calview.reserved': 'Reserved',
    'calview.selectedRange': 'Selected range',
    'calview.selected': 'Selected',

    // Not found
    'nf.message': 'This page could not be found.',
    'nf.back': 'Back home',

    // Admin login
    'login.title': 'Admin login',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.signIn': 'Sign in',
    'login.signingIn': 'Signing in…',
    'login.failed': 'Login failed. Check your credentials.',
  },

  fr: {
    // Nav
    'nav.home': 'Accueil',
    'nav.gallery': 'Collection',
    'nav.availability': 'Disponibilité',
    'nav.dashboard': 'Tableau de bord',
    'nav.admin': 'Admin',
    'nav.adminLogin': 'Connexion admin',
    'nav.logout': 'Déconnexion',
    'nav.toggleMenu': 'Ouvrir le menu',
    'nav.language': 'Langue',

    // Common
    'common.loading': 'Chargement…',
    'common.tryAgain': 'Réessayer',
    'unit.day': 'jour',
    'unit.days': 'jours',

    // Footer
    'footer.tagline':
      'Location élégante de robes de mariée partout en Tunisie · Pré-réservez en ligne',
    'footer.rights': '© {year} RobeRent · Démo prototype',

    // Home
    'home.badge': 'Location de robes de mariée · Tunisie',
    'home.heroTitle': 'Trouvez la robe de vos rêves,',
    'home.heroAccent': 'réservez en quelques secondes.',
    'home.heroSubtitle':
      'Parcourez notre collection de robes de mariée et orientales, vérifiez la disponibilité en temps réel et pré-réservez votre préférée — entièrement en ligne.',
    'home.browse': 'Voir la collection',
    'home.checkAvailability': 'Vérifier la disponibilité',
    'home.startingFrom': 'À partir de',
    'home.perDay': '{price} TND / jour',
    'home.featured': 'Robes en vedette',
    'home.featuredSub': 'Un aperçu de notre collection.',
    'home.viewAll': 'Tout voir →',
    'home.howItWorks': 'Comment ça marche',
    'home.step1Title': 'Parcourir',
    'home.step1Desc': 'Explorez notre collection et filtrez par style, prix ou date.',
    'home.step2Title': 'Vérifier la disponibilité',
    'home.step2Desc': 'Voyez exactement quels jours chaque robe est libre sur son calendrier.',
    'home.step3Title': 'Pré-réserver',
    'home.step3Desc': 'Renseignez vos informations et nous confirmons votre réservation rapidement.',

    // Gallery
    'gallery.title': 'La Collection',
    'gallery.subtitle': 'Filtrez par style, budget ou une date précise.',
    'gallery.search': 'Recherche',
    'gallery.searchPlaceholder': 'Nom de la robe…',
    'gallery.category': 'Catégorie',
    'gallery.cat.all': 'Toutes',
    'gallery.cat.classic': 'Classique',
    'gallery.cat.modern': 'Moderne',
    'gallery.cat.oriental': 'Orientale',
    'gallery.maxPrice': 'Prix max (TND/jour)',
    'gallery.anyPrice': 'Tous',
    'gallery.availableOn': 'Disponible le',
    'gallery.checking': 'Vérification de la disponibilité…',
    'gallery.showingFree': 'Robes libres le {date}.',
    'gallery.clearDate': 'effacer la date',
    'gallery.noMatch': 'Aucune robe ne correspond à vos filtres.',
    'gallery.loadError': 'Impossible de charger les robes. Le serveur est-il démarré ?',

    // Dress card
    'dress.perDay': '/ jour',
    'dress.unavailable': 'Indisponible',
    'dress.view': 'Voir →',

    // Dress detail
    'detail.back': '← Retour à la collection',
    'detail.refundableDeposit': 'Caution remboursable :',
    'detail.availableSizes': 'Tailles disponibles',
    'detail.notAvailable': "Cette robe n'est pas disponible à la location pour le moment.",
    'detail.availability': 'Disponibilité',
    'detail.availabilityHelp':
      'Cliquez sur votre date de début, puis sur votre date de retour. Un délai de nettoyage entre deux locations apparaît comme réservé.',
    'detail.crosses':
      'La période sélectionnée comprend un jour indisponible. Choisissez une plage libre.',
    'detail.loadError': 'Impossible de charger cette robe.',

    // Reservation form
    'res.title': 'Pré-réserver cette robe',
    'res.pickDatesFirst': "Veuillez d'abord choisir vos dates de location sur le calendrier.",
    'res.rangeTaken':
      'Vos dates incluent un jour indisponible (en rouge). Choisissez une période libre.',
    'res.chooseSize': 'Veuillez choisir une taille.',
    'res.fixFields': 'Veuillez corriger les champs en surbrillance.',
    'res.dates': 'Dates :',
    'res.rental': 'Location :',
    'res.deposit': 'Caution remboursable :',
    'res.pickHint': 'Choisissez vos dates de début et de fin sur le calendrier ci-dessus.',
    'res.fullName': 'Nom complet',
    'res.namePlaceholder': 'ex. Amira Ben Salah',
    'res.phone': 'Numéro de téléphone',
    'res.email': 'E-mail',
    'res.selectedDress': 'Robe sélectionnée',
    'res.size': 'Taille',
    'res.chooseSizeOpt': 'Choisir une taille…',
    'res.notes': 'Remarques (facultatif)',
    'res.notesPlaceholder': 'Retouches, préférences d’essayage, etc.',
    'res.reviewConfirm': 'Vérifier et confirmer',
    'res.reviewIntro': "Veuillez vérifier vos informations avant l'envoi :",
    'res.lblName': 'Nom',
    'res.lblPhone': 'Téléphone',
    'res.lblEmail': 'E-mail',
    'res.lblDress': 'Robe',
    'res.lblSize': 'Taille',
    'res.lblDates': 'Dates',
    'res.lblTotal': 'Total location',
    'res.lblNotes': 'Remarques',
    'res.edit': 'Modifier',
    'res.confirmSend': 'Confirmer et envoyer',
    'res.sending': 'Envoi…',
    'res.received': 'Réservation reçue !',
    'res.thankYou': 'Merci, {name}. Nous avons pré-réservé {dress} pour {range}{days}.',
    'res.nextTitle': 'Et ensuite ?',
    'res.next1': 'Notre équipe examine votre demande et confirme la disponibilité.',
    'res.next2': 'Nous vous contactons au {email} ou {phone} pour organiser un essayage.',
    'res.next3': 'Vous réglez la caution au retrait et la robe est à vous pour ces dates.',
    'res.makeAnother': 'Faire une autre réservation',
    'res.submitError': "Impossible d'envoyer votre réservation. Veuillez réessayer.",

    // Validation
    'validation.nameRequired': 'Veuillez saisir votre nom complet.',
    'validation.emailRequired': "L'e-mail est obligatoire.",
    'validation.emailInvalid': 'Veuillez saisir une adresse e-mail valide.',
    'validation.phoneRequired': 'Le numéro de téléphone est obligatoire.',
    'validation.phoneInvalid': 'Veuillez saisir un numéro de téléphone valide.',

    // Calendar page
    'cal.title': 'Calendrier de disponibilité',
    'cal.subtitle': 'Cliquez sur une date pour voir quelles robes sont réservées ou libres.',
    'cal.fullyAvailable': 'Entièrement disponible',
    'cal.hasReservations': 'Comporte des réservations',
    'cal.reserved': 'Réservées ({count})',
    'cal.available': 'Disponibles ({count})',
    'cal.noReservations': 'Aucune réservation ce jour-là.',
    'cal.view': 'voir',
    'cal.reserveArrow': 'réserver →',
    'cal.loadError': 'Impossible de charger la disponibilité.',
    'cal.loading': 'Chargement de la disponibilité…',

    // Calendar view legend
    'calview.available': 'Disponible',
    'calview.reserved': 'Réservé',
    'calview.selectedRange': 'Plage sélectionnée',
    'calview.selected': 'Sélectionné',

    // Not found
    'nf.message': 'Cette page est introuvable.',
    'nf.back': "Retour à l'accueil",

    // Admin login
    'login.title': 'Connexion admin',
    'login.username': "Nom d'utilisateur",
    'login.password': 'Mot de passe',
    'login.signIn': 'Se connecter',
    'login.signingIn': 'Connexion…',
    'login.failed': 'Échec de la connexion. Vérifiez vos identifiants.',
  },
};
