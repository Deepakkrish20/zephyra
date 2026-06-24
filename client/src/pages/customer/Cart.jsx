import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Card, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';

export const Cart = () => {
  const {
    cartItems,
    totalPrice,
    itemCount,
    loading,
    error,
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();

  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    getCart();
  }, []);

  const handleUpdateQty = async (productId, newQty, currentStock) => {
    if (newQty <= 0) return;
    if (newQty > currentStock) {
      alert(`Cannot update quantity. Only ${currentStock} units are available in stock.`);
      return;
    }

    setUpdatingItemId(productId);
    try {
      await updateQuantity(productId, newQty);
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingItemId(productId);
    try {
      await removeFromCart(productId);
    } catch (err) {
      alert('Failed to remove item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (err) {
        alert('Failed to clear cart');
      }
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader size="lg" text="Retrieving your cart items..." color="primary" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-app-border rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="p-3 bg-app-bg-secondary rounded-full text-app-text-secondary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-lg">Your Cart is Empty</h3>
          <p className="text-sm text-app-text-secondary mt-1">
            Browse our catalogue to find products ready for real-time delivery.
          </p>
        </div>
        <Link to="/products">
          <Button variant="primary" size="md" className="font-bold cursor-pointer">
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-app-text-primary">
            Your Shopping Cart
          </h1>
          <p className="text-xs text-app-text-secondary mt-0.5">
            You have {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="font-bold text-xs text-danger-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 cursor-pointer"
          icon={Trash2}
          isDisabled={loading}
        >
          Clear Cart
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Item Listing */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const { product, quantity } = item;
            const isUpdating = updatingItemId === product._id;
            const isMaxStock = quantity >= product.stock;

            return (
              <Card key={product._id} className="relative overflow-hidden bg-app-bg-primary border border-app-border rounded-xl">
                {isUpdating && (
                  <div className="absolute inset-0 bg-app-bg-primary/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Loader size="sm" color="primary" />
                  </div>
                )}
                <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4">
                  {/* Left block: Product detail */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-20 h-20 bg-app-bg-secondary rounded-lg flex-shrink-0 overflow-hidden border border-app-border">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-app-text-secondary">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Link to={`/products/${product._id}`} className="hover:underline">
                        <h3 className="font-extrabold text-sm text-app-text-primary leading-tight line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-app-text-secondary font-medium">
                        Stock: {product.stock} units available
                      </p>
                    </div>
                  </div>

                  {/* Right block: quantity controls and price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-app-border">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-app-border rounded-lg bg-app-bg-secondary overflow-hidden">
                      <button
                        onClick={() => handleUpdateQty(product._id, quantity - 1, product.stock)}
                        disabled={quantity <= 1 || isUpdating}
                        className="p-2 hover:bg-app-bg-primary text-app-text-secondary hover:text-app-text-primary disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-app-text-primary min-w-[24px] text-center select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(product._id, quantity + 1, product.stock)}
                        disabled={isMaxStock || isUpdating}
                        className="p-2 hover:bg-app-bg-primary text-app-text-secondary hover:text-app-text-primary disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title={isMaxStock ? 'Maximum available stock reached' : 'Increase quantity'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price and Remove Button */}
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="font-extrabold text-sm text-app-text-primary">
                          ${(product.price * quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(product._id)}
                        disabled={isUpdating}
                        className="text-danger-500 hover:text-danger-600 p-2 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg cursor-pointer transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Cart Summary Column */}
        <div>
          <Card className="bg-app-bg-primary border border-app-border rounded-xl shadow-sm">
            <CardBody className="p-5 space-y-4">
              <h3 className="font-extrabold text-base border-b border-app-border pb-2 text-app-text-primary">
                Order Summary
              </h3>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-app-text-secondary">Subtotal ({itemCount} items)</span>
                <span className="text-app-text-primary">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-app-text-secondary">Shipping Fee</span>
                <span className="text-success-600 dark:text-success-400 font-bold uppercase tracking-wider">
                  Free
                </span>
              </div>
              <hr className="border-app-border" />
              <div className="flex justify-between items-baseline font-black text-lg text-app-text-primary">
                <span>Total</span>
                <span className="text-primary-600 dark:text-primary-400">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </CardBody>
            <CardFooter className="px-5 py-4 border-t border-app-border bg-app-bg-secondary">
              <Link to="/customer/checkout" className="w-full">
                <Button className="w-full font-bold cursor-pointer" icon={ArrowRight} iconPosition="right">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
