# Guide de Création de Sections - Kitpoterie

Ce guide explique la bonne façon de créer une section pour le thème Kitpoterie. L'objectif est de respecter les conventions et les bonnes pratiques du projet.

## Structure des fichiers

Chaque section doit être composée de **3 fichiers** :

```
sections/nom-de-la-section.liquid     # Markup Liquid
assets/section-nom-de-la-section.css  # Styles CSS
assets/global.js                       # Logique JavaScript (optionnel)
```

### Exemple : Section "Testimonials"

- `sections/testimonials.liquid`
- `assets/section-testimonials.css`
- JavaScript → `assets/global.js` (fonction `initTestimonials()`)

---

## 1. Créer le fichier Liquid

### Structure basique

```liquid
{% stylesheet %}
  @import url("{{ 'section-nom-de-la-section.css' | asset_url }}");
{% endstylesheet %}

<div class="section-nom-de-la-section" {{ block.shopify_attributes }}>
  <!-- Contenu ici -->
</div>

{% schema %}
{
  "name": "Nom de la section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Titre",
      "default": "Mon titre"
    }
  ],
  "presets": [
    {
      "name": "Nom de la section"
    }
  ]
}
{% endschema %}
```

### Points importants

1. **Importer le CSS** via `@import url()` dans un `{% stylesheet %}` tag
2. **Nommer les classes** avec le préfixe de la section : `.section-nom-de-la-section`
3. **Utiliser `{{ block.shopify_attributes }}`** sur le wrapper principal
4. **Toujours inclure un `{% schema %}`** même minimal

---

## 2. Utiliser les Variables CSS du thème

### Typographies

```liquid
<h1>Mon titre</h1>      <!-- Utilise automatiquement --typo-h1--size -->
<h2>Sous-titre</h2>     <!-- Utilise automatiquement --typo-h2--size -->
<p>Paragraphe</p>       <!-- Utilise automatiquement --typo-p--size -->
```

Les variables CSS disponibles :
- `--typo-h1--size`, `--typo-h2--size`, ..., `--typo-h6--size`
- `--typo-p--size`
- `--typo-heading--letter-spacing`, `--typo-body--letter-spacing`

**Important** : Ne PAS définir de tailles de police dans le CSS de la section. Les balises HTML héritent automatiquement des styles.

### Couleurs

```css
.section-mon-section {
  background-color: var(--color-bg-primaire);
  color: var(--color-text-primaire);
}

.section-mon-section__btn {
  background-color: var(--color-bg-secondaire);
}

.section-mon-section__btn:hover {
  background-color: var(--color-bg-secondaire-hover);
}
```

Variables disponibles :
- `--color-bg-primaire`, `--color-text-primaire`
- `--color-bg-secondaire`, `--color-text-secondaire`
- `--color-bg-secondaire-hover`, `--color-text-secondaire-hover`
- `--color-foreground`, `--color-background` (natives Shopify)

### Border Radius

```css
.section-mon-section__btn {
  border-radius: var(--rounded--size);
}

.section-mon-section__card {
  border-radius: var(--rounded--size);
}
```

Variable : `--rounded--size` (vient de `settings.border_radius`)

### Marges et Gaps

```css
.section-mon-section {
  margin-top: 40px;
  margin-bottom: 40px;
}

.section-mon-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
```

---

## 3. Créer le fichier CSS

### Exemple : `assets/section-testimonials.css`

```css
.section-testimonials {
  padding: 40px 20px;
  background-color: #f9f9f9;
}

.section-testimonials__title {
  margin-bottom: 30px;
  text-align: center;
}

.section-testimonials__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.section-testimonials__card {
  background: white;
  padding: 20px;
  border-radius: var(--rounded--size);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-testimonials__text {
  margin-bottom: 15px;
  line-height: 1.6;
}

.section-testimonials__author {
  font-weight: 600;
  color: var(--color-bg-primaire);
}

/* Responsive */
@media (max-width: 750px) {
  .section-testimonials {
    padding: 20px 10px;
  }

  .section-testimonials__grid {
    grid-template-columns: 1fr;
  }
}
```

### Conventions CSS

1. **Nommer avec BEM** : `.section-nom__element--modifier`
2. **Utiliser les variables CSS** pour les couleurs et espacements
3. **Mobile-first** : styles de base pour mobile, media queries pour desktop
4. **Pas d'IDs** : utiliser les classes
5. **Préfixer toutes les classes** avec `.section-nom-de-la-section`

---

## 4. Ajouter du JavaScript (optionnel)

Si tu as besoin de JavaScript, ajoute une fonction dans `assets/global.js` :

```javascript
// Dans global.js
function initTestimonials() {
  const carousels = document.querySelectorAll('.section-testimonials [data-carousel]');

  carousels.forEach(carousel => {
    // Logique du carousel
    console.log('Carousel initialized', carousel);
  });
}

// Appeler la fonction au chargement
document.addEventListener('DOMContentLoaded', initTestimonials);
```

Dans le Liquid, utiliser des attributs `data-*` :

```liquid
<div class="section-testimonials__carousel" data-carousel>
  <!-- Contenu -->
</div>
```

### Points importants

1. **Une seule fonction par section** : `initNomDeLaSection()`
2. **Utiliser les sélecteurs `data-*`** pour cibler les éléments
3. **Pas de librairies externes** sauf Alpine.js ou Swiper
4. **Vanille JS** autant que possible

---

## 5. Exemple complet : Section "Promo Banner"

