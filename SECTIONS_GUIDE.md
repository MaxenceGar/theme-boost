# Guide — Création de sections Shopify

Référence : `sections/section-gauche-droite.liquid` + `assets/section-gauche-droite.css`

---

## Structure d'une section

```
sections/
  ma-section.liquid      ← HTML + Liquid + schema
assets/
  ma-section.css         ← Tout le CSS statique
```

Pas de JS dans la section → créer `assets/ma-section.js` si nécessaire.

---

## Règles fondamentales

### 1. Pas de Tailwind dans les sections

Les classes Tailwind sont compilées dans `assets/tailwind.css` (chargé globalement).
**Ne pas en mettre dans les sections** — utiliser des classes BEM sémantiques à la place.

```liquid
<!-- ❌ Interdit -->
<div class="flex items-center px-[32px] md:hidden!">

<!-- ✅ Correct -->
<div class="ma-section__content-col">
```

### 2. CSS dans un fichier séparé

Créer `assets/ma-section.css` et le charger en haut de la section.

```liquid
{{ 'ma-section.css' | asset_url | stylesheet_tag }}
```

Nommer le fichier avec le même nom que la section : `section-gauche-droite.liquid` → `section-gauche-droite.css`.

### 3. Valeurs dynamiques via `{%- style -%}`

Les valeurs qui viennent des settings (couleurs, espacements) ne peuvent pas aller dans un fichier CSS statique.
Les injecter via un bloc `{%- style -%}` scopé sur l'ID de section.

```liquid
{%- style -%}
  #shopify-section-{{ section.id }} {
    padding-top: {{ section.settings.margin_top }}px;
    padding-bottom: {{ section.settings.margin_bottom }}px;
  }
  #shopify-section-{{ section.id }} .ma-section {
    --ms-text-align: {{ section.settings.alignment }};
    --ms-bg: {{ section.settings.background_color }};
  }
{%- endstyle -%}
```

Le CSS statique consomme ensuite ces variables :

```css
.ma-section {
  text-align: var(--ms-text-align, left);
  background-color: var(--ms-bg, #fff);
}
```

### 4. Naming BEM

Préfixe court basé sur le nom de la section, puis `__element` et `--modifier`.

```
section-gauche-droite → .sgd
  .sgd__grid
  .sgd__grid--image-right   ← modifier
  .sgd__image-col
  .sgd__content-col
  .sgd__title
  .sgd__description
```

### 5. Modificateurs via classes Liquid

Pour les variantes visuelles conditionnelles, construire la classe en Liquid.

```liquid
{%- liquid
  assign grid_class = 'sgd__grid'
  if section.settings.image_position == 'right'
    assign grid_class = 'sgd__grid sgd__grid--image-right'
  endif
-%}

<div class="{{ grid_class }}">
```

### 6. Images

- Toujours utiliser `image_url` + `image_tag` avec `widths` et `sizes`
- `sizes` doit refléter la taille réelle : `'(min-width: 750px) 50vw, 100vw'` pour une demi-colonne desktop
- `loading: 'lazy'` par défaut — utiliser `'eager'` si l'image est en hero (première section visible)

```liquid
{{
  section.settings.image
  | image_url: width: 2500
  | image_tag:
    loading: 'lazy',
    fetchpriority: 'low',
    class: 'ma-section__image',
    widths: '375, 550, 750, 1100, 1500',
    sizes: '(min-width: 750px) 50vw, 100vw'
}}
```

### 7. Schema

- Types `text_alignment` → inexistant, utiliser `select` avec options left/center/right
- IDs avec underscore uniquement : `margin_top`, pas `margin-top`
- Tags HTML dans les options : valeurs en minuscules (`h1`, `h2`, `h3`)
- Type `richtext` → ne jamais appliquer le filtre `newline_to_br` (le richtext génère déjà du HTML)

```liquid
<!-- ❌ -->
{{ block.settings.description | newline_to_br }}

<!-- ✅ -->
{{ block.settings.description }}
```

### 8. Couleurs des blocks

Les `style="color: {{ block.settings.color }}"` en inline priment toujours sur les règles CSS (specificité).
Le paramètre global de couleur (`--typo-p--color`) s'applique uniquement là où aucun inline style n'est défini.

---

## Structure type d'une section

```liquid
{{ 'ma-section.css' | asset_url | stylesheet_tag }}

{%- liquid
  <%- logique Liquid pure (calculs, classes conditionnelles) -%>
-%}

{%- style -%}
  #shopify-section-{{ section.id }} {
    <%- valeurs dynamiques des settings -%>
  }
{%- endstyle -%}

<div class="ma-section" {{ section.shopify_attributes }}>
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'mon_block' %}
        <div class="ma-section__block" {{ block.shopify_attributes }}>
          ...
        </div>
    {% endcase %}
  {% endfor %}
</div>

{% schema %}
{
  "name": "Ma Section",
  "class": "ma-section",
  "settings": [...],
  "blocks": [...],
  "presets": [{ "name": "Ma Section" }]
}
{% endschema %}
```

---

## Fichier CSS type

```css
/* Variables dynamiques consommées depuis {%- style -%} */
.ma-section {
  text-align: var(--ms-text-align, left);
}

/* Layout */
.ma-section__grid {
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
}

@media screen and (min-width: 750px) {
  .ma-section__grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Modificateur */
.ma-section__grid--image-right .ma-section__image-col {
  order: 2;
}

/* Responsive hidden/visible */
.ma-section__label--desktop { display: none; }
.ma-section__label--mobile  { display: block; }

@media screen and (min-width: 750px) {
  .ma-section__label--desktop { display: block; }
  .ma-section__label--mobile  { display: none; }
}
```
