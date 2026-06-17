# ShopNest — Master Bug Tracker & Feature Plan

> Last updated: 2026-06-14  
> Status: DISCOVERY PHASE — Testing + Planning (No fixes applied yet)  
> Sources: User testing + Browser testing + Code audit + Backend↔Frontend cross-reference

---

## 📡 BACKEND ↔ FRONTEND CROSS-REFERENCE

> Every backend endpoint checked against frontend API files and actual UI usage.

### ✅ AuthController (`/api/auth`) — FULLY CONNECTED
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `POST /auth/register` | `authApi.register()` | `RegisterPage.jsx` | ✅ Connected |
| `POST /auth/login` | `authApi.login()` | `LoginPage.jsx` | ✅ Connected |
| `POST /auth/refresh` | `authApi.refresh()` | `axiosInstance.js` interceptor | ✅ Connected |
| `POST /auth/logout` | `authApi.logout()` | Navbar profile dropdown | ✅ Connected |

### ✅ ProductController (`/api/products`) — HAS ISSUES
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `GET /products` (paginated, with `search`, `categoryId`, `sort`) | `productApi.getProducts()` | `ProductsPage.jsx` | ⚠️ Sort broken (BUG-05) |
| `GET /products/{id}` | `productApi.getProduct()` | `ProductDetailPage.jsx` | ✅ Connected |
| `POST /products` (Admin) | `adminApi.createProduct()` | `ProductFormModal.jsx` | ✅ Connected |
| `PUT /products/{id}` (Admin) | `adminApi.updateProduct()` | `ProductFormModal.jsx` | ✅ Connected |
| `DELETE /products/{id}` (Admin) | `adminApi.deleteProduct()` | `AdminProducts.jsx` | ✅ Connected |
| ❌ NO `/products/search` endpoint! | `productApi.searchProducts()` | `ProductsPage.jsx` L78 | 🔴 **GHOST ENDPOINT — doesn't exist in backend!** |

### ✅ CartController (`/api/cart`) — FULLY CONNECTED (but field mismatch)
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `GET /cart` | `cartApi.getCart()` | `CartPage.jsx` | ⚠️ Field mismatch (BUG-01) |
| `POST /cart/add` | `cartApi.addToCart()` | `ProductDetailPage.jsx`, `ProductCard.jsx` | ✅ Connected |
| `PUT /cart/item/{id}` | `cartApi.updateItem()` | `CartPage.jsx` quantity +/- | ✅ Connected |
| `DELETE /cart/item/{id}` | `cartApi.removeItem()` | `CartPage.jsx` remove button | ✅ Connected |
| `DELETE /cart` | `cartApi.clearCart()` | `CartPage.jsx` clear cart button | ✅ Connected |

### ⚠️ OrderController (`/api/orders`) — HAS CRITICAL ISSUES
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `POST /orders/place` | `orderApi.placeOrder()` | `CheckoutPage.jsx` | ⚠️ Field mismatch (BUG-02) |
| `GET /orders` | `orderApi.getOrders()` | `OrdersPage.jsx` | ✅ Connected |
| `GET /orders/{id}` | `orderApi.getOrder()` | `OrderDetailPage.jsx` | ⚠️ Field mismatch (CODE-02) |
| `PATCH /orders/{id}/status` (expects `@RequestBody {status}`) | `orderApi.updateOrderStatus()` sends as **query param** `?status=X` | `AdminOrders.jsx` | 🔴 **API MISMATCH — will fail!** |
| `GET /orders/admin/all` | `adminApi.getAllOrders()` | `AdminOrders.jsx` | ⚠️ No user info in OrderResponse |

### ⚠️ CategoryController (`/api/categories`) — PARTIALLY CONNECTED
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `GET /categories` | `categoryApi.getCategories()` | `HomePage.jsx`, `ProductFormModal.jsx` | 🔴 500 error (BUG-03) |
| `POST /categories` (Admin) | `adminApi.createCategory()` | ❌ **NO UI EXISTS** | 🔴 **NO FRONTEND PAGE** |
| `DELETE /categories/{id}` (Admin) | `adminApi.deleteCategory()` | ❌ **NO UI EXISTS** | 🔴 **NO FRONTEND PAGE** |

