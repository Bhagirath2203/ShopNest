import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiMapPin, FiPlus, FiChevronDown, FiChevronUp,
  FiShoppingBag, FiCheck
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { addressApi } from '../api/addressApi';
import { orderApi } from '../api/orderApi';
import { formatPrice } from '../utils/formatters';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  // New address form
  const [form, setForm] = useState({
    street: '', city: '', state: '', pincode: '', country: 'India', phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity, 0
  );
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal >= 500 ? 0 : 40;
  const total = subtotal + gst + delivery;

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await addressApi.getAddresses();
        const addrs = res.data.data || [];
        setAddresses(addrs);
        if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
      } catch {
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      navigate('/cart');
    }
  }, [loading, items.length, navigate]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.street.trim()) errors.street = 'Street address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (!form.pincode.trim()) errors.pincode = 'PIN code is required';
    else if (!/^[0-9]{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit PIN code';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(form.phone.trim())) errors.phone = 'Enter a valid 10-digit phone number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await addressApi.createAddress(form);
      const newAddr = res.data.data;
      setAddresses([...addresses, newAddr]);
      setSelectedAddressId(newAddr.id);
      setShowAddForm(false);
      setForm({ street: '', city: '', state: '', pincode: '', country: 'India', phone: '' });
      setFormErrors({});
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.warning('Please select a delivery address');
      return;
    }
    try {
      setPlacing(true);
      await orderApi.placeOrder(selectedAddressId);
      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container fade-in">
          <h1 className="page-title">Checkout</h1>
          <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container fade-in">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-layout">
          {/* ── Left: Address + Items ── */}
          <div className="checkout-left">

            {/* Address Selection */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">
                <FiMapPin /> Delivery Address
              </h2>

              {addresses.length > 0 ? (
                <div className="checkout-addresses">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`checkout-address${selectedAddressId === addr.id ? ' checkout-address--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="checkout-address__radio"
                      />
                      <div className="checkout-address__body">
                        <span className="checkout-address__street">{addr.street}</span>
                        <span className="checkout-address__city">
                          {addr.city}, {addr.state} {addr.pincode}
                        </span>
                        <span className="checkout-address__phone">{addr.phone}</span>
                      </div>
                      {selectedAddressId === addr.id && (
                        <FiCheck className="checkout-address__check" />
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="checkout-section__empty">
                  No saved addresses. Add one below.
                </p>
              )}

              {/* Add New Address Toggle */}
              <button
                className="btn btn-ghost btn-sm checkout-add-btn"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? <FiChevronUp /> : <FiPlus />}
                {showAddForm ? 'Hide Form' : 'Add New Address'}
              </button>

              {showAddForm && (
                <form className="checkout-address-form" onSubmit={handleAddAddress}>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input
                      className={`form-input${formErrors.street ? ' form-input--error' : ''}`}
                      name="street"
                      value={form.street} onChange={handleFormChange}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {formErrors.street && <span className="form-error">{formErrors.street}</span>}
                  </div>
                  <div className="checkout-form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        className={`form-input${formErrors.city ? ' form-input--error' : ''}`}
                        name="city"
                        value={form.city} onChange={handleFormChange}
                      />
                      {formErrors.city && <span className="form-error">{formErrors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        className={`form-input${formErrors.state ? ' form-input--error' : ''}`}
                        name="state"
                        value={form.state} onChange={handleFormChange}
                      />
                      {formErrors.state && <span className="form-error">{formErrors.state}</span>}
                    </div>
                  </div>
                  <div className="checkout-form-row">
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input
                        className={`form-input${formErrors.pincode ? ' form-input--error' : ''}`}
                        name="pincode"
                        value={form.pincode} onChange={handleFormChange}
                        placeholder="400001"
                      />
                      {formErrors.pincode && <span className="form-error">{formErrors.pincode}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        className={`form-input${formErrors.phone ? ' form-input--error' : ''}`}
                        name="phone"
                        value={form.phone} onChange={handleFormChange}
                        placeholder="9876543210"
                      />
                      {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Address
                  </button>
                </form>
              )}
            </section>

            {/* Order Items Preview */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">
                <FiShoppingBag /> Order Items ({cartCount})
              </h2>
              <div className="checkout-items">
                {items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <img
                      className="checkout-item__image"
                      src={item.productImageUrl || `https://picsum.photos/seed/${item.productId}/80/80`}
                      alt={item.productName}
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${item.productId || 'def'}/80/80`;
                      }}
                    />
                    <div className="checkout-item__info">
                      <span className="checkout-item__name">{item.productName}</span>
                      <span className="checkout-item__qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="checkout-item__price">
                      {formatPrice((item.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: Summary ── */}
          <div className="checkout-summary">
            <h3 className="checkout-summary__title">Order Summary</h3>
            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>GST (18%)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Delivery</span>
              <span className={delivery === 0 ? 'checkout-summary__free' : ''}>
                {delivery === 0 ? 'FREE' : formatPrice(delivery)}
              </span>
            </div>
            <hr className="checkout-summary__divider" />
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button
              className="btn btn-primary btn-lg checkout-summary__place"
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddressId}
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>

            {!selectedAddressId && (
              <p className="checkout-summary__hint">
                <FiMapPin style={{ marginRight: '4px' }} />
                Please add and select a delivery address to continue
              </p>
            )}

            <Link to="/cart" className="checkout-summary__back">
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
