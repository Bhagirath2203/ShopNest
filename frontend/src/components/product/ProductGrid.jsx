import { FiPackage } from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products, loading, skeletonCount = 8 }) => {
  // Loading skeleton
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="product-grid">
        <div className="product-grid__empty">
          <FiPackage className="product-grid__empty-icon" />
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms to find what you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
