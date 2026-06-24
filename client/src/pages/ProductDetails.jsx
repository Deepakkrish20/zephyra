import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { ArrowLeft, ShoppingCart, ShieldCheck } from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Link to="/products">
        <Button variant="ghost" size="sm" icon={ArrowLeft}>
          Back to Catalogue
        </Button>
      </Link>

      <Card>
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Image Placeholder */}
          <div className="bg-app-bg-secondary rounded-xl flex items-center justify-center min-h-[300px] border border-app-border">
            <span className="text-sm text-app-text-secondary font-bold">Image Gallery (Placeholder)</span>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs text-primary-600 font-bold uppercase tracking-widest">Premium Category</span>
              <h1 className="text-3xl font-extrabold tracking-tight">Product Detail ID: {id}</h1>
              <p className="text-2xl font-black text-secondary-600">$189.00</p>
            </div>

            <p className="text-sm text-app-text-secondary leading-relaxed">
              This is a placeholder page for product details. Future developers will wire this page to the `productStore` and query APIs using Axios/TanStack query. Tailwind variables are integrated to enable seamless dark and light mode scaling.
            </p>

            <div className="flex items-center gap-3 bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20 p-4 rounded-xl text-success-700 dark:text-success-400">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-semibold">Available in stock for Real-Time Dispatch.</span>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1" icon={ShoppingCart}>
                Add item to Cart
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
export default ProductDetails;
