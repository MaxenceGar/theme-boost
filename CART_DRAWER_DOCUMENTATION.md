# Cart Drawer Documentation

## 📋 Overview

Le **Cart Drawer** (Tiroir du Panier) est un composant modal qui affiche le contenu du panier Shopify en tant que drawer glissant depuis la droite. C'est un système complet basé sur les **Web Components** qui gère l'affichage dynamique, les animations, l'accessibilité et les modules supplémentaires.

### Structure Principale
```
Cart Drawer
├── sections/cart-drawer.liquid (section - point d'entrée)
├── snippets/cart-drawer.liquid (template HTML/Liquid)
├── assets/cart-drawer.js (logique principale)
├── assets/cart-drawer-note.js (gestion des notes)
└── assets/cart-drawer.css (styles)
```

---

## 🏗️ Architecture

### 1. Web Components Utilisés

#### `<cart-drawer>` - Composant Principal
- **Classe**: `CartDrawerSection` (extends `HTMLElement`)
- **Responsabilités**:
  - Gestion de l'ouverture/fermeture du drawer
  - Gestion du focus et de l'accessibilité
  - Animations des éléments du panier
  - Rafraîchissement du contenu via AJAX
  - Gestion des événements clavier (Escape, Tab)
  - Calculs et animations des valeurs monétaires

**États et attributs**:
```javascript
- open: booléen - indique si le drawer est ouvert
- data-cart-type: "drawer" ou "page"
- data-toggle-tabindex: sélecteurs CSS pour gérer le focus
- data-motion-intensity: "balanced", "aggressive", ou "off"
```

#### `<cart-drawer-items>` - Composant des Éléments
- **Classe**: `CartDrawerItems` (extends `CartItems`)
- **Responsabilités**:
  - Gère les mises à jour des articles du panier
  - Rafraîchit les sections spécifiques
  - Rediriger les mises à jour vers le parent `<cart-drawer>`

#### `<drawer-cart-note>` - Composant des Notes
- **Classe**: `DrawerCartNote` (extends `HTMLElement`)
- **Responsabilités**:
  - Gestion du modal des notes de commande
  - Sauvegarde des notes via l'API Shopify
  - Gestion du focus dans le modal
  - Clôture au clic sur overlay ou Escape

---

## 🎨 Template Liquid (snippets/cart-drawer.liquid)

### Structure HTML

```liquid
<cart-drawer>
  <div class="page-overlay-cart"></div>  <!-- Fond gris/noir -->

  <div id="CartDrawer" class="cart-drawer">
    <!-- HEADER -->
    <header class="wt-cart__drawer__header">
      <div id="CartDrawer-TotalQty">{{ 'sections.cart.title' | t }}</div>
      <button class="wt-cart__drawer__close">❌</button>
    </header>

    <!-- BODY -->
    <div class="wt-cart__drawer__body">
      <!-- Pre-items modules (Free Shipping Bar, Urgency, Milestones) -->
      <div class="wt-cart__drawer__module-slot--pre-items">
        {% if settings.drawer_module_progress %}
          {% render 'cart-free-shipping-bar' %}
        {% endif %}
      </div>

      <!-- Cart Items -->
      <cart-drawer-items>
        <form id="CartDrawer-Form" action="{{ routes.cart_url }}" method="post">
          <div id="CartDrawer-CartItems" class="js-contents">
            {% if cart != empty %}
              <ul class="wt-cart__list">
                {% for item in cart.items %}
                  {% render 'cart-item', item: item %}
                {% endfor %}
              </ul>
            {% else %}
              {% render 'cart-empty' %}
            {% endif %}
          </div>
        </form>
      </cart-drawer-items>

      <!-- Post-items modules (Cross-sell, Addons) -->
      <div class="wt-cart__drawer__module-slot--post-items"></div>
    </div>

    <!-- FOOTER (si panier non vide) -->
    <footer class="wt-cart__drawer__footer">
      <!-- Note, Checkbox -->
      {% render 'cart-footer' %}
    </footer>
  </div>
</cart-drawer>
```

### Variables de Thème
Le snippet configure les CSS custom properties pour la typographie et les couleurs:

