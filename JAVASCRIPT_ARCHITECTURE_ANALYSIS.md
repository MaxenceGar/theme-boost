# Shopify Dawn Theme - JavaScript Architecture Analysis

## Executive Summary

This is a comprehensive analysis of all 34 JavaScript files in the Shopify Dawn theme's `/assets/` directory. The codebase implements a modern Web Components architecture with heavy use of custom HTML elements, pub/sub event systems, and AJAX-based cart management.

**Key Characteristics:**
- **Architecture Pattern**: Web Components + Pub/Sub Pattern
- **Framework**: Vanilla JavaScript (no dependencies except Swiper for carousels)
- **Primary Communication**: Custom events and pub/sub system
- **State Management**: Distributed via custom events
- **Cart API**: Uses Shopify's Cart API for product additions and modifications
- **Focus**: Progressive enhancement, accessibility, and performance

---

## File Inventory (34 files)

### Core Infrastructure (3 files)
1. `pubsub.js` - Event publishing/subscription system
2. `constants.js` - Event name constants
3. `global.js` - Global utility functions (focus management, animations)

### Cart System (4 files)
1. `cart.js` - Cart item management (custom elements)
2. `cart-drawer.js` - Cart drawer UI with timer for reservations
3. `cart-notification.js` - Add-to-cart notification popover
4. `cart-drawer.js` - Timer feature for product reservations

### Product Page (7 files)
1. `product-form.js` - Product form submission & add-to-cart
2. `product-info.js` - Product info swap when variants change
3. `product-modal.js` - Product media modal
4. `media-gallery.js` - Product image gallery with media switching
5. `price-per-item.js` - Volume pricing display
6. `product-model.js` - 3D product model viewer integration
7. `recipient-form.js` - Gift message/recipient form

### Quick Add/Bulk Purchase (3 files)
1. `quick-add.js` - Quick add modal for product details
2. `quick-add-bulk.js` - Bulk add functionality on collections
3. `quick-order-list.js` - Quick order list table component

### Search & Discovery (3 files)
1. `search-form.js` - Base search form class
2. `main-search.js` - Main search with multi-input sync
3. `predictive-search.js` - Live search results dropdown

### Filtering & Navigation (2 files)
1. `facets.js` - Collection filtering with AJAX
2. `localization-form.js` - Country/language selector

### UI Components (10 files)
1. `details-disclosure.js` - Disclosure/dropdown components
2. `details-modal.js` - Modal based on details element
3. `password-modal.js` - Password page modal
4. `quantity-popover.js` - Quantity info popover
5. `quantity-reduction.js` - Quantity reduction UI (bulk pricing)
6. `pickup-availability.js` - Store pickup availability widget
7. `show-more.js` - Show more/less buttons
8. `share.js` - Share button (native share or copy)
9. `magnify.js` - Image zoom on hover
10. `tooltips.js` - Tooltip system

### Utilities & Animations (2 files)
1. `animations.js` - Scroll-triggered animations
2. `theme-editor.js` - Theme editor integration

### External Libraries (1 file)
1. `swiper-bundle.min.js` - Swiper carousel library (minified)

---

## Architecture Deep Dive

### 1. Pub/Sub Event System (Core Pattern)

**File**: `pubsub.js`

```javascript
// Simple subscribe/publish pattern
let subscribers = {};

function subscribe(eventName, callback) {
  // Returns unsubscribe function
  return function unsubscribe() { ... }
}

function publish(eventName, data) {
  // Returns Promise.all of all callbacks
  return Promise.all(promises);
}
```

**Design Pattern**: Observer Pattern
- Non-exclusive subscription model
- Multiple callbacks can subscribe to same event
- Returns unsubscribe function for cleanup
- Uses Promises for async coordination

### 2. Event System Constants

**File**: `constants.js`

```javascript
const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  optionValueSelectionChange: 'option-value-selection-change',
  variantChange: 'variant-change',
  cartError: 'cart-error',
};

const ON_CHANGE_DEBOUNCE_TIMER = 300; // ms
```

**Events Fired**:
1. `cart-update` - Cart contents changed
2. `quantity-update` - Product quantity changed
3. `option-value-selection-change` - Product option changed (e.g., size, color)
4. `variant-change` - Variant selected (fires with detailed variant data)
5. `cart-error` - Error adding product to cart

---

## Critical Component Analysis

### CART SYSTEM

#### `cart.js` - CartItems Component

**Custom Elements**:
- `<cart-items>` - Cart items container in cart page
- `<cart-remove-button>` - Individual item remove button
- `<cart-note>` - Cart note input

**Lifecycle**:
```
Constructor → connectedCallback → subscribe to cart-update events
                                → listen for quantity changes
                                → onCartUpdate() fetches new state
                                → updateQuantity() updates cart
```

