export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_COLORS = {
  PENDING: { bg: 'var(--warning-bg)', text: 'var(--warning)' },
  CONFIRMED: { bg: 'var(--info-bg)', text: 'var(--info)' },
  SHIPPED: { bg: 'var(--primary-subtle)', text: 'var(--primary-light)' },
  DELIVERED: { bg: 'var(--success-bg)', text: 'var(--success)' },
  CANCELLED: { bg: 'var(--error-bg)', text: 'var(--error)' },
};

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Groceries',
];

export const ITEMS_PER_PAGE = 12;
