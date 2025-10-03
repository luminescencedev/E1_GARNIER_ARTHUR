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

## Conformite au cahier des charges
- **HTML5** : structure semantique, attributs ARIA et meta conformes, images avec `alt`. Pages valides W3C (penser a conserver les captures).
- **CSS3** : variables de theme, grille responsive (Grid), media queries pour < 780px et < 520px, animations via `@keyframes dot`, hover sur cartes/liens.
- **JavaScript** : code ES6 (`const`, `let`, template literals), manipulation DOM, gestion d evenements (click, keydown, submit), modale complete, filtrage dynamique, validation du formulaire.
- **AJAX** : requete `fetch` asynchrone avec `try/catch`, loader affiche/masque, DOM mis a jour sans rechargement.
- **Organisation** : HTML/CSS/JS dans des fichiers dedies, commentaires techniques ponctuels, nommage coherent.
- **Livrables** : README, rappel de fournir un depot GitHub et captures de validation W3C.

## Tests manuels
- **Portfolio** : ouvrir `index.html`, attendre le chargement, tester plusieurs filtres et ouvrir/fermer la modale (clic, touche `Enter`, touche `Echap`).
- **Responsive** : reduire la fenetre ou utiliser les outils dev pour tester le menu mobile.
- **Contact** : sur `contact.html`, soumettre un formulaire vide, puis un formulaire valide pour verifier les messages.

## Validation W3C
- HTML : utiliser https://validator.w3.org/nu/ (uploader chaque page). Les pages sont preparees pour passer la validation.
- CSS : verifier `css/style.css` via https://jigsaw.w3.org/css-validator/.
