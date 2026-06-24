import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Products = () => {
  const mockProducts = [
    { id: '1', name: 'Premium Wireless Headphones', price: '$299', desc: 'Active noise-cancelling with high fidelity sound.', badge: 'Hot' },
    { id: '2', name: 'Smart Fitness Tracker', price: '$149', desc: 'Heart rate monitoring and sleep pattern audits.', badge: 'Sale' },
    { id: '3', name: 'Ergonomic Mechanical Keyboard', price: '$189', desc: 'Tactile switch layout with hot-swappable sockets.', badge: 'New' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products Catalogue</h1>
          <p className="text-sm text-app-text-secondary">Explore products ready for real-time delivery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockProducts.map((p) => (
          <Card key={p.id} hoverEffect className="flex flex-col justify-between">
            <CardHeader className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-app-text-primary">{p.name}</h3>
                <span className="text-xl font-black text-primary-600">{p.price}</span>
              </div>
              <Badge variant={p.badge === 'Hot' ? 'danger' : p.badge === 'New' ? 'primary' : 'secondary'}>
                {p.badge}
              </Badge>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-app-text-secondary leading-relaxed">{p.desc}</p>
            </CardBody>
            <CardFooter className="flex gap-3">
              <Link to={`/products/${p.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full" icon={Eye}>
                  Details
                </Button>
              </Link>
              <Button size="sm" icon={Plus}>
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Products;
