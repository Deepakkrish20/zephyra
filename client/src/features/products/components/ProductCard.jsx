import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';
import { Card, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useCartStore } from '@/store/cartStore';

export const ProductCard = ({ product }) => {
  const { _id, name, price, description, imageUrl, category, stock } = product;
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  // Determine stock status and badge
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(_id, 1);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card
      hoverEffect
      className="flex flex-col justify-between h-full bg-app-bg-primary border border-app-border rounded-xl shadow-sm overflow-hidden transition-all duration-200"
    >
      {/* Product Image */}
      <div className="relative aspect-video w-full bg-app-bg-secondary border-b border-app-border overflow-hidden group">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-app-text-secondary font-bold">
            No Image Available
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" size="sm">
            {category || 'Uncategorized'}
          </Badge>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <Badge variant="danger" size="sm" dot>
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm" dot>
              Only {stock} Left
            </Badge>
          ) : (
            <Badge variant="success" size="sm" dot>
              In Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Product Information */}
      <CardBody className="p-5 flex-grow flex flex-col justify-between gap-3">
        <div>
          <h3
            className="font-extrabold text-base text-app-text-primary tracking-tight line-clamp-1 mb-1"
            title={name}
          >
            {name}
          </h3>
          <p className="text-xs text-app-text-secondary leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {description || 'No description available.'}
          </p>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <span className="text-xs text-app-text-secondary font-medium">Price</span>
          <span className="text-xl font-black text-primary-600 dark:text-primary-400">
            ₹{parseFloat(price).toFixed(2)}
          </span>
        </div>
      </CardBody>

      {/* Actions */}
      <CardFooter className="px-5 py-4 border-t border-app-border bg-app-bg-secondary flex gap-3">
        <Link to={`/products/${_id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full font-bold cursor-pointer"
            icon={Eye}
          >
            Details
          </Button>
        </Link>
        <Button
          size="sm"
          icon={ShoppingCart}
          isDisabled={isOutOfStock}
          isLoading={isAdding}
          className="font-bold cursor-pointer"
          title={isOutOfStock ? 'Item is out of stock' : 'Add item to Cart'}
          onClick={handleAddToCart}
        >
          Add
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
