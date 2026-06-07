import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Placeholder pages (will be built in later days)
const PlaceholderPage = ({ title }) => (
  <div className="page">
    <div className="container fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '50vh', textAlign: 'center', gap: '1rem',
    }}>
      <h1 className="page-title">{title}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Coming soon...</p>
    </div>
  </div>
);

const CartPage = () => <PlaceholderPage title="🛒 Your Cart" />;
const CheckoutPage = () => <PlaceholderPage title="💳 Checkout" />;
const OrdersPage = () => <PlaceholderPage title="📋 My Orders" />;
const OrderDetailPage = () => <PlaceholderPage title="📋 Order Details" />;
const WishlistPage = () => <PlaceholderPage title="💜 Wishlist" />;
const AdminDashboard = () => <PlaceholderPage title="🛡️ Admin Dashboard" />;
const AdminProducts = () => <PlaceholderPage title="🛡️ Manage Products" />;
const AdminOrders = () => <PlaceholderPage title="🛡️ Manage Orders" />;

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes (logged in users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;

