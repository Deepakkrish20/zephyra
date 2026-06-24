import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export const ProductFilters = () => {
  const {
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setCategory,
    clearFilters,
  } = useProductStore();

  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Sync local input with store search term
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Debounce search input to prevent firing rapid API queries
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (localSearch !== searchTerm) {
        setSearchTerm(localSearch);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [localSearch]);

  const categories = ['All', 'Electronics', 'Accessories', 'Office Supplies'];

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'All';

  const handleClear = () => {
    setLocalSearch('');
    clearFilters();
  };

  return (
    <div className="space-y-4 bg-app-bg-secondary/55 p-5 border border-app-border rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full md:max-w-md relative">
          <Input
            placeholder="Search products..."
            icon={Search}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-secondary hover:text-app-text-primary transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="self-start md:self-auto font-bold text-xs text-danger-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 cursor-pointer"
            icon={X}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Category Pills */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest">
          Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer duration-200
                  ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/20 scale-[1.02]'
                      : 'bg-app-bg-primary text-app-text-secondary border-app-border hover:border-primary-500/30 hover:text-app-text-primary'
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