| Variable | Par défaut | Description |
|----------|-----------|-------------|
| `--drawer-mobile-title-size` | 13px | Taille du titre des articles |
| `--drawer-mobile-title-weight` | 600 | Poids du titre |
| `--drawer-mobile-price-size` | 15px | Taille du prix |
| `--drawer-item-price-regular-color` | #1A3B5C | Couleur prix normal |
| `--drawer-item-price-sale-color` | #2E9E57 | Couleur prix en solde |
| `--drawer-motion-scale` | 1 ou 0-1.5 | Intensité des animations |

---

## ⚙️ JavaScript - CartDrawerSection (cart-drawer.js)

### Cycle de Vie

```javascript
constructor()
  ↓
connectedCallback()
  ↓
init()
  ├─ Gestion des événements clavier
  ├─ Attachement des listeners de clic
  └─ Gestion du sous/focus
```

### Méthodes Principales

#### Contrôle du Drawer

| Méthode | Description |
|---------|-------------|
| `toggleDrawerClasses()` | Bascule l'état ouvert/fermé et applique les classes CSS |
| `onToggle()` | Gère l'attribut `open` et le focus |
| `init()` | Initialise les event listeners |

**Exemple d'utilisation**:
```javascript
// L'utilisateur clique sur le trigger
trigger.addEventListener("click", (e) => {
  e.preventDefault();
  drawer.toggleDrawerClasses(); // Ouvre/Ferme
});
```

#### Gestion du Contenu (AJAX)

| Méthode | Description |
|---------|-------------|
| `refreshCartDrawer(event)` | Récupère et rafraîchit le drawer et l'icône du panier |
| `renderContents(parsedState, isClosedCart)` | Remplace le HTML du drawer avec le nouvel état |
| `getSectionInnerHTML(html, selector)` | Parse le HTML retourné |
| `refreshSectionsInPlace()` | Rafraîchit sans fermer le drawer |

**Flux de rafraîchissement**:
```
User action (add to cart)
  ↓
cart update event
  ↓
refreshCartDrawer()
  ↓
fetch("/?sections=cart-drawer,cart-icon-bubble")
  ↓
renderContents() - met à jour le DOM
  ↓
applyDrawerMotion() - déclenche les animations
```

#### Animations

| Méthode | Effet |
|---------|-------|
| `applyItemStagger()` | Stagger d'entrée des articles au clic sur le trigger |
| `animateHeaderCounter(prevCount)` | Animation du compteur du panier (bounce + flip) |
| `animateSubtotal(prevSubtotal)` | Compte jusqu'au nouveau subtotal |
| `animateFreeShipping(prevProgress, prevRemaining)` | Barre de progression avec animation |
| `triggerShippingConfetti(prevProgress)` | Lance confetti quand la livraison gratuite est atteinte |
| `applyDrawerMotion(prevCount, nextCount)` | Pulse sur les totaux + highlight nouvel article |

**Paramètres de motion**:
```javascript
drawer_motion_intensity:
  - "balanced" (défaut): scale = 1, duration = 1
  - "aggressive": scale = 1.5, duration = 1.15
  - "off": scale = 0, duration = 0
```

#### Gestion du Focus & Accessibilité

| Méthode | Description |
|---------|-------------|
| `getFocusableElements()` | Retourne les éléments focusables (buttons, links, inputs) |
| `setTabindex(elements, value)` | Modifie tabindex pour les éléments (contrôle le focus) |
| `temporaryHideFocusVisible()` | Cache les focus rings lors de la fermeture |

**Piègeage du focus**:
```javascript
init() {
  this.addEventListener("keydown", (e) => {
    if (isTabPressed) {
      // Si on atteint le dernier élément focusable
      if (!e.shiftKey && document.activeElement === last) {
        first.focus(); // Retour au premier
        e.preventDefault();
      }
    }
  });
}
```

#### Gestion des Add-ons

| Méthode | Description |
|---------|-------------|
| `handleAddonSubmit(event)` | Gère l'ajout d'un produit addon |
| `animateAddButtonState(button, state)` | Anime le bouton (loading, success, idle) |
| `animateAddonCardOut(card)` | Anime la suppression d'une carte addon |

**États du bouton**:
- `"loading"`: spinner visible, bouton désactivé
- `"success"`: texte "Added", puis retour à l'état normal
- `"idle"`: état initial

#### Utilitaires

