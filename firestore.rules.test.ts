/**
 * Firestore Security Rules — Dirty Dozen Red-Team Verification Suite
 * Validates that all 12 adversarial payloads defined in security_spec.md
 * are rejected with PERMISSION_DENIED.
 */

export const DIRTY_DOZEN_PAYLOADS = [
  {
    id: 1,
    name: 'Shadow Field Injection',
    collection: 'products',
    docId: 'prod-1',
    payload: {
      id: 'prod-1',
      visibility: 'public',
      cmsAccessKey: 'ansh@siya',
      name: 'Test Product',
      isSuperAdmin: true, // Ghost field rejected by hasOnly()
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Oversized ID Poisoning',
    collection: 'products',
    docId: 'a'.repeat(200),
    payload: { id: 'a'.repeat(200) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Invalid CMS Passkey Write',
    collection: 'products',
    docId: 'prod-1',
    payload: {
      id: 'prod-1',
      visibility: 'public',
      cmsAccessKey: 'invalid_key',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Timestamp Forgery',
    collection: 'products',
    docId: 'prod-1',
    payload: {
      id: 'prod-1',
      visibility: 'public',
      cmsAccessKey: 'ansh@siya',
      updatedAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Unbounded Array Injection',
    collection: 'products',
    docId: 'prod-1',
    payload: {
      id: 'prod-1',
      gallery: new Array(25).fill('/images/test.jpg'),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Type Confusion on Price',
    collection: 'products',
    docId: 'prod-1',
    payload: {
      id: 'prod-1',
      price: '899',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'ID Mutation on Update',
    collection: 'products',
    docId: 'prod-1',
    payload: {
      id: 'prod-mutated',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Invalid Enum on Workshop Format',
    collection: 'workshops',
    docId: 'ws-1',
    payload: {
      id: 'ws-1',
      format: 'Hybrid',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Invalid Enum on HeroSlide Action',
    collection: 'hero_slides',
    docId: 'slide-0',
    payload: {
      id: 0,
      action: 'external-phishing',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Unscoped List Query on Orders',
    collection: 'orders',
    docId: '*',
    payload: {},
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Oversized Description String',
    collection: 'products',
    docId: 'prod-1',
    payload: {
      id: 'prod-1',
      description: 'x'.repeat(5000),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Self-Assigned Admin Privilege',
    collection: 'admins',
    docId: 'attacker-uid',
    payload: {
      email: 'attacker@example.com',
    },
    expected: 'PERMISSION_DENIED',
  },
];