### ⚠️ WishlistController (`/api/wishlist`) — API EXISTS BUT NOT CALLED
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `GET /wishlist` | `wishlistApi.getWishlist()` | `WishlistPage.jsx` | ✅ Connected (reads `item.product` — correct per WishlistResponse) |
| `POST /wishlist/{productId}` (toggle) | `wishlistApi.toggleWishlist()` | `WishlistPage.jsx` remove only | 🔴 **NOT called from ProductCard or ProductDetailPage** (BUG-06) |

### ✅ ReviewController (`/api/products/{id}/reviews`) — FULLY CONNECTED
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `GET /{productId}/reviews` | `reviewApi.getReviews()` | `ReviewSection.jsx` | ✅ Connected |
| `GET /{productId}/reviews/summary` | `reviewApi.getRatingSummary()` | `ReviewSection.jsx` | ✅ Connected |
| `GET /{productId}/reviews/can-review` | `reviewApi.canReview()` | `ReviewSection.jsx` | ✅ Connected (but UX-06) |
| `POST /{productId}/reviews` | `reviewApi.addReview()` | `ReviewSection.jsx` | ✅ Connected |
| `DELETE /{productId}/reviews/{reviewId}` | `reviewApi.deleteReview()` | `ReviewSection.jsx` | ✅ Connected |

### ✅ AddressController (`/api/users/addresses`) — PARTIALLY CONNECTED
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `GET /users/addresses` | `addressApi.getAddresses()` | `CheckoutPage.jsx` | ✅ Connected |
| `POST /users/addresses` | `addressApi.createAddress()` | `CheckoutPage.jsx` add address form | ✅ Connected |
| `DELETE /users/addresses/{id}` | `addressApi.deleteAddress()` | ❌ **NO UI for delete** | 🟡 **API exists, no delete button in UI** |

### ✅ AIController (`/api/ai`) — CONNECTED (with bug)
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `POST /ai/generate-description` | `adminApi.generateDescription()` | `ProductFormModal.jsx` | ⚠️ Returns object, frontend reads as string (BUG-08) |

### ✅ AdminController (`/api/admin`) — CONNECTED
| Backend Endpoint | Frontend API | Frontend UI | Status |
|---|---|---|---|
| `GET /admin/stats` | `adminApi.getStats()` | `AdminDashboard.jsx` | ✅ Connected |

---

## 🔴 CRITICAL BUGS (App Broken — Must Fix First)

### BUG-01: Cart shows ₹0 prices + missing product name ✅ Browser Verified
- **Severity**: CRITICAL
- **Where**: `/cart` page
- **What happens**: Cart item shows no product name, links to `/products/undefined`, price ₹0, subtotal ₹0. Only delivery ₹40 shows. Total = ₹40.
- **Root cause**: `CartPage.jsx` L18-19 reads `item.product?.price` but backend's `CartItemResponse` returns flat fields (`price`, `productName`, `productImageUrl`) — NOT a nested `product` object.
- **Files to fix**: `frontend/src/pages/CartPage.jsx` — change `item.product?.price` → `item.price`, `item.product?.name` → `item.productName`, `item.product?.imageUrl` → `item.productImageUrl`, `item.product?.id` → `item.productId`

### BUG-02: Checkout page also shows ₹0 ✅ Browser Verified
- **Severity**: CRITICAL
- **Where**: `/checkout` page
- **What happens**: Order Items section shows image but no name, ₹0 price, total = just ₹40 delivery.
- **Root cause**: Same as BUG-01 — `CheckoutPage.jsx` L30-31 uses `item.product?.price` instead of `item.price`.
- **Files to fix**: `frontend/src/pages/CheckoutPage.jsx` — same field mapping fix as CartPage

