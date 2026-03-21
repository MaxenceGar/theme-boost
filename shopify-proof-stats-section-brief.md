# Shopify Section -- Proof / Stats Section

## 🎯 Objectif

Créer une section Shopify custom type "Proof / Stats section" avec :

-   Fond beige premium
-   Texte éditorial à gauche
-   Statistiques chiffrées à droite
-   Style élégant / serif / branding premium
-   Layout en 2 colonnes desktop
-   Stack vertical en mobile

------------------------------------------------------------------------

## 🧱 Structure

### Layout Desktop

| LEFT COLUMN (40%) \| RIGHT COLUMN (60%) \|

Container : - max-width: 1200--1400px - margin: auto - padding vertical:
100--140px

------------------------------------------------------------------------

## 🅰️ Colonne gauche

Contient :

1.  Un H2 sur 2 lignes :
    -   Ligne 1 : texte normal
    -   Ligne 2 : texte italique

Exemple :

``` html
<h2>
  Satisfaction <span class="italic">you can</span><br>
  <span class="italic">trust.</span>
</h2>
```

2.  Un paragraphe descriptif sous le titre

Spacing : - 32px entre titre et texte

------------------------------------------------------------------------

## 🅱️ Colonne droite

Liste verticale de blocs statistiques.

Structure d'un bloc :

``` html
<div class="stat-item">
  <div class="stat-number">86k+</div>
  <div class="stat-text">Description</div>
</div>
```

Entre chaque bloc : - Divider horizontal fin - 32--40px padding vertical

------------------------------------------------------------------------

## 🎨 Direction Artistique

### Couleurs

Fond :

    #D9CBB8

Titres :

    #6B4A2B

Chiffres :

    #B88A5A

Texte :

    #7A5C3E

------------------------------------------------------------------------

## 🔤 Typographie

Style : - Serif premium (Playfair Display / Cormorant / Libre
Baskerville) - Italique sur certains mots

Tailles desktop :

H2 : - 56--64px - line-height: 1.1

Stat number : - 64--72px - font-weight: 600

Stat text : - 18--20px

------------------------------------------------------------------------

## 📱 Responsive

Mobile :

-   Colonnes en vertical
-   Texte centré
-   Réduction des font-size \~30%
-   Padding vertical : 60--80px

------------------------------------------------------------------------

## ⚙️ Shopify Schema

Settings :

-   title_part_1 (text)
-   title_part_2 (text italic)
-   description (textarea)

Blocks : Type: stat

-   number (text)
-   description (text)

Max 6 blocks

------------------------------------------------------------------------

## 💎 Détails Premium

-   Divider : 1px solid rgba(107,74,43,0.2)
-   Pas d'ombres
-   Pas de bordures arrondies
-   Design éditorial minimaliste
-   Option : animation fade-in on scroll

------------------------------------------------------------------------

## 🎯 Résultat attendu

Section : - Minimaliste - Premium - Éditoriale - Inspirée des marques
DTC wellness
