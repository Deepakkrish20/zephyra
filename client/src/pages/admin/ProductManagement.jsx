import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Plus, Edit2, Trash2, PackagePlus } from 'lucide-react';

export const ProductManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockProducts = [
    { id: '1', name: 'Premium Wireless Headphones', price: '$299', stock: '25 Units', status: 'published' },
    { id: '2', name: 'Smart Fitness Tracker', price: '$149', stock: '14 Units', status: 'published' },
    { id: '3', name: 'Ergonomic Mechanical Keyboard', price: '$189', stock: '0 Units', status: 'draft' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Catalog Management</h1>
          <p className="text-sm text-app-text-secondary">Publish and edit inventory listings visible to customers.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Add New Product
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock Level</th>
                  <th className="px-6 py-3.5">Visibility Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {mockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-app-bg-secondary/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-app-text-primary">{p.name}</td>
                    <td className="px-6 py-4 font-semibold text-primary-600">{p.price}</td>
                    <td className="px-6 py-4">{p.stock}</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status === 'published' ? 'success' : 'neutral'} dot>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="outline" size="sm" icon={Edit2} />
                      <Button variant="danger" size="sm" icon={Trash2} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Catalog Product">
        <div className="space-y-4">
          <Input label="Product Name" placeholder="e.g., Wireless Mouse" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($)" type="number" placeholder="49.99" />
            <Input label="Available Stock" type="number" placeholder="50" />
          </div>
          <Input label="Short Description" placeholder="Detailed feature listing..." />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button icon={PackagePlus} onClick={() => setIsModalOpen(false)}>Publish to Feed</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ProductManagement;