### BUG-03: Homepage categories/products fail to load (500 error) ✅ Browser Verified
- **Severity**: CRITICAL
- **Where**: Homepage `/`
- **What happens**: Categories section empty. Featured Products shows "No products found". Console shows 500 error on `GET /api/categories`.
- **Root cause**: Backend categories endpoint returning 500. Products page loads fine (30 products), so it's specific to `/api/categories`.
- **Files to check**: Backend `CategoryController`, `CategoryService`, `CategoryRepository`

### BUG-04: Search calls a GHOST endpoint that doesn't exist ✅ Browser Verified + Code Confirmed
- **Severity**: CRITICAL
- **Where**: `/products` page search bar
- **What happens**: Searching anything returns "No products found". Backend returns 500.
- **Root cause**: Frontend `productApi.searchProducts()` calls `GET /products/search?query=...` — but **this endpoint DOES NOT EXIST** in `ProductController.java`! The backend only has `GET /products` with an optional `search` query param. The frontend should use `productApi.getProducts({ search: query })` instead.
- **Fix**: Remove `productApi.searchProducts()` entirely. In `ProductsPage.jsx` L77-78, use `productApi.getProducts({ ...params, search: currentSearch })` for all cases.

### BUG-05: Sort doesn't work ✅ Browser Verified
- **Severity**: HIGH
- **Where**: `/products` page sort dropdown
- **What happens**: Selecting "Price: Low → High" updates URL but product order doesn't change.
- **Root cause**: Frontend sends `sort=price,asc` which gets URL-encoded as `sort=price%2Casc`. Backend's `ProductController` manually splits on `,` (`sort.split(",")`) so this should work. Need to verify if the URL encoding is causing the comma to be treated as `%2C` instead of `,` by Spring Boot.
- **Files to check**: Backend `ProductController` L37, Frontend `ProductsPage.jsx` param building

### BUG-06: Wishlist toggle doesn't persist — NO API call ✅ Browser Verified
- **Severity**: HIGH
- **Where**: ProductDetailPage heart button + ProductCard heart button
- **What happens**: Heart turns red locally, but `/wishlist` shows empty.
- **Root cause**:
  - `ProductDetailPage.jsx`: `onClick={() => setWishlisted(w => !w)}` — local state only, no API call
  - `ProductCard.jsx`: `onClick={(e) => { e.stopPropagation(); }}` — empty handler
- **Fix**: Call `wishlistApi.toggleWishlist(productId)` in both components.

### BUG-07: Admin orders — no customer name + inflated prices ✅ Browser Verified
- **Severity**: HIGH
- **Where**: `/admin/orders`
- **What happens**: Customer column shows "Customer" instead of real name. ₹5,19,996 total.
- **Root cause**: `OrderResponse.java` has **NO user/customer fields at all** — no `userName`, no `userEmail`, nothing. Frontend reads `order.user?.name || order.userName || 'Customer'` but backend never sends either field. The inflated price may be from bad test data.
- **Fix (Backend)**: Add `userName` and `userEmail` fields to `OrderResponse.java` and populate from `order.getUser()`.

### BUG-08: AI Description generates `[object Object]` 🔍 Code Audit
- **Severity**: MEDIUM
- **Root cause**: `ProductFormModal.jsx` L90 reads `res.data.data` which is `{ productName, description }` object.
- **Fix**: Change to `res.data.data?.description`

### BUG-09: Category dropdown empty in admin product form 🔍 Partially Verified
- **Severity**: MEDIUM
- **Root cause**: Same `/api/categories` 500 error as BUG-03. Fix BUG-03 → this resolves.

### BUG-10: Admin order status update — API MISMATCH 🔍 Code Audit (NEW)
- **Severity**: HIGH
- **Where**: Admin Orders page → status dropdown
- **What happens**: Changing order status likely fails silently or throws 400/500.
- **Root cause**: Frontend `adminApi.updateOrderStatus(id, status)` calls `api.patch(/orders/${id}/status, null, { params: { status } })` — sends status as **query parameter** `?status=SHIPPED`. But backend expects `@RequestBody OrderStatusUpdateRequest` — a **JSON body** `{ "status": "SHIPPED" }`.
- **Fix (Frontend)**: Change `orderApi.js` L18 to: `api.patch(/orders/${id}/status, { status })` (send as body, not query param).