| Méthode | Description |
|---------|-------------|
| `getHeaderCounterValue()` | Récupère le nombre d'articles du header |
| `getSubtotalCents()` | Récupère le sous-total en centimes |
| `getFreeShippingProgress()` | Récupère le % de progression livraison gratuite |
| `handleDrawerMouseMove(event)` | Suit la position de la souris pour les effets parallax |
| `countMoneyValue(node, fromCents, toCents, duration)` | Anime le changement de valeur monétaire |

---

## 🎯 Interactions Utilisateur

### 1. Ouvrir le Drawer
```
Click sur .wt-cart__trigger (icône panier)
  ↓
trigger.addEventListener("click") déclenché
  ↓
toggleDrawerClasses()
  ├─ classList.add("wt-cart__drawer--open")
  ├─ body.classList.add("page-overlay-cart-on")
  ├─ applyItemStagger() - anime l'entrée des articles
  └─ dispatch PUB_SUB_EVENTS.cartDrawerOpen
```

### 2. Fermer le Drawer
```
Click sur .wt-cart__drawer__close (❌) OU Escape
  ↓
toggleDrawerClasses()
  ├─ classList.remove("wt-cart__drawer--open")
  ├─ body.classList.remove("page-overlay-cart-on")
  └─ dispatch PUB_SUB_EVENTS.cartDrawerClose
```

### 3. Ajouter au Panier
```
User submits form sur product page
  ↓
cart.js dispatche PUB_SUB_EVENTS.cartUpdate
  ↓
CartDrawerItems.onCartUpdate()
  ↓
drawer.refreshCartDrawer()
  ↓
renderContents() + applyDrawerMotion()
  ↓
- Nouvel article: classe "wt-cart-line--new-gold" + animation
- Compteur du header: bump + flip animation
- Subtotal: compte jusqu'à la nouvelle valeur
```

### 4. Modifier la Quantité
```
User change quantity dans le drawer
  ↓
cart-items.js dispatche l'événement de mise à jour
  ↓
Même flux que "Ajouter au Panier"
```

### 5. Ajouter une Note
```
Click .giftnote__drawercart__addnote
  ↓
DrawerCartNote.onToggle()
  ├─ Modal apparaît
  ├─ Focus trap activé
  └─ textarea prêt à être saisi

User tape + click Save
  ↓
fetch(routes.cart_update_url, { note: "..." })
  ↓
onToggle() - ferme le modal
```

---

## 🎨 CSS - Structure et Classes

### Classes Principales

| Classe | Rôle |
|--------|------|
| `.wt-cart__drawer` | Conteneur du drawer |
| `.wt-cart__drawer--open` | État ouvert (ajoutée dynamiquement) |
| `.wt-cart__drawer__header` | Section titre + bouton fermeture |
| `.wt-cart__drawer__body` | Zone de contenu scrollable |
| `.wt-cart__drawer__footer` | Section des totaux et CTA |
| `.page-overlay-cart` | Fond d'overlay |
| `.page-overlay-cart-on` | Sur body quand drawer est ouvert |
| `.wt-cart__drawer--item-added` | Classe pour motion lors ajout d'article |
| `.wt-cart__drawer--item-removed` | Classe pour motion lors suppression |

### Animations CSS

| Animation | Déclencheur |
|-----------|-------------|
| `wt-cart-item--stagger-in` | Appliquée sur `.wt-cart__item` avec délai via `--wt-cart-item-index` |
| `wt-cart-counter--bounce` | Compteur du header qui saute |
| `wt-cart-counter--flip-up` | Compteur change de nombre (flip) |
| `wt-cart-subtotal--updating` | Subtotal pulse lors mise à jour |
| `wt-progress-bar__fill--animate` | Barre de shipping glisse |
| `wt-progress-bar__fill--complete` | Barre de shipping 100% complete |
| `wt-cart-line--enter` | Nouvel article coulisse |
| `wt-cart-line--new-gold` | Fond doré sur nouvel article |

### Responsive

```css
/* Mobile (< 600px) */
.page-overlay-cart-on > * {
  opacity: 0; /* Masque tout sauf le drawer */
}

/* Desktop */
.wt-cart__drawer {
  width: 100%;
  max-width: 50rem; /* Max 800px */
}

/* RTL Support */
[dir=rtl] .wt-cart__drawer {
  left: 0;
  right: auto;
  transform: translateX(-100%);
}
```

---

## 🔌 Modules et Intégrations

### Modules Optionnels (Slot-based)