**Key Methods**:
- `updateQuantity(line, quantity, event)` - Calls `/cart/change.js` endpoint
- `onCartUpdate()` - Refetches cart sections when external update detected
- `getSectionsToRender()` - Defines which page sections to refresh

**Cart API Endpoint**: `routes.cart_change_url` → `/cart/change.js`

**Data Flow**:
1. User changes quantity → `onChange()` validates input
2. If valid → `updateQuantity()` sends AJAX request
3. Response contains updated cart state + HTML for sections
4. Publishes `cart-update` event
5. Other components listen and refresh

#### `cart-drawer.js` - CartDrawer Component

**Custom Elements**:
- `<cart-drawer>` - Slide-out cart drawer
- `<cart-drawer-items>` (extends CartItems) - Items in drawer version
- `CartTimer` - Product reservation timer (custom class, not Web Component)

**Unique Features**:
- Keyboard support (ESC to close)
- Focus trapping (prevents focus escaping drawer)
- Cart Timer: Stores `cart_timer_end` in localStorage
- Updates timer every 1 second if cart has timer element

**Timer Implementation**:
```javascript
// Reads duration from data-duration attribute
// Stores end time in localStorage
// Auto-clears when timer reaches 00:00
```

**Key Methods**:
- `open(triggeredBy)` - Opens drawer with animation
- `close()` - Closes drawer and restores focus
- `renderContents(parsedState)` - Updates drawer HTML from response

#### `cart-notification.js` - CartNotification Component

**Custom Element**: `<cart-notification>`

**Purpose**: Slide-in notification when item added to cart

**Lifecycle**:
- Hidden by default
- Triggered by `product-form.js` after successful add
- Auto-closes after user interaction or timeout
- Manages focus trapping

---

### PRODUCT SYSTEM

#### `product-form.js` - ProductForm Component

**Custom Element**: `<product-form>`

**Handles**:
1. Form submission on product page
2. Calls `/cart/add.js` endpoint (Shopify Cart API)
3. Handles errors (sold out, inventory limits)
4. Triggers cart display (drawer or notification)
5. Emits pub/sub events

**Cart API Endpoint**: `routes.cart_add_url` → `/cart/add.js`

**Request**:
```javascript
// FormData with:
- form fields (variant ID, quantity, properties)
- sections: IDs to re-render
- sections_url: current page pathname
```

**Response Events**:
```javascript
// On success:
publish(PUB_SUB_EVENTS.cartUpdate, {
  source: 'product-form',
  productVariantId: variantId,
  cartData: response
})

// On error (sold out, etc):
publish(PUB_SUB_EVENTS.cartError, {
  source: 'product-form',
  productVariantId: variantId,
  errors: response.errors,
  message: response.message
})
```

**Performance**: Uses `CartPerformance` API to measure:
- `add:user-action` - Total time from click to completion
- `add:wait-for-subscribers` - Time for pub/sub callbacks
- `add:paint-updated-sections` - Time for DOM updates

#### `product-info.js` - ProductInfo Component

**Custom Element**: `<product-info>`

**Complexity**: HIGH - Most complex component

**Responsibilities**:
1. Handles variant selection changes
2. Fetches updated product data when variant changes
3. Updates all dependent sections (price, inventory, media, etc.)
4. Manages full product swaps (different variant can be different product)
5. Handles quantity boundaries based on cart contents

**Key Feature: Product Swapping**
```javascript
// When variant selection changes to different product:
- Fetch full page content for new product
- Use HTMLUpdateUtility.viewTransition() for smooth swap
- Update URL history
- Preserve page title
```

**Pub/Sub Integration**:
- **Subscribes to**: `optionValueSelectionChange`, `cartUpdate`
- **Publishes**: `variantChange` with variant data
- **Callbacks**: Can register pre/post process HTML callbacks

**Section Rendering Pattern**:
```javascript
getSectionsToRender() {
  return [
    { id, section, selector } // Defines what to refresh
  ]
}
```

**Quantity Rules**:
- Fetches quantity rules from server based on cart contents
- Updates min/max/step based on cart quantity
- Used for volume pricing and purchase limits

#### `media-gallery.js` - MediaGallery Component

**Custom Element**: `<media-gallery>`

**Structure**:
- `[id^="GalleryViewer"]` - Main media display (carousel)
- `[id^="GalleryThumbnails"]` - Thumbnail carousel
- `[id^="GalleryStatus"]` - Live region for accessibility

**Features**:
1. Syncs viewer and thumbnails
2. Handles thumbnail click → shows media
3. Handles viewer slide change → updates thumbnail
4. Handles media pre-pending (prepend = move to front)
5. Scroll to center for long lists
6. Pause all media when switching

**Media Pause**:
```javascript
window.pauseAllMedia() // Global function
// Pauses:
- YouTube iframes
- Vimeo iframes
- HTML5 <video>
- product-model elements
```

**Accessibility**:
- Live region announces "Image [x] available"
- Thumbnail buttons have `aria-current="true"`

---

### QUICK ADD SYSTEM

