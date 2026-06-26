import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import DeliveryLayout from '../layouts/DeliveryLayout';

// Public Pages
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';

// Customer Pages
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import Orders from '../pages/customer/Orders';
import TrackOrder from '../pages/customer/TrackOrder';
import Profile from '../pages/customer/Profile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import CustomerManagement from '../pages/admin/CustomerManagement';
import DeliveryAgentManagement from '../pages/admin/DeliveryAgentManagement';

// Delivery Pages
import DeliveryDashboard from '../pages/delivery/DeliveryDashboard';
import AvailableOrders from '../pages/delivery/AvailableOrders';
import AcceptedOrders from '../pages/delivery/AcceptedOrders';
import DeliveryTracking from '../pages/delivery/DeliveryTracking';

export const AppRoutes = () => {
  const { token, getCurrentUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      getCurrentUser().catch(() => {});
    }
  }, [token, getCurrentUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Customer Private Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
                <CustomerLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customer/profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="track" element={<TrackOrder />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>

        {/* Admin Private Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="delivery-agents" element={<DeliveryAgentManagement />} />
        </Route>

        {/* Delivery Agent Private Routes */}
        <Route
          path="/delivery"
          element={<DeliveryLayout />}
        >
          <Route index element={<DeliveryDashboard />} />
          <Route path="available-orders" element={<AvailableOrders />} />
          <Route path="accepted-orders" element={<AcceptedOrders />} />
          <Route path="tracking" element={<DeliveryTracking />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-lg font-bold">404 - Section Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
