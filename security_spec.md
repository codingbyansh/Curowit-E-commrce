# Curowit Storefront & Admin CMS — Firestore Security Specification

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched in `firestore.rules` are denied (`allow read, write: if false;`).
2. **Path Variable Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates the path document ID via `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
3. **Public Storefront Read Isolation**: Storefront catalog documents (`products`, `creators`, `workshops`, `stories`, `hero_slides`, `announcements`) are only listable when `resource.data.visibility == 'public'`.
4. **Authorized CMS Mutation Gate**: Creating, updating, or deleting storefront catalog items requires either a verified administrator (`isAdmin()`) or a valid CMS passkey token in the validated payload (`incoming().cmsAccessKey == 'ansh@siya'`) combined with strict schema validation (`hasAll`, `hasOnly`, string/array `.size()` bounds, and server timestamp `incoming().updatedAt == request.time`).
5. **Immutable Identity Fields**: Document `id` and `visibility` fields cannot be altered during `update` (`incoming().id == existing().id`).

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: Product payload containing an undeclared `isSuperAdmin: true` property -> Rejected by `.keys().hasOnly(...)`.
2. **Oversized ID Poisoning**: Creating a product with a 256-character or regex-invalid ID -> Rejected by `isValidId(productId)`.
3. **Missing CMS Key / Unauthorized Write**: Creating or updating a product with `cmsAccessKey: 'wrong'` as a non-admin -> Rejected by `hasCmsAuthorization()`.
4. **Timestamp Forgery**: Sending a client-crafted past/future `updatedAt` timestamp -> Rejected by `incoming().updatedAt == request.time`.
5. **Unbounded Array Injection**: Sending a product with 25 gallery items -> Rejected by `data.gallery.size() <= 10`.
6. **Type Confusion on Price**: Sending `price: "899"` (string instead of number) -> Rejected by `data.price is number`.
7. **ID Mutation on Update**: Updating a product document while changing `id` to a different value -> Rejected by `incoming().id == existing().id`.
8. **Invalid Enum on Workshop Format**: Creating a workshop with `format: "Hybrid"` -> Rejected by `data.format in ['Live Online', 'Studio Offline']`.
9. **Invalid Enum on HeroSlide Action**: Creating a hero slide with `action: "external-url"` -> Rejected by `data.action in ['shop-handmade', 'shop-creators', 'explore-all']`.
10. **Unscoped List Query on Orders**: Listing `/orders` without filtering by `cmsAccessKey == 'ansh@siya'` -> Rejected by `resource.data.cmsAccessKey == 'ansh@siya'`.
11. **Oversized Description String**: Sending a 5,000-character product description -> Rejected by `data.description.size() <= 2000`.
12. **Self-Assigned Admin Record**: Non-admin user attempting to write to `/admins/{uid}` -> Rejected by `allow write: if false;`.

## 3. Test Runner Specification
`firestore.rules.test.ts` validates that all 12 Dirty Dozen payloads are rejected with `PERMISSION_DENIED` while legitimate public storefront reads and authorized CMS writes succeed.
