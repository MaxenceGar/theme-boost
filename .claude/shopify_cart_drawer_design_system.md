# Cart Drawer – Architecture & Design System

## Objectif

Développer un **cart drawer modulaire, minimal et premium** basé sur le thème Dawn.

Le composant doit être :

- Minimal par défaut
- Facilement personnalisable via le schema
- Basé sur des variables CSS
- Compatible avec la logique JS native de Dawn
- Stable et maintenable pour des futurs clients du thème

---

# 1. Philosophie Design

Inspirations : Shrine / EcomElixir

Principes :

- Beaucoup d'espace blanc
- Hiérarchie claire
- Typographie fine et lisible
- Séparations très subtiles
- Aucun effet lourd
- Animations fluides et discrètes

Le cart drawer doit être élégant mais neutre pour pouvoir s’adapter à différents univers de marque.

---

# 2. Architecture Technique

## Structure recommandée

```
/snippets/cart-drawer-header.liquid
/snippets/cart-drawer-items.liquid
/snippets/cart-drawer-summary.liquid
/assets/component-cart-drawer.css
```

Objectif : séparation claire des responsabilités.

⚠️ Ne jamais modifier la logique JavaScript native de Dawn.
⚠️ Conserver les data-attributes Shopify.
⚠️ Travailler uniquement sur le markup et le CSS.

---

# 3. Système de Variables CSS

Toutes les propriétés stylables doivent passer par des CSS custom properties.

Exemple :

```css
:root {
  --cd-bg: {{ settings.cart_bg }};
  --cd-radius: {{ settings.cart_radius }}px;
  --cd-padding: {{ settings.cart_padding }}px;
  --cd-title-size: {{ settings.cart_title_size }}px;
  --cd-text-size: {{ settings.cart_text_size }}px;
  --cd-button-radius: {{ settings.cart_button_radius }}px;
  --cd-separator-color: {{ settings.cart_separator_color }};
}
```

Puis utilisées dans le CSS :

```css
.cart-drawer {
  background: var(--cd-bg);
  border-radius: var(--cd-radius);
  padding: var(--cd-padding);
}
```

---

# 4. Paramètres à exposer dans le Schema

Exemples :

```json
{
  "type": "color",
  "id": "cart_bg",
  "label": "Cart background",
  "default": "#F9F9F7"
},
{
  "type": "range",
  "id": "cart_radius",
  "label": "Cart border radius",
  "min": 0,
  "max": 40,
  "step": 2,
  "default": 16
},
{
  "type": "range",
  "id": "cart_padding",
  "label": "Cart padding",
  "min": 16,
  "max": 48,
  "step": 4,
  "default": 32
}
```

Idées d’options avancées :

- Style bouton (solid / outline)
- Densité (compact / comfortable)
- Afficher / masquer séparateurs
- Arrondi global (sharp / medium / rounded)
- Afficher badge économies

---

# 5. Règles UI par Défaut

## Layout

- Largeur max : 440px
- Padding interne : 32px
- Gap vertical entre items : 24px
- Images produit : 80px, border-radius 12px

## Typographie

- Taille base : 14px
- Line-height : 1.4
- Titres produits : 14px / 500
- Prix : 13px / 400 / opacity 0.7

## Séparations

- 1px rgba(0,0,0,0.05)
- Pas de bordures épaisses

## Bouton Checkout

- Full width
- Hauteur 48px
- Border-radius 12px
- Hover subtil (opacity 0.9)

---

# 6. Structure UX Recommandée

```
[ Header ]
Titre "Panier"
Bouton fermeture discret
Séparation subtile

[ Cart Items ]
Image à gauche
Infos à droite
Supprimer en texte discret

[ Summary ]
Sous-total aligné proprement
Livraison petite ligne secondaire

[ CTA ]
Bouton checkout propre et lisible
```

---

# 7. Animations

Animation ouverture recommandée :

- transform: translateX
- opacity
- transition: 0.3s ease

Aucune animation lourde.

---

# 8. Prompt Idéal à Donner à Claude Code

```
Je développe un thème Shopify basé sur Dawn.
Je veux refactor le cart drawer en système modulaire configurable via schema.

Contraintes :
- Utiliser CSS custom properties
- Ne pas modifier la logique JS Shopify
- Conserver les data attributes
- Optimiser performance

Propose :
1. Nouvelle structure markup propre
2. CSS complet basé sur variables
3. Schema settings configurables
```

---

# Objectif Final

Créer un cart drawer :

- Premium par défaut
- Flexible pour différents marchands
- Facilement personnalisable
- Stable techniquement
- Propre et maintenable

Ce composant doit refléter un vrai niveau "Shopify Theme Store ready".

