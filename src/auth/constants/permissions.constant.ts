export const PERMISSIONS = {
  USERS: {
    READ: 'users:read',
    READ_CONFIDENTIAL: 'users:read_confidential',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  PRODUCTS: {
    READ: 'products:read',
    CREATE: 'products:create',
    UPDATE: 'products:update',
    DELETE: 'products:delete',
  },
  ORDERS: {
    READ_OWN: 'orders:read:own',
    READ_ANY: 'orders:read:any',
    UPDATE_OWN: 'orders:update:own',
    UPDATE_ANY: 'orders:update:any',
  },

  CARTS: {
    READ_OWN: 'carts:read:own',
    CREATE: 'carts:create',
    UPDATE_OWN: 'carts:update:own',
    DELETE_OWN: 'carts:delete:own',
  },
  COMMENTS: {
    READ: 'comments:read',
    CREATE: 'comments:create',
    UPDATE_OWN: 'comments:update:own',
    DELETE_OWN: 'comments:delete:own',
    DELETE_ANY: 'comments:delete:any',
  },
  PRODUCT_PHOTOS: {
    CREATE: 'product_photos:create',
    UPDATE: 'product_photos:update',
    DELETE: 'product_photos:delete',
  },
  CATEGORIES: {
    CREATE: 'categories:create',
    UPDATE: 'categories:update',
    DELETE: 'categories:delete',
  },
} as const;
