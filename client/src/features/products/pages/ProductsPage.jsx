import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Inbox, AlertTriangle } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/Button';

export const ProductsPage = () => {
  const {
    products,
    loading,
    error,
    pagination,
    getProducts,
    setCurrentPage,
    clearFilters,
  } = useProductStore();

  useEffect(() => {
    getProducts();
  }, []);

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
      <div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
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
            <h3 className="font-bold text-danger-900 dark:text-danger-400 text-lg">Error Loading Products</h3>
            <p className="text-sm text-danger-700 dark:text-danger-500/90 mt-1">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => getProducts()} className="font-bold cursor-pointer">
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
              We couldn't find any products matching your active filter criteria.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters} className="font-bold cursor-pointer">
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
    </div>
  );
};

export default ProductsPage;
