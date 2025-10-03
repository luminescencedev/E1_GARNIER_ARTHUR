# WebCraft Solutions Portfolio

Petit projet front-end realise en HTML5, CSS3 et JavaScript natif pour presenter le studio WebCraft Solutions.

## Sommaire
- [Fonctionnalites](#fonctionnalites)
- [Structure](#structure)
- [Installation rapide](#installation-rapide)
- [Tests manuels](#tests-manuels)
- [Validation W3C](#validation-w3c)

## Fonctionnalites
- Chargement des projets via l API `https://gabistam.github.io/Demo_API/data/projects.json`.
- Filtre dynamique par technologie sans rechargement de page.
- Modale detaillee par projet avec navigation clavier et echap.
- Formulaire de contact avec validation JavaScript et messages d erreur/succes.
- Design responsive sombre (desktop et mobile) + menu burger.

## Structure
```
E1_GARNIER_ARTHUR/
├── index.html     # Accueil + portfolio
├── about.html     # Page a propos
├── contact.html   # Formulaire de contact
├── css/style.css  # Styles principaux
├── js/main.js     # Logique de filtrage, modale, formulaire
└── README.md
```

## Installation rapide
1. Cloner ou copier ce dossier sur votre machine.
2. Ouvrir `index.html` dans votre navigateur (double clic ou serveurlocal type `npx serve`).
3. Verifier que la connexion internet est active pour charger l API distante.

## Tests manuels
- **Portfolio** : ouvrir `index.html`, attendre le chargement, tester plusieurs filtres et ouvrir/fermer la modale (clic, touche `Enter`, touche `Echap`).
- **Responsive** : reduire la fenetre ou utiliser les outils dev pour tester le menu mobile.
- **Contact** : sur `contact.html`, soumettre un formulaire vide, puis un formulaire valide pour verifier les messages.

## Validation W3C
- HTML : utiliser https://validator.w3.org/nu/ (uploader chaque page). Les pages sont preparees pour passer la validation.
- CSS : verifier `css/style.css` via https://jigsaw.w3.org/css-validator/.
