# Cart Drawer Architecture

## 📐 Structure Finale (Nettoyée)

```
🎯 POINT D'ENTRÉE UNIQUE
├─ sections/cart-drawer.liquid (39 KB)
│  ├─ Section Shopify complète
│  ├─ Contient {% schema %} avec tous les settings
│  ├─ Logique Liquid (conditions, boucles, variables)
│  └─ Scripts + CSS chargés directement
│
📦 MODULES SPÉCIFIQUES (snippets)
├─ snippets/palier-cart-drawer.liquid
│  └─ Composant barre de progression (tiered benefits)
│
📄 AUTRES SNIPPETS
├─ snippets/cart-notification.liquid
│
🎨 STYLES (assets)
├─ component-cart-drawer.css ← Styles drawer principal
├─ component-cart-items.css
├─ component-cart.css
├─ component-palier-cart-drawer.css ← Styles palier
└─ component-cart-notification.css
│
⚙️ JAVASCRIPT (assets)
├─ cart.js ← API cart (add/remove/update)
├─ cart-drawer.js ← Logique drawer principal
├─ cart-drawer-blocks-preserver.js ← Préserve les blocks lors AJAX
├─ palier-cart-drawer.js ← Custom Element <palier-cart-drawer>
└─ cart-notification.js
│
📝 CHARGEMENT GLOBAL
└─ layout/theme.liquid
   ├─ {{ 'palier-cart-drawer.js' | asset_url | script_tag }}
   └─ Autres assets globaux
```

---

## 🔄 Flux de Rendu

### Initial Page Load
```
1. Visiteur arrive sur le site
   ↓
2. theme.liquid charge les scripts globaux
   ├─ palier-cart-drawer.js (Custom Element register)
   └─ cart-drawer.js (drawer logic)
   ↓
3. Section cart-drawer.liquid rendue
   ├─ Liquid évalue les conditions (cart.empty?, settings, blocks)
   ├─ Rendu du HTML statique
   ├─ Palier rendu directement (pas un block)
   └─ Styles + scripts spécifiques chargés
   ↓
4. Custom Element <palier-cart-drawer> initialise
   └─ connectedCallback() → lit data attributes → met à jour la barre
```

### AJAX Cart Update (Add/Remove/Update Quantity)
```
1. User action (add to cart, change qty, etc.)
   ↓
2. cart.js → fetch /cart/add.js (AJAX)
   ↓
3. PUB_SUB publish cartUpdate event
   ↓
4. cart-drawer.js listen → renderContents()
   ├─ fetch /?sections=cart-drawer
   ├─ Parse nouvelle section HTML
   └─ this.querySelector('#CartDrawer').innerHTML = newHTML
   ↓
5. cart-drawer-blocks-preserver.js hook
   ├─ Sauvegarde blocks avant le refetch
   ├─ Crée wrapper si absent
   └─ Réinsère les blocks
   ↓
6. <palier-cart-drawer> re-initialise
   └─ connectedCallback() → nouvelle barre animée
```

---

## ⚙️ Settings de la Section

La section `cart-drawer.liquid` configure via `{% schema %}` :

### Apparence Globale
- `cart_bg` - Couleur fond drawer
- `cart_padding` - Padding interne
- `cart_radius` - Border radius
- `drawer_width` - Largeur (en rem)
- `cart_color_scheme` - Schéma couleur

### Bouton Checkout
- `checkout_btn_bg` - Couleur fond
- `checkout_btn_text` - Couleur texte
- `checkout_btn_radius` - Border radius

### Items du Panier
- `cart_image_size` - Taille images produits (px)
- `cart_item_gap` - Espacement entre items (px)

### Mode Preview
- `preview_mode` - Activer le mode preview
- `preview_product` - Produit à afficher

---

## 🧩 Palier d'Avantages

### Architecture
- **Rendu** : Directement dans `sections/cart-drawer.liquid` (PAS un block)
- **Raison** : Assure la persistance lors des AJAX updates
- **Custom Element** : `<palier-cart-drawer>` défini dans `assets/palier-cart-drawer.js`
- **Styles** : `assets/component-palier-cart-drawer.css`

### Configuration
Settings dans `sections/cart-drawer.liquid` schema :
```
palier_enable - Activer/désactiver
palier_1_amount - Montant palier 1 (€)
palier_1_text - Texte palier 1
palier_1_icon - Icône palier 1 (image)
palier_2_amount - Montant palier 2 (€)
palier_2_text - Texte palier 2
palier_2_icon - Icône palier 2 (image)
palier_bar_color - Couleur barre
```

### Flux
```
Liquid (sections/cart-drawer.liquid)
  ├─ Calcule progress % et montants
  ├─ Render <palier-cart-drawer data-cart-total="..." data-max-amount="...">
  └─ Rendu HTML statique (message, barre, cercles, labels)

JavaScript (assets/palier-cart-drawer.js)
  ├─ connectedCallback() → lit data attributes
  ├─ Calcule % de progression
  └─ Applique width via requestAnimationFrame

CSS (assets/component-palier-cart-drawer.css)
  ├─ Layout (flexbox, positioning)
  ├─ Styles barre + cercles + labels
  └─ Transition animation (width 400ms)
```

---

## 🚀 Blocks Modulables (Optionnels)

Zones du drawer où ajouter des blocks éditables :

### ZONE HEADER (avant items)
```
Blocks disponibles:
├─ announcement_bar - Banneau d'annonce
├─ timer - Compteur d'urgence
├─ text - Texte personnalisé
└─ divider - Séparateur
```

### ZONE FOOTER (après items)
```
Blocks disponibles:
├─ upsell-product-page - Produits upsell
├─ reassurance - Badges de rassurance
└─ divider - Séparateur
```

Ces blocks sont **préservés lors des AJAX updates** grâce à `cart-drawer-blocks-preserver.js`.

---

## 🔧 Points d'Extension

### Ajouter une nouvelle fonctionnalité

**Option 1 : Via Settings (recommandé)**
```liquid
<!-- sections/cart-drawer.liquid schema -->
{
  "type": "checkbox",
  "id": "my_feature_enable",
  "label": "Activer ma feature"
}

<!-- Dans la section -->
{% if section.settings.my_feature_enable %}
  ... ma feature ...
{% endif %}
```

**Option 2 : Via Block**
```liquid
<!-- Dans ZONE HEADER ou FOOTER -->
{% when 'my_block_type' %}
  ... mon block ...
```

**Option 3 : Via JavaScript Custom Element**
```javascript
// assets/my-feature.js
class MyFeature extends HTMLElement { ... }
customElements.define('my-feature', MyFeature);

// Dans theme.liquid
{{ 'my-feature.js' | asset_url | script_tag }}
```

---

## ✅ Checklist Architecture

- ✅ Pas de redondance (ancien snippet supprimé)
- ✅ Point d'entrée unique (`sections/cart-drawer.liquid`)
- ✅ Modules spécifiques bien séparés (`palier-cart-drawer.liquid`)
- ✅ Assets organisés (CSS + JS par composant)
- ✅ AJAX update préserve les blocks
- ✅ Extensible via settings, blocks, ou custom elements
- ✅ Production-ready

---

## 📝 Résumé

| Aspect | Avant | Après |
|--------|-------|-------|
| Fichiers cart-drawer | 2 (section + snippet mort) | 1 (section UNIQUE) |
| Clarté | ❌ Confuse | ✅ Cristalline |
| Redondance | ❌ Code mort | ✅ Zéro doublon |
| Extensibilité | ⚠️ Mitigée | ✅ Claire (settings/blocks/CE) |
| Performance | ✅ Bon | ✅ Identique |