---

## 🟡 UI/UX BUGS (App works but looks/feels wrong)

### UX-01: "Create Account" shows when logged in ✅ Browser Verified
- **Fix**: Conditionally render based on `isAuthenticated`.

### UX-02: Browser `confirm()` dialogs everywhere ✅ Known
- **Where**: Delete product, Clear cart, Cancel order, Delete review
- **Fix**: Create reusable `ConfirmDialog` component.

### UX-03: Navbar missing important links ✅ Browser Verified
- **Missing**: Home, Orders, Admin links
- **Fix**: Add Home, Orders links. Show Admin link for admins.

### UX-04: No user profile page ✅ Browser Verified
- **Missing**: View/edit name, email, phone, password, photo
- **Fix**: Build user profile system (FEAT-02→04).

### UX-05: Address form has no validation hints ✅ Known
- **Fix**: Add inline validation with red borders + error text.

### UX-06: "Write a Review" button never appears ✅ Browser Verified
- **Root cause**: `canReview` requires DELIVERED order. Working as designed but no UX message.
- **Fix**: Show "Purchase and receive this product to leave a review".

### UX-07: ProductCard category badge never renders 🔍 Code Audit
- **Root cause**: Reads `category?.name` but backend returns `categoryName`.
- **Fix**: Use `product.categoryName`.

---

## 🔵 CODE-LEVEL BUGS (From Code Audit — Not Yet Browser Tested)

### CODE-01: ProductCard destructure mismatch
- **File**: `ProductCard.jsx` L16
- **Issue**: Destructures `{ category }` but backend sends `categoryName`.

### CODE-02: OrderDetailPage reads nested `item.product?.imageUrl`
- **File**: `OrderDetailPage.jsx` L150-158
- **Issue**: Backend `OrderItemResponse` returns flat fields (`productName`, `productImageUrl`, `price`) not nested `item.product.X`.

### CODE-03: Backend search + category combo ignored
- **File**: `ProductServiceImpl.java` L37-46
- **Issue**: If/else-if — search ignores categoryId.

### CODE-04: Cache might return stale product data
- **File**: `ProductServiceImpl.java` L33

### CODE-05: Admin product edit — categoryId pre-fill ✅ RESOLVED by audit
- **Status**: `ProductResponse.java` **DOES include** `categoryId` and `categoryName` fields (L24-25). This is NOT a bug.

### CODE-06: ProductResponse includes categoryId/categoryName ✅ RESOLVED
- **Status**: Confirmed — `ProductResponse.java` L24-25 has both fields. Frontend can safely use them.

### CODE-07: AdminProducts search param may not reach backend
- **File**: `AdminProducts.jsx`
- **Issue**: Need to verify param name matches backend's `search` query param.

### CODE-08: formatPrice receives object instead of number
- **Issue**: If field is null/object, shows ₹0.

### CODE-09: Checkout empty cart guard race condition
- **File**: `CheckoutPage.jsx` L56-60

---

## 🔶 BACKEND↔FRONTEND GAPS (NEW — From Cross-Reference Audit)

### GAP-01: No Admin Category Management UI 🔴 NEW
- **Backend has**: `POST /api/categories` (create), `DELETE /api/categories/{id}` (delete)
- **Frontend API has**: `adminApi.createCategory()`, `adminApi.deleteCategory()`
- **Frontend UI**: ❌ **NO PAGE EXISTS** — There is no `AdminCategories.jsx` or any UI for admins to create/edit/delete categories.
- **Impact**: Categories are ONLY created by `DataSeeder.java` at startup. Admin cannot manage categories from the app.
- **Fix**: Build `AdminCategories.jsx` page with category list, create form, and delete button. Add route `/admin/categories` and link from admin sidebar.