#### `quick-add.js` - QuickAddModal Component

**Custom Element**: `<quick-add-modal>` (extends ModalDialog)

**Workflow**:
1. Click quick-add button
2. Modal fetches product page via AJAX
3. Modal extracts `<product-info>` element
4. Preprocesses HTML (remove duplicate IDs, cleanup)
5. Injects into modal
6. Initializes Shopify payment button and 3D models

**Key Preprocessing**:
- Removes duplicate IDs by prefixing section ID with `quickadd-`
- Removes: pickup-availability, product-modal, modal-dialog elements
- Removes list semantics from gallery (role="presentation")
- Updates image sizes for modal layout
- Sets `data-update-url="false"` to prevent URL changes

**Event**: Listens for `product-info:loaded` custom event

#### `quick-add-bulk.js` - QuickAddBulk Component

**Custom Element**: `<quick-add-bulk>` (extends BulkAdd base class)

**Used In**: Collection pages with bulk add functionality

**Features**:
- Quantity input with validation
- Debounced quantity changes (300ms)
- Subscribe to `cartUpdate` events
- Refresh quantity display when cart changes
- Show progress bar during update

**Cart Update Endpoint**: `routes.cart_update_url` → `/cart/update.js`

#### `quick-order-list.js` - QuickOrderList Component

**Custom Element**: `<quick-order-list>` (extends BulkAdd)

**Complexity**: HIGH

**Purpose**: Allows bulk ordering from a product list (table)

**Features**:
1. Table of products with quantity inputs
2. Pagination support
3. Sticky total bar at bottom
4. Smart focus management
5. Keyboard navigation (Tab, Enter, Shift+Enter)
6. Variant switching on Enter key
7. Live validation messages
8. Live region updates for accessibility

**Quantity Validation**:
```javascript
validateInput(target) {
  // Checks: min, max, step constraints
  return targetValue == 0 ||
    (valid range && valid step)
}
```

**Smart Scrolling**:
- If input crosses sticky total bar → scroll to center
- If input crosses sticky header → scroll to center
- Respects modal context vs page context

**Message System**:
```javascript
updateMessage(quantity)
// Shows: "1 item added" or "3 items removed"
// Uses window.quickOrderListStrings for localization
```

---

### SEARCH SYSTEM

#### `search-form.js` - SearchForm Base Class

**Custom Element**: `<search-form>`

**Base for**: MainSearch, PredictiveSearch