### `sections/promo-banner.liquid`

```liquid
{% stylesheet %}
  @import url("{{ 'section-promo-banner.css' | asset_url }}");
{% endstylesheet %}

<div class="section-promo-banner" style="
  margin-top: {{ section.settings.margin_top }}px;
  margin-bottom: {{ section.settings.margin_bottom }}px;
" {{ block.shopify_attributes }}>
  <div class="section-promo-banner__content">
    <h2 class="section-promo-banner__title">{{ section.settings.title }}</h2>
    <p class="section-promo-banner__description">{{ section.settings.description }}</p>
    <a href="{{ section.settings.button_link }}" class="btn btn-primaire">
      {{ section.settings.button_text }}
    </a>
  </div>
</div>

{% schema %}
{
  "name": "Promo Banner",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Titre",
      "default": "Promotion spéciale"
    },
    {
      "type": "textarea",
      "id": "description",
      "label": "Description",
      "default": "Profitez de notre offre limitée"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Texte du bouton",
      "default": "En savoir plus"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Lien du bouton"
    },
    {
      "type": "range",
      "id": "margin_top",
      "label": "Marge top",
      "default": 40,
      "min": 0,
      "max": 100,
      "step": 10,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "margin_bottom",
      "label": "Marge bottom",
      "default": 40,
      "min": 0,
      "max": 100,
      "step": 10,
      "unit": "px"
    }
  ],
  "presets": [
    {
      "name": "Promo Banner"
    }
  ]
}
{% endschema %}
```

### `assets/section-promo-banner.css`

```css
.section-promo-banner {
  background: linear-gradient(135deg, var(--color-bg-primaire), var(--color-bg-secondaire));
  padding: 60px 20px;
  text-align: center;
  border-radius: var(--rounded--size);
}

.section-promo-banner__content {
  max-width: 600px;
  margin: 0 auto;
}

.section-promo-banner__title {
  color: white;
  margin-bottom: 20px;
}

.section-promo-banner__description {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  line-height: 1.6;
}

.section-promo-banner .btn {
  margin-top: 20px;
}

@media (max-width: 750px) {
  .section-promo-banner {
    padding: 40px 15px;
  }

  .section-promo-banner__title {
    font-size: 1.5rem;
  }
}
```

---

## 6. Bonnes pratiques généralistes

### ✅ À FAIRE

- ✅ Importer le CSS dans le Liquid
- ✅ Utiliser les variables CSS du thème
- ✅ Respecter la nomenclature BEM
- ✅ Préfixer les classes avec le nom de la section
- ✅ Ajouter des settings margin-top/bottom
- ✅ Utiliser `{{ block.shopify_attributes }}`
- ✅ Mobile-first en CSS
- ✅ Utiliser des boutons avec `.btn .btn-primaire` etc.

### ❌ À NE PAS FAIRE

- ❌ Définir les tailles des H1, H2, P directement en CSS
- ❌ Utiliser des couleurs en dur (ex: `#FF0000`)
- ❌ Oublier le `@import` du CSS
- ❌ Utiliser des IDs à la place des classes
- ❌ Ne pas préfixer les classes
- ❌ Ajouter des scripts `<script>` directement dans le Liquid
- ❌ Utiliser des marges/paddings arbitraires sans lien avec le design system

---

## 7. Variables CSS disponibles (récapitulatif)

### Typographies
- `--typo-h1--size` → H1
- `--typo-h2--size` → H2
- `--typo-h3--size` → H3
- `--typo-h4--size` → H4
- `--typo-h5--size` → H5
- `--typo-h6--size` → H6
- `--typo-p--size` → Paragraphes
- `--typo-heading--letter-spacing`
- `--typo-body--letter-spacing`

### Couleurs
- `--color-bg-primaire` / `--color-text-primaire`
- `--color-bg-secondaire` / `--color-text-secondaire`
- `--color-bg-secondaire-hover` / `--color-text-secondaire-hover`
- `--color-foreground` / `--color-background` (Shopify natif)

### Layout
- `--rounded--size` → Border radius
- `--page-width` → Largeur max de la page
- `--page-margin-desktop` / `--page-margin-mobile` → Marges de page

### Autres
- `--gap-sm`, `--gap-md`, `--gap-lg` → Gaps pour grids
- `--padding-sm`, `--padding-md`, `--padding-lg` → Paddings

---

## Questions fréquentes

**Q: Où mettre le CSS?**
A: Dans `assets/section-nom.css` et l'importer via `@import url()` dans un `{% stylesheet %}` tag du Liquid.

**Q: Où mettre le JavaScript?**
A: Dans `assets/global.js` en tant que fonction nommée `initNomDeLaSection()`.

**Q: Puis-je utiliser Tailwind dans le Liquid?**
A: Oui! Tailwind est disponible. Mais préfère les variables CSS du thème pour la cohérence.

**Q: Comment faire un carousel?**
A: Utilise Swiper.js comme dans `snippets/upsell-product-page.liquid` ou Alpine.js pour quelque chose de simple.

**Q: Les settings doivent-ils toujours avoir margin-top/bottom?**
A: Oui, c'est une bonne pratique pour permettre une meilleure flexibilité.

---

## Ressources du projet

- Variables CSS → `snippets/css-variables.liquid`
- Styles d'application (typo, boutons) → `snippets/typographie.liquid`
- Base CSS → `assets/base.css`
- Tailwind → Natif au thème

---

**Version**: 1.0
**Dernière mise à jour**: 2026-03-16