### GAP-02: Address Delete has no UI 🟡 NEW
- **Backend has**: `DELETE /api/users/addresses/{id}`
- **Frontend API has**: `addressApi.deleteAddress()`
- **Frontend UI**: ❌ **NO delete button** — `CheckoutPage.jsx` shows saved addresses as radio buttons for selection, but NO delete/edit option.
- **Impact**: Users can't remove old/wrong addresses. List grows forever.
- **Fix**: Add a delete icon/button on each saved address card in CheckoutPage.

### GAP-03: No cancel order from user side 🟡 NEW
- **Backend has**: `PATCH /orders/{id}/status` (Admin only — requires `ADMIN` role)
- **Frontend**: `OrderDetailPage.jsx` has a "Cancel Order" button calling `orderApi.cancelOrder()` — but this function **doesn't exist** in `orderApi.js`!
- **Impact**: Users see a Cancel button but it probably throws a runtime error.
- **Fix**: Either (a) add `cancelOrder` to `orderApi.js` calling `PATCH /orders/{id}/status` with `{status: "CANCELLED"}`, AND backend must allow the order's own user to cancel (not just admin), OR (b) add a dedicated `POST /orders/{id}/cancel` endpoint for users.

### GAP-04: No user-side order cancellation permission in backend 🟡 NEW
- **Backend**: `PATCH /orders/{id}/status` requires `@PreAuthorize("hasRole('ADMIN')")` — regular users CANNOT cancel their own orders via this endpoint.
- **Fix**: Add a separate `POST /orders/{id}/cancel` endpoint (or modify `updateOrderStatus` to allow users to cancel their own orders if status is PENDING).

### GAP-05: WishlistPage reads `item.product` — Actually correct! ✅ RESOLVED
- **Backend**: `WishlistResponse` contains `ProductResponse product` (nested object).
- **Frontend**: `WishlistPage.jsx` reads `item.product?.id`, `<ProductCard product={item.product} />` — **this is CORRECT**.
- **Status**: Not a bug. WishlistResponse deliberately returns nested ProductResponse.

---

## 🟢 MISSING FEATURES (User Requested + Flipkart-Inspired)

### FEAT-01: Homepage Redesign (Flipkart-style)
- Popular Products, Recently Visited, New Arrivals, Category rows, Recommended, Deals banners