**Features**:
- Debounced input (300ms)
- Reset button visibility toggle
- Form reset prevention (don't clear if result selected)

#### `main-search.js` - MainSearch Component

**Custom Element**: `<main-search>` (extends SearchForm)

**Purpose**: Synchronize multiple search inputs across page

**Sync Mechanism**:
```javascript
keepInSync(value, target) {
  // Updates all other search inputs to same value
  this.allSearchInputs.forEach((input) => {
    if (input !== target) input.value = value;
  })
}
```

**Listens to**: All search form resets on page

#### `predictive-search.js` - PredictiveSearch Component

**Custom Element**: `<predictive-search>` (extends SearchForm)

**Complexity**: HIGH

**Features**:
1. Live search as user types
2. Result caching (keyed by search term)
3. Keyboard navigation (Arrow Up/Down, Enter)
4. Result filtering (shows only visible items)
5. Syncs across all instances via cachedResults
6. Abort previous requests if typing continues
7. Live region announcements

**Endpoints**:
- `routes.predictive_search_url` → `/search/suggest.json`

**Caching Strategy**:
```javascript
// Cache key: search term with spaces replaced by dashes
const queryKey = searchTerm.replace(' ', '-').toLowerCase();
// Synced across all predictive-search instances
this.allPredictiveSearchInstances.forEach(...)
```

**Result HTML Parsing**:
```javascript
// Server returns section with ID predictive-search-results-groups-wrapper
const resultsMarkup = new DOMParser()
  .parseFromString(text, 'text/html')
  .querySelector('#shopify-section-predictive-search').innerHTML;
```

---

### FILTERING SYSTEM

#### `facets.js` - FacetFiltersForm Component

**Custom Element**: `<facet-filters-form>`

**Complexity**: HIGH - Coordinates complex filtering

**Features**:
1. Multiple facet forms (desktop, mobile, pills)
2. Debounced form submission (800ms)
3. AJAX facet filtering with result caching
4. URL history management (pushState)
5. Product count updates
6. Active facet display
7. Show more/less for facets

**Cache Structure**:
```javascript
FacetFiltersForm.filterData = [
  { html: response, url: request_url }
]
```

**Sections Updated**:
- Product grid (with new products)
- Product count
- Facet counts
- Active facets display
- Mobile facets count

**URL Pattern**:
```
/collection/products?section_id=product-grid&filter.v.availability=...
```

**Price Range Component**: `<price-range>`
- Two input validation (min/max)
- Prevents min > max
- Keypress validation

#### Pickup Availability

**Custom Elements**:
- `<pickup-availability>` - Shows pickup locations
- `<pickup-availability-drawer>` - Full pickup location modal

**Endpoints**:
- `/variants/{variantId}/?section_id=pickup-availability`

**Features**:
- Fetches availability on variant change
- Updates when `variant-change` event fires
- Opens drawer with location details
- Focus trapping in drawer
- Error handling with retry button

---

## Global Utility Functions

### `global.js` - Infrastructure (200+ lines)

**Key Utilities**:

#### Focus Management
```javascript
trapFocus(container, elementToFocus)
// - Finds all focusable elements
// - Traps Tab/Shift+Tab within container
// - Used in modals, drawers

removeTrapFocus(elementToFocus)
// - Cleans up focus listeners
// - Optionally focuses element on cleanup

getFocusableElements(container)
// - Returns focusable elements
// - Includes links, buttons, inputs, etc.
```

#### Media Control
```javascript
pauseAllMedia()
// Pauses all media on page:
// - YouTube iframes (postMessage)
// - Vimeo iframes (postMessage)
// - HTML5 <video>
// - product-model elements
```

#### HTML Utilities
```javascript
class HTMLUpdateUtility {
  static viewTransition(oldNode, newContent, preCallbacks, postCallbacks)
  // - Swaps nodes with smooth transition
  // - Handles ID deduplication
  // - Re-injects scripts
  // - Used for product swaps, media updates

  static setInnerHTML(element, html)
  // - Sets innerHTML but re-executes scripts
}
```

#### Focus Visible Polyfill
```javascript
focusVisiblePolyfill()
// - Polyfill for :focus-visible pseudo-class
// - Tracks keyboard vs mouse focus
// - Applies 'focused' class for keyboard nav
```

#### Section ID Utilities
```javascript
class SectionId {
  static parseId(qualifiedId)
  // template--123__main → template--123

  static parseSectionName(qualifiedId)
  // template--123__main → main

  static getIdForSection(sectionId, sectionName)
  // template--123 + main → template--123__main
}
```

---

## Animation System

### `animations.js` - Scroll-Triggered Animations

**Features**:
1. Intersection Observer for scroll triggers
2. Cascade animations (stagger effect)
3. Zoom-in animations with scroll parallax
4. Design mode awareness (preview mode)

**Classes Used**:
- `.scroll-trigger` - Element to animate on scroll
- `.scroll-trigger--offscreen` - Initial hidden state
- `.animate--zoom-in` - Zoom effect with scroll tracking

**CSS Variables**:
- `--animation-order` - Stagger delay index
- `--zoom-in-ratio` - Zoom scale based on scroll

**Cascade Animation**:
```javascript
// When element scrolled into view:
// Removes --offscreen class
// Sets --animation-order CSS variable
// CSS uses this for staggered animation
```

**Zoom Animation**:
```javascript
// Tracks scroll position percentage
// Calculates scale based on percentageSeen()
// Updates --zoom-in-ratio as user scrolls
// Smooth zoom effect following scroll
```

---

## UI Component Details

### Disclosure Components

#### `details-disclosure.js` - DetailsDisclosure

**Custom Elements**:
- `<details-disclosure>` - Base disclosure
- `<header-menu>` - Header menu (extends DetailsDisclosure)

**Features**:
- Native `<details>` element wrapper
- Plays/cancels CSS animations on toggle
- Keyboard escape key support
- Header menu calculates bottom position

#### `details-modal.js` - DetailsModal

**Custom Element**: `<details-modal>`

**Features**:
- Uses `<details>` as modal container
- Escape key closes
- Click outside closes
- Focus trapping
- Body overflow hidden when open

#### `password-modal.js` - PasswordModal

**Custom Element**: `<password-modal>` (extends DetailsModal)

**Logic**:
- Auto-opens if form has `aria-invalid="true"` input
- Used on password-protected store pages

### Miscellaneous UI Components

#### `quantity-popover.js` - QuantityPopover

**Custom Element**: `<quantity-popover>`

**Purpose**: Info popover for quantity rules (volume pricing, minimums)

**Features**:
- Hover to open (desktop)
- Click to open (mobile)
- Mouse leave closes
- Escape key closes
- Animation support

#### `share.js` - ShareButton

**Custom Element**: `<share-button>` (extends DetailsDisclosure)

**Features**:
- Native Web Share API if available
- Fallback to copy-to-clipboard
- Shows success message after copy
- Updates URL dynamically

#### `show-more.js` - ShowMoreButton

**Custom Element**: `<show-more-button>`

**Used For**:
- Show more facets in filters
- Show more options in product variants

**Features**:
- Toggles visibility of hidden items
- Toggles label ("Show More" ↔ "Show Less")
- Auto-focuses first newly-visible input

#### `magnify.js` - Image Zoom

**Global Functions** (not a custom element):

```javascript
enableZoomOnHover(zoomRatio)
// Enables zoom on all .image-magnify-hover elements
// Overlay shows zoomed image
// Mouse move follows image
// Click/leave closes
```

**Used In**: Product gallery when hovering images

#### `quantity-reduction.js` - QuantityReductions

**Custom Element**: `<quantity-reductions>`

**Purpose**: UI for bulk quantity pricing (click quantity → updates price)

**Features**:
- Click quantity reduction item
- Updates price display
- Updates quantity input hidden value
- Updates buy button price

#### `recipient-form.js` - RecipientForm

**Custom Element**: `<recipient-form>`

**Purpose**: Gift message and recipient form

**Features**:
- Checkbox enables/disables recipient fields
- Captures recipient email, name, message
- Captures send-on date
- Captures timezone offset
- Error display with live regions
- Subscribes to `cartUpdate` and `variantChange` events
- Resets form when product added to cart

**Error Messages**:
- Server validation errors displayed inline
- Links to invalid fields in error list
- aria-invalid and aria-describedby for accessibility

#### `pickup-availability.js` - PickupAvailability

Already covered above (see FILTERING section)

### `tooltips.js` - Custom Tooltip System

**Not a Web Component** - Uses namespace pattern

**API**:
```javascript
window.SectionsDesign[sectionId] = {
  tooltips() → array of tooltips
  tooltip(id) → specific tooltip
  select(blockId) → expand tooltip
  deselect(blockId) → collapse tooltip
  init() → initialize section
  config → configuration object
}
```

**Features**:
- Expand/collapse with animations
- Uses CSS custom properties for height
- Fallback for browsers without CSS custom properties
- Only one tooltip expanded at a time per section

---

## Theme Editor Integration

### `theme-editor.js` - Theme Editor Events

**Purpose**: Handle Shopify Theme Editor interactions

**Events Listened**:
- `shopify:block:select` - Block selected in editor
- `shopify:block:deselect` - Block deselected
- `shopify:section:load` - Section loaded
- `shopify:section:unload` - Section unloaded
- `shopify:section:reorder` - Sections reordered
- `shopify:section:select` - Section selected
- `shopify:section:deselect` - Section deselected
- `shopify:inspector:activate` - Inspector opened
- `shopify:inspector:deactivate` - Inspector closed

**Actions**:
- Hides open product modals during editor interactions
- Handles slideshow pausing/resuming
- Re-executes zoom-on-hover script
- Cleans up sections with overflow-hidden

---

## Localization

### `localization-form.js` - LocalizationForm

**Custom Element**: `<localization-form>`

**Purpose**: Country/language selector dropdown

**Features**:
1. Search functionality (country name search)
2. Keyboard navigation (arrow keys)
3. Normalization (handles diacritics in search)
4. Popular countries list
5. Clears header overflow on open/close
6. Focus management
7. Live region search results count

**Search**:
```javascript
normalizeString(str)
// NFD normalize removes accents
// "Côte d'Ivoire" → "cote d ivoire"
// Enables fuzzy matching
```

---

## Performance & Monitoring

### CartPerformance API

**Used Throughout** (especially cart.js, product-form.js)

```javascript
CartPerformance.createStartingMarker(markerName)
// Returns marker timestamp

CartPerformance.measure(markerName, callback)
// Executes callback and measures time taken

CartPerformance.measureFromMarker(markerName, startMarker)
// Measures time from start marker to now

CartPerformance.measureFromEvent(markerName, event)
// Measures from event timestamp

// Typical markers:
- add:user-action (form click to completion)
- add:wait-for-subscribers (pub/sub propagation)
- add:paint-updated-sections (DOM updates)
- change:user-action (quantity change)
- note-update:user-action (cart note changes)
```

---

## Custom Events & Communication Flow

### Event Flow Diagram

```
USER INTERACTION (click, change input)
          ↓
COMPONENT (e.g., product-form.js)
          ↓
Fetch Request (cart API)
          ↓
Parse Response
          ↓
publish(PUB_SUB_EVENTS.cartUpdate, data)
          ↓
SUBSCRIBERS (cart.js, cart-drawer.js, price-per-item.js, etc.)
          ↓
Each subscriber's callback fires
          ↓
Local state updates, DOM refreshes
```

### Event Details

#### cart-update Event
```javascript
publish(PUB_SUB_EVENTS.cartUpdate, {
  source: 'product-form' | 'quick-add' | 'cart-items',
  productVariantId: number,
  cartData: {
    item_count: number,
    items: [{variant_id, quantity, ...}],
    sections: {section_id: html},
    ...
  },
  variantId: (optional)
})
```

#### option-value-selection-change Event
```javascript
publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
  data: {
    event: DOMEvent,
    target: HTMLElement,
    selectedOptionValues: string[]
  }
})
```

#### variant-change Event
```javascript
publish(PUB_SUB_EVENTS.variantChange, {
  data: {
    sectionId: string,
    html: HTMLDocument,
    variant: {
      id, title, price, featured_media, ...
    }
  }
})
```

#### quantity-update Event
```javascript
publish(PUB_SUB_EVENTS.quantityUpdate, undefined)
// Fired when quantity boundaries change
```

#### cart-error Event
```javascript
publish(PUB_SUB_EVENTS.cartError, {
  source: 'product-form',
  productVariantId: number,
  errors: string | object,
  message: string
})
```

---

## Shopify APIs Used

### Cart API (`/cart/add.js`)
**Used by**: product-form.js, quick-add.js

**Request**: FormData with variant ID, quantity, properties
**Response**: JSON with cart state, item details, sections HTML

### Cart Change API (`/cart/change.js`)
**Used by**: cart.js, quick-order-list.js, quick-add-bulk.js

**Request**: JSON {line, quantity, sections}
**Response**: JSON with updated cart state

### Cart Update API (`/cart/update.js`)
**Used by**: quick-order-list.js, quick-add-bulk.js

**Request**: JSON {updates: {line: quantity}}
**Response**: JSON with updated cart

### Variant Section API (`/variants/{id}/?section_id=...`)
**Used by**: pickup-availability.js, price-per-item.js

**Returns**: HTML section with variant details

### Predictive Search API (`/search/suggest.json?q=...`)
**Used by**: predictive-search.js

**Returns**: JSON with search results

### Product Page AJAX (`/products/{url}?section_id=...`)
**Used by**: product-info.js

**Returns**: HTML of product section (used for variant swaps)

### Collection Filtering (`/collections/{url}?section_id=...`)
**Used by**: facets.js

**Returns**: HTML of product grid, facets, counts

### Pickup Availability (`/variants/{id}/?section_id=pickup-availability`)
**Used by**: pickup-availability.js

**Returns**: HTML with store availability

---

## Debounce & Throttle Usage

### Debounce (300-800ms delays)

**Product-Info Change**:
```javascript
// Waits 300ms after variant selection before fetching
ON_CHANGE_DEBOUNCE_TIMER = 300
```

**Cart Changes**:
```javascript
// Waits 300ms after quantity input stops before updating
debounce((event) => this.onChange(event), ON_CHANGE_DEBOUNCE_TIMER)
```

**Facet Filtering**:
```javascript
// Waits 800ms before applying filters
debouncedOnSubmit = debounce((event) => {
  this.onSubmitHandler(event);
}, 800)
```

**Search**:
```javascript
// Debounce in SearchForm base class (300ms)
this.input.addEventListener('input',
  debounce((event) => this.onChange(event), 300)
)
```

### Throttle

**Scroll Events** (animations.js):
```javascript
window.addEventListener('scroll',
  throttle(() => {
    element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element))
  }),
  { passive: true }
)
```

---

## Error Handling Patterns

### Form Validation Errors

**Product Form**:
```javascript
if (response.status) {
  // Error response
  publish(PUB_SUB_EVENTS.cartError, {...})
  this.handleErrorMessage(response.description)
  // Show "Sold out" button state
}
```

**Cart Item Changes**:
```javascript
if (parsedState.errors) {
  quantityElement.value = quantityElement.getAttribute('value') // Revert
  this.updateLiveRegions(line, parsedState.errors) // Show error
  return
}
```

**Quick Order List**:
```javascript
// Custom validation
validateQuantity(event)
// Checks min, max, step
// Uses event.target.setCustomValidity()
// Calls event.target.reportValidity() for native validation UI
```

### Network Error Handling

**Predictive Search**:
```javascript
.catch((error) => {
  if (error?.code === 20) return // AbortError, expected
  this.close()
  throw error // Re-throw unexpected errors
})
```

**Pickup Availability**:
```javascript
.catch((e) => {
  const button = this.querySelector('button')
  if (button) button.removeEventListener('click', this.onClickRefreshList)
  this.renderError() // Show error template
})
```

---

## Accessibility Features

### ARIA Implementation

**Live Regions**:
- Cart updates announcements (`#cart-live-region-text`)
- Quick order list updates (`#shopping-cart-variant-item-status`)
- Predictive search results count
- Country selector search results

**Focus Management**:
- Focus trapping in modals and drawers
- Focus restoration on close
- Tab order management
- Keyboard navigation (Arrow keys, Enter, Escape)

**Screen Reader Support**:
- aria-expanded for dropdowns and modals
- aria-hidden for decorative elements
- aria-describedby for error messages
- aria-invalid for form errors
- aria-controls for related elements
- aria-current for active tabs/buttons

**Keyboard Navigation**:
- Tab/Shift+Tab for focus cycling
- Enter to select/submit
- Escape to close modals
- Arrow Up/Down for lists and searches
- Space for button activation

---

## State Management Pattern

### Distributed State (No Centralized Store)

**Pattern**:
1. Component holds local state (input values, open/closed)
2. Components publish events to notify others
3. Other components subscribe and update independently
4. No single source of truth for cart/product state

**Advantages**:
- Decoupled components
- No prop drilling
- Easy to add new listeners
- Lightweight architecture

**Disadvantages**:
- Multiple sources of truth
- Hard to debug state changes
- Order of execution matters
- Can have race conditions

### Example: Quantity Change Flow

```
QuickOrderList (user enters qty)
  ↓
onChange() validates input
  ↓
startQueue() adds to update queue
  ↓
updateMultipleQty() sends to /cart/update.js
  ↓
publish(cartUpdate) with new cart state
  ↓
Multiple listeners:
  - ProductInfo: updates quantity boundaries
  - PricePerItem: updates volume pricing
  - CartItems: updates cart display
  - CartNotification: shows update message
```

---

## Performance Optimizations

### Section Caching (Facets)

```javascript
FacetFiltersForm.filterData = [
  { html: markup, url: requestUrl }
]
// Cache by URL
// Check cache before fetching
// Prevents redundant network requests
```

### Predictive Search Caching

```javascript
this.cachedResults[queryKey] = resultsMarkup
// Synced across all instances
// Prevents duplicate fetches
// Same cache shared between header and footer searches
```

### Request Debouncing

- Form input changes debounced 300-800ms
- Prevents multiple requests during typing
- Reduces server load

### Scroll-Triggered Lazy Evaluation

- Animations initialized on scroll intersection
- Media only loads when scrolled into view
- Reduces initial page load

### Event Unsubscription

```javascript
// In disconnectedCallback():
if (this.cartUpdateUnsubscriber) {
  this.cartUpdateUnsubscriber()
}
```
- Prevents memory leaks
- Removes listeners when components removed
- Important for SPA-like behavior in theme editor

---

## Template Element Usage

### Deferred Content Loading

```html
<template>
  <div>Deferred media (video, model)</div>
</template>
```

- Content not parsed until accessed
- `DeferredMedia.loadContent()` clones and executes
- Used for videos, 3D models, embeds

### Error Templates

```javascript
this.errorHtml = this.querySelector('template')
  .content.firstElementChild.cloneNode(true)
// Clone error HTML for repeated use
```

---

## Custom Element Patterns

### Extending Built-in Components

```javascript
class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    // Override to use drawer-specific sections
  }
}
```

### Lifecycle Hooks

```javascript
constructor() // Initial setup
connectedCallback() // When added to DOM
disconnectedCallback() // When removed from DOM
```

### Property Getters

```javascript
get productForm() {
  return this.querySelector('product-form')
}
```
- Lazy query selectors
- More efficient than repeated queries

---

## Third-Party Integration

### Shopify Features

**Payment Button**:
```javascript
if (window.Shopify && Shopify.PaymentButton) {
  Shopify.PaymentButton.init()
}
```
- Initializes apple pay, google pay buttons
- Called after AJAX content updates

**Product Model Viewer**:
```javascript
if (window.ProductModel) {
  window.ProductModel.loadShopifyXR()
}
```
- Loads 3D model viewer capability
- Uses `Shopify.loadFeatures()` API

**Model Viewer UI**:
```javascript
Shopify.loadFeatures([{
  name: 'model-viewer-ui',
  onLoad: this.setupModelViewerUI.bind(this)
}])
```

### Swiper Library

- Used for carousels (slideshow-component)
- Provides slider/carousel functionality
- Configured per section in Liquid templates

---

## Locale & Translation

### String Objects

**Cart Strings**:
```javascript
window.cartStrings = {
  error: '...',
  quantityError: '[quantity] is unavailable'
}
```

**Variant Strings**:
```javascript
window.variantStrings = {
  addToCart: '...',
  soldOut: '...',
  unavailable: '...'
}
```

**Quick Order List Strings**:
```javascript
window.quickOrderListStrings = {
  min_error: 'Min [min]',
  max_error: 'Max [max]',
  step_error: 'Step [step]',
  itemAdded: '[quantity] item added',
  itemsAdded: '[quantity] items added'
}
```

**Accessibility Strings**:
```javascript
window.accessibilityStrings = {
  imageAvailable: 'Image [index] available',
  recipientFormExpanded: '...',
  countrySelectorSearchCount: '[count] countries'
}
```

---

## Known Custom Classes (Not Web Components)

### BulkAdd (Base Class)

- Parent of QuickAddBulk and QuickOrderList
- Implements queue-based batch updates
- Not itself a custom element

### CartPerformance

- Performance measurement utility
- Measures cart operation timings
- Used for Core Web Vitals optimization

### SearchForm

- Base class for search components
- Implemented as custom element
- Parent of MainSearch, PredictiveSearch

### DetailsDisclosure

- Custom element based on `<details>` element
- Base for DetailsModal, ShareButton
- Handles animation and keyboard events

### DetailsModal

- Extends DetailsDisclosure
- Adds focus trapping
- Base for PasswordModal, ProductModal

---

## Bundle Structure

### Script Loading

**Typically loaded in Shopify theme**:
- Base global.js (focus, animations, utilities)
- Component JS files (custom elements)
- Library JS (swiper, etc.)

**Script Types**:
- Regular scripts (synchronous)
- Deferred scripts in some sections
- Inline scripts for quick initialization

### Minification & Bundling

- `swiper-bundle.min.js` is minified third-party library
- Other files typically minified in production
- No module system (direct global registration)

---

## Critical Dependencies & Order

### Must Load First
1. `global.js` - Utilities used by all
2. `pubsub.js` - Event system used by all
3. `constants.js` - Event constants

### Can Load Async
- Component-specific files
- Library files
- Theme editor utilities

### Must Exist on Page
- Shopify global (routes, Shopify object)
- Window string objects (cartStrings, variantStrings)
- Routes object

---

## Common Patterns & Anti-Patterns

### Good Patterns

✓ Pub/Sub for loose coupling
✓ Custom events for component communication
✓ Web Components for encapsulation
✓ Cleanup in disconnectedCallback
✓ ARIA labels for accessibility
✓ Keyboard navigation support
✓ Focus management in modals
✓ Request debouncing to limit API calls
✓ Caching to reduce duplicate fetches
✓ Progressive enhancement

### Issues to Watch

⚠ No centralized state management (can cause race conditions)
⚠ Reliance on global objects (cartStrings, variantStrings)
⚠ Direct DOM manipulation instead of templating
⚠ Mixed concerns (fetch logic in UI components)
⚠ Potential memory leaks if listeners not cleaned up
⚠ Order-dependent initialization
⚠ Limited error recovery mechanisms

---

## Testing Considerations

### Component Testing

- Mock the pub/sub system
- Mock fetch API for AJAX calls
- Test lifecycle hooks (connectedCallback, disconnectedCallback)
- Verify event publishing
- Test accessibility (ARIA, focus)
- Test keyboard navigation

### Integration Testing

- Test event flow (user action → multiple components update)
- Test cart operations end-to-end
- Test variant selection with media updates
- Test filtering with cache behavior

### Performance Testing

- Monitor Core Web Vitals
- Profile cart operation timings
- Check for memory leaks (listeners not cleaned)
- Measure animation frame rate

---

## Customization Points

### Override Sections to Render

```javascript
getSectionsToRender() {
  return [
    { id, section, selector }
  ]
}
```
- Components define which sections refresh
- Customize to add/remove sections

### Pre/Post Process Callbacks

```javascript
addPreProcessCallback(callback)
addPostProcessCallback(callback)
```
- Product info supports custom HTML processing
- Can add custom initialization

### Template Customization

- Override HTML in template elements
- Customize error messages
- Add new sections to render

---

## Version & Browser Support

### Target Browsers

- Modern browsers (ES6 support)
- Custom Elements support required
- Fetch API required
- LocalStorage for cart timer

### Polyfills Included

- Focus-visible polyfill (included in global.js)
- No fetch polyfill (assumes fetch available)
- No Promise polyfill (assumes available)

### Progressive Enhancement

- Works without JavaScript (basic form submission)
- Enhanced with JavaScript (AJAX, smooth updates)
- Further enhanced with Web Components

---

## Security Considerations

### XSS Prevention

- Uses `textContent` for user input (not innerHTML in most cases)
- Uses `DOMParser().parseFromString()` safely
- Sanitizes response HTML before insertion

### CSRF Protection

- Shopify handles CSRF tokens
- Forms use Shopify's security
- AJAX requests use Shopify's fetch config

### User Data

- localStorage used only for cart timer
- No sensitive data stored locally
- All sensitive operations server-validated

---

## Monitoring & Debugging

### Console Warnings

- Network errors logged to console
- Fetch failures logged
- Some parsing errors logged

### CartPerformance API

- Traces cart operation timings
- Can be hooked to analytics
- Measures user-visible operations

### Live Regions

- Screen reader announcements logged
- Accessibility events announced
- User actions confirmed via aria-live regions

---

## Summary

The Shopify Dawn theme JavaScript architecture represents a modern, accessible, and performant approach to e-commerce frontend development:

1. **Architecture**: Web Components + Pub/Sub pattern provides clean separation of concerns
2. **Communication**: Event-driven allows components to stay loosely coupled
3. **APIs**: Uses Shopify Cart API efficiently with AJAX updates
4. **Accessibility**: ARIA labels, keyboard navigation, focus management throughout
5. **Performance**: Debouncing, caching, lazy loading, and performance monitoring
6. **Robustness**: Error handling, validation, and fallback mechanisms
7. **Maintainability**: Clear component boundaries, reusable utilities, documented patterns

The codebase balances functionality with simplicity, avoiding heavy frameworks while leveraging modern web platform features effectively.

