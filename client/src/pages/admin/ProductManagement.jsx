import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, PackagePlus, AlertTriangle } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Loader } from '@/components/Loader';

export const ProductManagement = () => {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, setShowAll } =
    useProductStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [imageSourceType, setImageSourceType] = useState('link'); // 'link' | 'file'
  const [imagePreview, setImagePreview] = useState('');

  // Load all products (including drafts) on mount
  useEffect(() => {
    setShowAll(true);
  }, [setShowAll]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setStock('');
    setCategory('Electronics');
    setDescription('');
    setImageUrl('');
    setStatus('draft');
    setFormError('');
    setImageSourceType('link');
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setPrice(product.price !== undefined ? product.price.toString() : '');
    setStock(product.stock !== undefined ? product.stock.toString() : '');
    setCategory(product.category || 'Electronics');
    setDescription(product.description || '');
    setImageUrl(product.imageUrl || '');
    setStatus(product.status || 'draft');
    setFormError('');
    const isBase64 = product.imageUrl && product.imageUrl.startsWith('data:image');
    setImageSourceType(isBase64 ? 'file' : 'link');
    setImagePreview(product.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setFormError('Image size exceeds 3MB. Please select a smaller file or use a link.');
      return;
    }

    setFormError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Stock must be a valid non-negative integer.');
      return;
    }

    const payload = {
      name,
      price: priceNum,
      stock: stockNum,
      category,
      description,
      imageUrl: imageUrl.trim() || undefined,
      status,
    };

    setFormLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
      } else {
        await createProduct(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save product catalogue entry.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProduct(product._id);
      } catch (err) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-app-text-primary">
            Product Catalog Management
          </h1>
          <p className="text-sm text-app-text-secondary mt-0.5">
            Publish, edit, and audit inventory listings visible to customers.
          </p>
        </div>
        <Button onClick={openAddModal} icon={Plus} className="font-bold cursor-pointer">
          Add New Product
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 text-xs font-semibold rounded-xl flex items-center gap-2 max-w-2xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && products.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader size="lg" text="Loading product inventory..." color="primary" />
        </div>
      ) : (
        <Card className="overflow-hidden bg-app-bg-primary border border-app-border rounded-xl">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold select-none text-xs uppercase tracking-wider">
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Stock Level</th>
                    <th className="px-6 py-3.5">Visibility Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-app-text-secondary font-medium"
                      >
                        No products registered in the database. Click &quot;Add New Product&quot; to
                        start seeding.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-app-bg-secondary/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-app-bg-secondary rounded overflow-hidden border border-app-border flex-shrink-0">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-app-text-secondary font-bold">
                                  No Img
                                </div>
                              )}
                            </div>
                            <span className="font-extrabold text-app-text-primary">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" size="sm">
                            {p.category || 'Uncategorized'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-primary-600 dark:text-primary-400">
                          ${parseFloat(p.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-app-text-secondary">
                          {p.stock} Units
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              p.status === 'published'
                                ? 'success'
                                : p.status === 'hidden'
                                  ? 'danger'
                                  : 'neutral'
                            }
                            dot
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Edit2}
                              onClick={() => openEditModal(p)}
                              title="Edit product"
                              className="cursor-pointer"
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteProduct(p)}
                              title="Delete product"
                              className="cursor-pointer"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !formLoading && setIsModalOpen(false)}
        title={editingProduct ? 'Modify Catalog Entry' : 'Register Catalog Product'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="p-3 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Product Name"
            placeholder="e.g., Wireless Mouse"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={formLoading}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="49.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={formLoading}
            />
            <Input
              label="Available Stock"
              type="number"
              placeholder="50"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              disabled={formLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-app-bg-secondary border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-app-text-primary transition-all duration-200"
              disabled={formLoading}
            >
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Office Supplies">Office Supplies</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Product Image Option
            </label>
            <div className="flex gap-4 mb-1">
              <label className="flex items-center gap-1.5 text-xs font-bold text-app-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="imageSourceType"
                  value="link"
                  checked={imageSourceType === 'link'}
                  onChange={() => {
                    setImageSourceType('link');
                    setFormError('');
                  }}
                  className="text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                  disabled={formLoading}
                />
                Paste Image Link
              </label>
              <label className="flex items-center gap-1.5 text-xs font-bold text-app-text-primary cursor-pointer">
                <input
                  type="radio"
                  name="imageSourceType"
                  value="file"
                  checked={imageSourceType === 'file'}
                  onChange={() => {
                    setImageSourceType('file');
                    setFormError('');
                  }}
                  className="text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                  disabled={formLoading}
                />
                Upload from Computer
              </label>
            </div>

            {imageSourceType === 'link' ? (
              <Input
                placeholder="https://images.unsplash.com/..."
                value={imageUrl.startsWith('data:image') ? '' : imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                disabled={formLoading}
              />
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={formLoading}
                  className="w-full text-xs text-app-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-500/10 dark:file:text-primary-400 cursor-pointer"
                />
              </div>
            )}

            {imagePreview && (
              <div className="relative w-16 h-16 mt-1 border border-app-border rounded-xl overflow-hidden bg-app-bg-secondary flex items-center justify-center shadow-inner">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Description
            </label>
            <textarea
              placeholder="Detailed description of features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-app-bg-secondary border border-app-border rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-app-text-primary transition-all duration-200"
              disabled={formLoading}
            />
          </div>

          <div className="flex items-center gap-2 select-none pt-2">
            <label className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Visibility Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-app-bg-secondary border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-app-text-primary transition-all duration-200"
              disabled={formLoading}
            >
              <option value="draft">Draft (hidden from customer catalog)</option>
              <option value="published">Published (visible in customer catalogue)</option>
              <option value="hidden">Hidden (invisible in customer catalogue)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-app-border">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              isDisabled={formLoading}
              className="cursor-pointer font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={PackagePlus}
              isLoading={formLoading}
              className="cursor-pointer font-bold"
            >
              {editingProduct ? 'Save Changes' : 'Publish to Feed'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