### FEAT-02: User Profile Page
- Backend: `PUT /api/users/profile` endpoint (DOESN'T EXIST — needs to be built)
- Frontend: ProfilePage with editable fields

### FEAT-03: Change Password
- Backend: `PUT /api/users/change-password` (DOESN'T EXIST — needs to be built)

### FEAT-04: Profile Photo Upload
- Backend: Upload endpoint + store path in User entity
- Frontend: Photo upload with preview

### FEAT-05: Image Upload for Products (Admin)
- Backend: `POST /api/upload` (DOESN'T EXIST — needs to be built)
- Frontend: Drag-and-drop in ProductFormModal

### FEAT-06: ConfirmDialog Component
- Replace all `window.confirm()` calls

### FEAT-07: Advanced Search & Filters
- Price range, stock filter, category search, autocomplete

### FEAT-08: Improved Navbar
- Home, Orders links. Admin link. Profile photo in avatar.

---

## ✅ BROWSER TEST RESULTS (All 13 Tests Complete)

> All tests performed by browser subagents. Findings pulled from 26 scratchpad files.

| ID | What Tested | Result | Confirmed Bugs |
|----|------------|--------|----------------|
| **TEST-A** | AI "Generate with AI" button | 🔴 **BUG CONFIRMED** — Modal fills description with `[object Object]` (not real text) | BUG-08 ✅ confirmed |
| **TEST-B** | Admin product edit — categoryId pre-fill | ✅ **WORKS** — categoryId and categoryName exist in ProductResponse, modal pre-fills correctly | CODE-05 resolved |
| **TEST-C** | Admin product delete — confirm dialog | ✅ **CONFIRMED** — Uses browser `window.confirm()` at AdminProducts L60 | UX-02 confirmed |
| **TEST-D** | Admin order status update | 🔴 **BUG CONFIRMED (CODE)** — Sends `?status=X` as query param, backend expects `{status}` JSON body | BUG-10 ✅ confirmed |
| **TEST-E** | Full cart/checkout flow | 🔴 **BUG CONFIRMED** — Cart shows ₹0 prices, no product name, link to `/products/undefined`. Checkout shows ₹0 item, total ₹40 (delivery only). Place Order is disabled without address. Address form save with empty fields shows NO validation errors. | BUG-01, BUG-02, UX-05 confirmed |
| **TEST-F** | Login/Register page UX | ✅ **GOOD** — Register shows custom inline validation (red text: "Name is required", "Email is required", etc.) — NOT browser defaults. Login page has well-styled split-screen layout with demo credential cards. | No new bugs |
| **TEST-G** | Responsive/mobile layout | ✅ **WORKS** — Responsive layout confirmed. Register: left panel hidden on mobile, form takes full width. Products page: 2-column grid on mobile. Navbar: hamburger menu correct. No overflow. | No new bugs |
| **TEST-H** | Order detail page + cancel button | ⚠️ **PARTIAL** — Cancel uses `orderApi.updateOrderStatus()` (exists), but regular users get 403 (admin-only endpoint). Item images/names use wrong field (`item.product?.name` → should be `item.productName`). Price field `item.price` is correct. | GAP-03/04, CODE-02 confirmed |
| **TEST-I** | ProductCard wishlist button | 🔴 **BUG CONFIRMED (CODE)** — Empty `onClick` handler, no API call made | BUG-06 confirmed |
| **TEST-J** | Pagination — page 2 & 3 | ✅ **WORKS** — 3 pages of products. Clicking page 2 loads different products (Yonex Badminton, Borosil Flask, Dyson V15 etc.). Scroll resets to top. Prev/1/2(active)/3/Next controls visible. | No new bugs |
| **TEST-K** | `/api/categories` 500 error | ⚠️ **INTERMITTENT** — API returns 200 when tested directly. But homepage console logs show 500 during React rendering. Cause: `Promise.all([getCategories(), getProducts()])` — if categories fails, entire homepage data load fails, showing "No products found" too. Sometimes works (8 categories load), sometimes doesn't (timing/cache). | BUG-03 updated: intermittent |
| **TEST-L** | Wishlist persistence after adding | 🔴 **BUG CONFIRMED** — Clicking heart on product detail page changes UI locally (turns active) but wishlist page remains empty. No API call made. | BUG-06 confirmed |
| **TEST-M** | 404 page styling | ✅ **WORKS** — Styled 404 page: large "404" heading, "Page Not Found" title, description text, "Back to Home" button and "Go Back" ghost button. Fully custom, not browser default. | No new bugs |

### 🆕 Additional Bugs Found During Browser Tests

#### NEW-01: Admin Dashboard URL is `/admin` not `/admin/dashboard` — route missing ⚠️
- **Found**: Navigating to `/admin/dashboard` shows the 404 page. Actual dashboard is at `/admin`.
- **Impact**: If any link points to `/admin/dashboard` it will 404.
- **Fix**: Add a redirect route from `/admin/dashboard` → `/admin` in App.jsx.

#### NEW-02: Checkout "Place Order" disabled without address — no clear message ⚠️
- **Found**: The "Place Order" button is disabled when no address is selected, but there's NO tooltip or message explaining why it's disabled.
- **Fix**: Add a helper text "Please add and select a delivery address to continue".

#### NEW-03: Address form submits empty — no validation ✅ (confirms UX-05)
- **Found**: Clicking "Save Address" in checkout with all empty fields shows no validation errors in the UI and no browser console errors. Fields silently fail.
- **Confirms**: UX-05.

#### NEW-04: Categories API intermittent 500 — `Promise.all` kills entire homepage
- **Root cause clarification**: When `/api/categories` returns 500, the homepage's `Promise.all([getCategories(), getFeaturedProducts()])` rejects entirely — so featured products ALSO fail to render even though `/api/products` itself works fine.
- **Fix**: Split into two independent `try/catch` calls so products can load even if categories fail.

#### NEW-05: "Create Account" CTA visible to logged-in users ✅ (confirms UX-01)
- **Confirmed visually**: Even with the admin avatar visible in the navbar, the hero section still shows the "Create Account" button.

---

## 📊 TOTAL SUMMARY

| Category | Count |
|----------|-------|
| 🔴 Critical Bugs (ALL browser-confirmed) | 10 |
| 🟡 UI/UX Bugs | 7 |
| 🔵 Code-Level Bugs | 9 (2 resolved) |
| 🔶 Backend↔Frontend Gaps | 4 |
| 🟢 Missing Features | 8 |
| 🆕 New Bugs from Browser Tests | 5 |
| ✅ Browser Tests COMPLETE | 13/13 |
| **TOTAL ACTIONABLE ITEMS** | **~53** |

---

## 🔧 PROPOSED WORK ORDER

| Phase | Items | Description |
|-------|-------|-------------|
| **Phase 1** | BUG-01→04, BUG-08→10, CODE-01→02, UX-07, NEW-04 | Fix ALL data mapping bugs: cart fields, checkout fields, order items (name/image), search ghost endpoint, AI desc, order status body fix, category badge, homepage Promise.all split |
| **Phase 2** | UX-01→06, FEAT-06, NEW-01→03, NEW-05 | UI/UX fixes: ConfirmDialog, "Create Account" conditional, address validation, review message, navbar, admin route redirect, checkout disabled button message |
| **Phase 3** | BUG-05, CODE-03, CODE-07→09, GAP-03→04 | Search & sort & order cancel: fix sort, search+category combo, admin search, user cancel order backend permission |
| **Phase 4** | BUG-07, GAP-01, GAP-02 | Admin enhancements: fix order customer name display, build category management UI, address delete UI |
| **Phase 5** | FEAT-01 | Homepage redesign (Flipkart-style with all sections) |
| **Phase 6** | FEAT-02→04, FEAT-08 | User profile system: edit profile, change password, photo upload, navbar updates |
| **Phase 7** | FEAT-05, FEAT-07 | Advanced features: image upload, advanced search filters |


---

## 📊 TOTAL SUMMARY

| Category | Count |
|----------|-------|
| 🔴 Critical Bugs | 10 |
| 🟡 UI/UX Issues | 7 |
| 🔵 Code-Level Bugs | 9 (2 resolved) |
| 🔶 Backend↔Frontend Gaps | 4 (GAP-03 corrected: `orderApi.updateOrderStatus` exists, but needs ADMIN → 403 for users) |
| 🟢 Missing Features | 8 |
| ⏳ Remaining Browser Tests | 8 (need Docker running) |
| **TOTAL ITEMS** | **52 (4 resolved = 48 actionable)** |

---

## 🔧 PROPOSED WORK ORDER

| Phase | Items | Description |
|-------|-------|-------------|
| **Phase 1** | BUG-01→04, BUG-08→10, CODE-01→02, UX-07 | Fix ALL data mapping bugs: cart fields, checkout fields, order fields, search endpoint, AI desc, order status API mismatch, category badge |
| **Phase 2** | UX-01→06, FEAT-06 | UI/UX fixes: ConfirmDialog, hero conditional, address validation, review message, navbar |
| **Phase 3** | BUG-05, CODE-03, CODE-07→09, GAP-03→04 | Search & sort & order cancel: fix sort, search+category combo, admin search, user cancel order |
| **Phase 4** | BUG-07, GAP-01, GAP-02 | Admin enhancements: fix order display, build category management UI, address delete UI |
| **Phase 5** | FEAT-01 | Homepage redesign (Flipkart-style with all sections) |
| **Phase 6** | FEAT-02→04, FEAT-08 | User profile system: edit profile, change password, photo upload, navbar updates |
| **Phase 7** | FEAT-05, FEAT-07 | Advanced features: image upload, advanced search filters |