Le drawer supporte plusieurs modules optionnels contrôlés par les settings:

#### Pre-Items (avant la liste du panier)
```liquid
{% if settings.drawer_module_progress and settings.enable_free_shipping_bar %}
  {% render 'cart-free-shipping-bar' %}
{% endif %}

{% if settings.drawer_module_urgency %}
  {% render 'cart-urgency' %}
{% endif %}

{% if settings.drawer_gift_milestones_enable %}
  {% render 'cart-gift-milestones' %}
{% endif %}
```

#### Post-Items (après la liste du panier)
```liquid
{% if settings.enable_cross_sells %}
  {% render 'cart-cross-sell' %}
{% endif %}

{% if settings.drawer_module_addons %}
  {% render 'cart-addons' %}
{% endif %}
```

#### Footer
```liquid
{% if settings.cart_show_additional_service %}
  {% render 'cart-checkbox' %}
{% endif %}

{% if settings.cart_show_order_note %}
  {% render 'cart-note' %}
{% endif %}

{% render 'cart-footer' %} <!-- Totals + CTA -->
```

### Scripts Conditionnels
Selon les settings, des scripts supplémentaires sont chargés:
```liquid
{% if enable_cross_sells or drawer_module_addons %}
  <script src="{{ 'quick-add.js' | asset_url }}" defer></script>
  <script src="{{ 'product-form.js' | asset_url }}" defer></script>
{% endif %}
```

### Pub/Sub Events
Le drawer écoute/dispatche des événements via un système de pub/sub:

```javascript
// Événements écoutés
PUB_SUB_EVENTS.cartUpdate          // Mise à jour du panier
PUB_SUB_EVENTS.cartDrawerOpen      // Drawer ouvert
PUB_SUB_EVENTS.cartDrawerClose     // Drawer fermé

// Événements dispatché
document.dispatchEvent(new CustomEvent(PUB_SUB_EVENTS.cartDrawerOpen))
```

### Confetti API
Quand la livraison gratuite est atteinte:
```javascript
window.confetti({
  particleCount: 80,
  spread: 60,
  colors: ["#E8C96A", "#1A3B5C", "#FFFFFF"],
  shapes: ["circle", "square"],
})
```
Loaded depuis: `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js`

---

## 📱 Accessibility (A11y)

### ARIA Attributes
```html
<div role="dialog"
     aria-modal="true"
     aria-label="{{ 'sections.cart.title' | t }}"
     tabindex="-1">
  ...
</div>
```

### Live Regions
```html
<p id="CartDrawer-LiveRegionText"
   class="visually-hidden"
   role="status"></p>

<p id="CartDrawer-LineItemStatus"
   role="status"
   aria-hidden="true">{{ 'accessibility.loading' | t }}</p>
```

### Focus Management
- **Focus trap**: Tab/Shift+Tab boucle entre premier et dernier élément focusable
- **Restauration**: Le focus retourne au trigger après fermeture
- **Escape**: Ferme le drawer

### Prefers Reduced Motion
```javascript
this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

isMotionAllowed() {
  return !this.prefersReducedMotion.matches;
}

// Les animations sont désactivées si l'utilisateur préfère moins de mouvement
if (!this.isMotionAllowed()) return; // Skip l'animation
```

---

## 🐛 DrawerCartNote (cart-drawer-note.js)

Gère le modal pour ajouter une note à la commande.

### Web Component: `<drawer-cart-note>`

```javascript
class DrawerCartNote extends HTMLElement {
  connectedCallback()
    ↓
  init()
    ├─ Attach click listeners sur triggers
    └─ Setup keyboard handlers
}
```

### Triggers
```html
<button class="giftnote__drawercart__addnote">Add Note</button>
<button class="giftnote__body__close">Close</button>
<div class="giftnote__overlay"></div>
```

### Sauvegarde
```javascript
fetch(routes.cart_update_url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ note: "User's note" })
});
```

### Focus Trap dans le Modal
- Même pattern que le drawer principal
- Trap focus dans `.giftnote__body`
- Escape ferme le modal

---

## 🔄 Flow Complet: Ajouter au Panier

