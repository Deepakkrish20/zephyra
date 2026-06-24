import { Router } from 'express';
import Product from '../models/Product.js';
import protect from '../middlewares/authMiddleware.js';

const router = Router();

// @route   GET /api/products
// @desc    Get products with search, category filter, and pagination
//          If query parameter 'all=true' is sent, retrieves all products (admin view).
//          Otherwise, retrieves only published products.
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 6, all } = req.query;

    const query = {};

    // For customer side (not 'all=true'), only fetch published products
    if (all !== 'true') {
      query.status = 'published';
    }

    // Apply category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Apply search filter (match name or description case-insensitively)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch products and count total matching documents in parallel
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      currentPage: pageNum,
      totalPages: Math.ceil(totalProducts / limitNum),
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/:id
// @desc    Get details of a single product. Bypasses status filter if 'all=true' is query parameter.
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const { all } = req.query;
    const query = { _id: req.params.id };

    if (all !== 'true') {
      query.status = 'published';
    }

    const product = await Product.findOne(query);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    next(error);
  }
});

// @route   POST /api/products
// @desc    Create a new product catalog entry
// @access  Private (Admin)
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, price, description, imageUrl, images, category, stock, status } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Default main image url if none given, or use unsplash placeholder
    const defaultImage = imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

    const product = await Product.create({
      name,
      price: parseFloat(price),
      description: description || '',
      imageUrl: defaultImage,
      images: images || [defaultImage],
      category: category || 'Uncategorized',
      stock: parseInt(stock, 10) || 0,
      status: status || 'draft',
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product catalog entry
// @access  Private (Admin)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { name, price, description, imageUrl, images, category, stock, status } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (description !== undefined) product.description = description;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (images !== undefined) product.images = images;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock, 10) || 0;
    if (status !== undefined) product.status = status;

    await product.save();
    res.json(product);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    next(error);
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product catalog entry
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    next(error);
  }
});

export default router;
