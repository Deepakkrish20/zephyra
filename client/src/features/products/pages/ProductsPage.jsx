import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Inbox, AlertTriangle, MapPin, X } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import authApi from '@/services/authApi';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/Button';

export const ProductsPage = () => {
  const { products, loading, error, pagination, getProducts, setCurrentPage, clearFilters } =
    useProductStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && user.role === 'customer') {
      authApi
        .getAddresses()
        .then((res) => {
          if (!res.addresses || res.addresses.length === 0) {
            setShowAddressPrompt(true);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch addresses for notification:', err);
        });
    }
  }, [user]);

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setCurrentPage(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setCurrentPage(pagination.currentPage + 1);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-app-border pb-4">
        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 font-mono tracking-widest uppercase">
          {'// CURATED COLLECTION'}
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text-primary mt-1">
          Explore Products
        </h1>
        <p className="text-sm text-app-text-secondary mt-1">
          Smart e-commerce with real-time delivery GPS tracking dispatch workflows.
        </p>
      </div>

      {/* Filters Area */}
      <ProductFilters />

      {/* Main Catalog Rendering */}
      {loading ? (
        <div className="min-h-[350px] flex items-center justify-center">
          <Loader size="lg" text="Loading awesome products..." color="primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="p-3 bg-danger-100 dark:bg-danger-500/20 rounded-full text-danger-600 dark:text-danger-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-danger-900 dark:text-danger-400 text-lg">
              Error Loading Products
            </h3>
            <p className="text-sm text-danger-700 dark:text-danger-500/90 mt-1">{error}</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => getProducts()}
            className="font-bold cursor-pointer"
          >
            Retry Loading
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-app-border rounded-2xl text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="p-3 bg-app-bg-secondary rounded-full text-app-text-secondary">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-app-text-primary text-lg">No Products Found</h3>
            <p className="text-sm text-app-text-secondary mt-1">
              We couldn&apos;t find any products matching your active filter criteria.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="font-bold cursor-pointer"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-app-border">
              <span className="text-xs font-semibold text-app-text-secondary">
                Showing {products.length} of {pagination.totalProducts} Products
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  isDisabled={pagination.currentPage === 1}
                  icon={ChevronLeft}
                  className="font-bold cursor-pointer"
                >
                  Prev
                </Button>

                {Array.from({ length: pagination.totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  const isCurrent = pagination.currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer
                        ${
                          isCurrent
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'bg-app-bg-secondary text-app-text-secondary hover:text-app-text-primary'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  isDisabled={pagination.currentPage === pagination.totalPages}
                  iconPosition="right"
                  icon={ChevronRight}
                  className="font-bold cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddressPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-[#71eb44]/20 rounded-3xl p-8 shadow-2xl animate-fade-up text-center space-y-6">
            {/* Close button */}
            <button
              onClick={() => setShowAddressPrompt(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-205 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing MapPin icon */}
            <div className="mx-auto w-16 h-16 bg-[#71eb44]/10 dark:bg-[#71eb44]/5 rounded-full flex items-center justify-center border border-[#71eb44]/20 dark:border-[#71eb44]/10 relative">
              <span className="absolute inset-0 rounded-full bg-[#71eb44]/10 animate-ping opacity-75" />
              <MapPin className="w-8 h-8 text-[#71eb44]" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-mono">
                {'// Profile Incomplete'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Set up your shipping address to enable express coordinates lock, websocket telemetry
                tracking, and quick checkout.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/customer/profile')}
                className="w-full bg-[#71eb44] hover:bg-[#71eb44]/90 text-zinc-950 font-extrabold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer font-mono uppercase tracking-wider shadow-lg shadow-[#71eb44]/10"
              >
                Set Address Now
              </button>
              <button
                onClick={() => setShowAddressPrompt(false)}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer transition-colors pt-1"
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