```mermaid
1. User clicks "Add to Cart" on product page
   ↓
2. product-form.js validates and submits form
   ↓
3. cart.js fetches /cart/add.js (AJAX)
   ↓
4. cart.js publishes PUB_SUB_EVENTS.cartUpdate
   ↓
5. CartDrawerItems.onCartUpdate() listens
   ↓
6. Calls drawer.refreshCartDrawer()
   ↓
7. Fetches /?sections=cart-drawer,cart-icon-bubble
   ↓
8. renderContents() replaces DOM
   ↓
9. applyDrawerMotion() adds animation classes
   ↓
10. CSS animations run:
    - New item gets .wt-cart-line--new-gold
    - Header counter bounces & flips
    - Subtotal animates to new value
    - Free shipping bar progresses
    - If 100% reached: confetti! 🎉
```

---

## 🚀 Performance Considerations

### Optimisations Implémentées

1. **Debounce sur mousemove**: Les mises à jour de position souris sont limitées à chaque 24ms
   ```javascript
   if (now - this.lastMouseMoveTick < 24) return;
   ```

2. **RequestAnimationFrame**: Toutes les animations utilisent rAF pour une sync avec le navigateur
   ```javascript
   requestAnimationFrame(() => {
     items.forEach(item => item.classList.add("wt-cart-item--stagger-in"));
   });
   ```

3. **CSS Containment**: `.wt-cart__drawer` a `contain: layout style;` pour isoler le rendering

4. **Lazy-load confetti**: Script de confetti est chargé au démarrage mais utilisé que si libre shipping atteint

5. **debounce sur cart-note**: Les saves sont debounced à 800ms pour éviter trop de requêtes

### Points à Surveiller

- **Panier très grand**: Beaucoup d'articles = beaucoup d'animations staggered
- **Animations motrices**: Les animations sont désactivées si `prefers-reduced-motion`
- **Sections conditionnelles**: Les modules supplémentaires chargent des scripts supplémentaires

---

## 🎓 Exemples d'Utilisation

### Ouvrir le drawer via JavaScript
```javascript
const drawer = document.querySelector('cart-drawer');
drawer.toggleDrawerClasses();
```

### Écouter les événements
```javascript
document.addEventListener(PUB_SUB_EVENTS.cartDrawerOpen, () => {
  console.log('Drawer opened!');
});

document.addEventListener(PUB_SUB_EVENTS.cartDrawerClose, () => {
  console.log('Drawer closed!');
});

document.addEventListener(PUB_SUB_EVENTS.cartUpdate, () => {
  console.log('Cart updated!');
});
```

### Forcer un rafraîchissement
```javascript
document.dispatchEvent(new CustomEvent('cart-drawer:refresh'));
```

### Vérifier si ouvert
```javascript
const isOpen = document.querySelector('cart-drawer').isOpen;
console.log(isOpen); // true ou false
```

---

## 📝 Résumé des Settings

| Setting | Type | Description |
|---------|------|-------------|
| `cart_type` | string | "drawer" ou "page" |
| `cart_drawer_motion_intensity` | select | "balanced", "aggressive", "off" |
| `drawer_module_progress` | checkbox | Afficher free shipping bar |
| `drawer_module_urgency` | checkbox | Afficher urgency (low stock) |
| `drawer_module_addons` | checkbox | Afficher addons |
| `drawer_module_upsell` | checkbox | Afficher cross-sell |
| `enable_cross_sells` | checkbox | Fallback pour drawer_module_upsell |
| `enable_free_shipping_bar` | checkbox | Fallback pour drawer_module_progress |
| `cart_show_order_note` | checkbox | Afficher bouton ajout note |
| `cart_show_additional_service` | checkbox | Afficher checkbox service |
| `drawer_mobile_item_*_size` | range | Taille texte (title, price, meta, qty) |
| `drawer_mobile_item_*_weight` | range | Poids texte |
| `drawer_mobile_item_*_font` | select | Police texte |
| `drawer_item_price_*_color` | color | Couleurs prix (regular, compare, sale) |

---

## 🎯 Conclusion

Le **Cart Drawer** est un système complet et sophistiqué qui:
- ✅ Fournit une expérience utilisateur fluide avec animations
- ✅ Gère l'accessibilité (focus trap, ARIA, live regions)
- ✅ Respecte les préférences de mouvement de l'utilisateur
- ✅ Est extensible via des modules slot-based
- ✅ Offre une personnalisation via settings
- ✅ Utilise les Web Components pour une architecture moderne
- ✅ Optimise les performances avec debounce et RAF
