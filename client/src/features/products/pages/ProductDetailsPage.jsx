import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Tag, Info, AlertTriangle, Inbox } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '@/store/cartStore';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Card, CardBody } from '@/components/Card';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { selectedProduct, loading, error, getProductById } = useProductStore();
  const { addToCart } = useCartStore();
  const [activeImage, setActiveImage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    setIsAdding(true);
    try {
      await addToCart(selectedProduct._id, 1);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (id) {
      getProductById(id);
    }
  }, [id]);

  // Sync active main image when product loads
  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        setActiveImage(selectedProduct.images[0]);
      } else {
        setActiveImage(selectedProduct.imageUrl || '');
      }
    }
  }, [selectedProduct]);

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" text="Fetching details..." color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="p-3 bg-danger-100 dark:bg-danger-500/20 rounded-full text-danger-600 dark:text-danger-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-danger-900 dark:text-danger-400 text-lg">Failed to Load Details</h3>
          <p className="text-sm text-danger-700 dark:text-danger-500/90 mt-1">{error}</p>
        </div>
        <Link to="/products">
          <Button size="sm" className="font-bold cursor-pointer">
            Back to Catalogue
          </Button>
        </Link>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-app-border rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="p-3 bg-app-bg-secondary rounded-full text-app-text-secondary">
          <Inbox className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-lg">Product Not Found</h3>
          <p className="text-sm text-app-text-secondary mt-1">
            The product details could not be retrieved, or the product is no longer published.
          </p>
        </div>
        <Link to="/products">
          <Button size="sm" className="font-bold cursor-pointer">
            Back to Catalogue
          </Button>
        </Link>
      </div>
    );
  }

  const { name, price, description, category, stock, images = [], imageUrl } = selectedProduct;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;
  
  // Create list of all unique images for gallery (combining images array and imageUrl)
  const imageGallery = Array.from(new Set([
    ...(images && images.length > 0 ? images : []),
    imageUrl
  ])).filter(Boolean);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <Link to="/products">
          <Button variant="ghost" size="sm" icon={ArrowLeft} className="font-bold cursor-pointer">
            Back to Catalogue
          </Button>
        </Link>
      </div>

      {/* Detail Showcase Card */}
      <Card className="overflow-hidden bg-app-bg-primary border border-app-border rounded-2xl shadow-sm">
        <CardBody className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 sm:p-10">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-app-bg-secondary border border-app-border">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-app-text-secondary font-bold">
                  No Image Available
                </div>
              )}
              
              {/* Category Floating Badge */}
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" size="md">
                  {category || 'Uncategorized'}
                </Badge>
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {imageGallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imageGallery.map((img, idx) => {
                  const isActive = activeImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 aspect-video rounded-lg overflow-hidden border-2 bg-app-bg-secondary cursor-pointer transition-all duration-200 flex-shrink-0
                        ${isActive ? 'border-primary-500 scale-[1.03] shadow-sm' : 'border-app-border hover:border-primary-400/50'}
                      `}
                    >
                      <img src={img} alt={`${name} preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Details Pane */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="primary" size="sm" className="uppercase font-bold tracking-wider">
                  {category || 'Uncategorized'}
                </Badge>
                
                {isOutOfStock ? (
                  <Badge variant="danger" size="sm" dot>Out of Stock</Badge>
                ) : isLowStock ? (
                  <Badge variant="warning" size="sm" dot>Only {stock} Left</Badge>
                ) : (
                  <Badge variant="success" size="sm" dot>In Stock</Badge>
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-app-text-primary">
                  {name}
                </h1>
                <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                  ${parseFloat(price).toFixed(2)}
                </p>
              </div>

              <hr className="border-app-border" />

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-app-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Product Description
                </h3>
                <p className="text-sm text-app-text-secondary leading-relaxed font-normal">
                  {description || 'No description provided for this product.'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20 p-4 rounded-xl text-success-700 dark:text-success-400">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-bold leading-none">
                  Eligible for Real-Time Dispatch and Live Delivery GPS Tracking.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-app-border">
              <Button
                size="lg"
                className="flex-1 font-bold cursor-pointer"
                icon={ShoppingCart}
                isDisabled={isOutOfStock}
                isLoading={isAdding}
                onClick={handleAddToCart}
                title={isOutOfStock ? 'Item is out of stock' : 'Add item to Cart'}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>

          </div>

        </CardBody>
      </Card>
    </div>
  );
};

export default ProductDetailsPage;
