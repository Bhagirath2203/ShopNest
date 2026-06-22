/**
 * Generates a reliable placeholder image URL using placehold.co.
 * Used as fallback when product images fail to load (e.g., picsum.photos down).
 *
 * @param {string} name - Product name (used to generate initials)
 * @param {string} categoryName - Category name (used for color coding)
 * @param {number} size - Image dimensions (default 400)
 * @returns {string} placehold.co URL
 */
const CATEGORY_COLORS = {
  Electronics: '6366f1',
  Clothing:    'ec4899',
  Books:       'f59e0b',
  'Home & Kitchen': '10b981',
  Sports:      '3b82f6',
  Beauty:      'e11d48',
  Toys:        '8b5cf6',
  Groceries:   '059669',
};

export const getPlaceholderImage = (name = 'Product', categoryName = '', size = 400) => {
  const color = CATEGORY_COLORS[categoryName] || '64748b';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `https://placehold.co/${size}x${size}/${color}/ffffff?text=${encodeURIComponent(initials)}&font=roboto`;
};

/**
 * Image onError handler — swaps the failed src with a branded placeholder.
 * Usage: <img onError={(e) => handleImageError(e, name, categoryName)} />
 */
export const handleImageError = (e, name, categoryName, size = 400) => {
  const placeholder = getPlaceholderImage(name, categoryName, size);
  if (e.target.src !== placeholder) {
    e.target.src = placeholder;
  }
};
