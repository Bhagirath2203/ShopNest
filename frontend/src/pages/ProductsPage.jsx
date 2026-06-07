import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import ProductGrid from '../components/product/ProductGrid';
import SearchBar from '../components/product/SearchBar';
import useDebounce from '../hooks/useDebounce';
import './ProductsPage.css';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price,asc', label: 'Price: Low → High' },
  { value: 'price,desc', label: 'Price: High → Low' },
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'name,asc', label: 'Name: A → Z' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const currentCategoryId = searchParams.get('categoryId') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories();
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '0'); // reset to first page on search
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch products when URL params change
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        size: 12,
      };

      if (currentSort) params.sort = currentSort;
      if (currentCategoryId) params.categoryId = currentCategoryId;

      let response;
      if (currentSearch) {
        response = await productApi.searchProducts(currentSearch, params);
      } else {
        response = await productApi.getProducts(params);
      }

      const data = response.data.data;
      setProducts(data.content || data);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || (data.content || data).length);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSort, currentCategoryId, currentSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Filter handlers ──

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '0');
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = currentCategoryId || currentSort || currentSearch;

  // Get category name by id
  const getCategoryName = (id) =>
    categories.find((c) => String(c.id) === String(id))?.name || '';

  // ── Pagination ──

  const goToPage = (page) => {
    updateParam('page', String(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) { start = 1; end = maxVisible - 2; }
      if (currentPage >= totalPages - 3) { start = totalPages - maxVisible + 1; end = totalPages - 2; }

      if (start > 1) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push('...');

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">All Products</h1>
          <p className="page-subtitle">Browse our entire collection</p>
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="products-toolbar__left">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search products..."
            />

            {/* Category Filter */}
            <div className="products-filter">
              <select
                className="products-filter__select"
                value={currentCategoryId}
                onChange={(e) => updateParam('categoryId', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <FiChevronDown className="products-filter__chevron" />
            </div>
          </div>

          <div className="products-toolbar__right">
            {/* Sort */}
            <div className="products-filter">
              <select
                className="products-filter__select"
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <FiChevronDown className="products-filter__chevron" />
            </div>

            {/* Results count */}
            <span className="products-info">
              <span className="products-info__count">{totalElements}</span> products
            </span>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="products-active-filters">
            {currentSearch && (
              <span className="products-active-filter">
                Search: "{currentSearch}"
                <button
                  className="products-active-filter__remove"
                  onClick={() => { setSearchInput(''); updateParam('search', ''); }}
                >
                  <FiX />
                </button>
              </span>
            )}
            {currentCategoryId && (
              <span className="products-active-filter">
                Category: {getCategoryName(currentCategoryId)}
                <button
                  className="products-active-filter__remove"
                  onClick={() => updateParam('categoryId', '')}
                >
                  <FiX />
                </button>
              </span>
            )}
            {currentSort && (
              <span className="products-active-filter">
                Sort: {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}
                <button
                  className="products-active-filter__remove"
                  onClick={() => updateParam('sort', '')}
                >
                  <FiX />
                </button>
              </span>
            )}
            <button className="products-clear-all" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid products={products} loading={loading} skeletonCount={12} />

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="pagination">
            <button
              className="pagination__btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <FiChevronLeft />
            </button>

            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination__ellipsis">…</span>
              ) : (
                <button
                  key={page}
                  className={`pagination__btn ${page === currentPage ? 'pagination__btn--active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page + 1}
                </button>
              )
            )}

            <button
              className="pagination__btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
