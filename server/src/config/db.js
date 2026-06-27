import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/passwordUtil.js';

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[Seeding] No products found. Seeding sample products...');
      const sampleProducts = [
        {
          name: 'Premium Wireless Headphones',
          price: 299.00,
          description: 'Active noise-cancelling with high fidelity sound, 40 hours battery life, and comfortable over-ear design.',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
          images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60'
          ],
          category: 'Electronics',
          stock: 25,
          status: 'published'
        },
        {
          name: 'Smart Fitness Tracker',
          price: 149.00,
          description: 'Heart rate monitoring, sleep pattern audits, GPS tracking, and water resistant up to 50m.',
          imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60',
          images: [
            'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60'
          ],
          category: 'Electronics',
          stock: 50,
          status: 'published'
        },
        {
          name: 'Ergonomic Mechanical Keyboard',
          price: 189.00,
          description: 'Tactile switch layout with hot-swappable sockets, premium PBT keycaps, and custom RGB lighting.',
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
          images: [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60'
          ],
          category: 'Accessories',
          stock: 15,
          status: 'published'
        },
        {
          name: 'Wooden Standing Desk',
          price: 499.00,
          description: 'Premium natural oak wood tabletop with dual-motor electric height adjustable steel frame.',
          imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=60',
          images: [
            'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=60'
          ],
          category: 'Office Supplies',
          stock: 8,
          status: 'published'
        },
        {
          name: 'Leather Office Chair',
          price: 349.00,
          description: 'High-back ergonomic executive office chair with lumbar support, tilt mechanism, and padded armrests.',
          imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60',
          images: [
            'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60'
          ],
          category: 'Office Supplies',
          stock: 12,
          status: 'published'
        },
        {
          name: 'USB-C Hub Adapter',
          price: 59.00,
          description: '7-in-1 USB-C hub with 4K HDMI, 3 USB 3.0 ports, SD/microSD card reader, and 100W Power Delivery.',
          imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop&q=60',
          images: [
            'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop&q=60'
          ],
          category: 'Accessories',
          stock: 100,
          status: 'published'
        },
        {
          name: 'Draft Product (Hidden)',
          price: 99.00,
          description: 'This product is a draft and should not be visible to customers.',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
          images: [],
          category: 'Electronics',
          stock: 5,
          status: 'draft'
        },
        {
          name: 'Hidden Product (Invisible)',
          price: 199.00,
          description: 'This product is hidden and should not be visible to customers.',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
          images: [],
          category: 'Electronics',
          stock: 10,
          status: 'hidden'
        }
      ];
      await Product.insertMany(sampleProducts);
      console.log('[Seeding] Seeded sample products successfully.');
    }
  } catch (error) {
    console.error('[Seeding] Error seeding products:', error.message);
  }
};

const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'krishdeepak747@gmail.com' });
    if (!adminExists) {
      console.log('[Seeding] Seeding admin user krishdeepak747@gmail.com...');
      const adminPassword = await hashPassword('deepak@123');
      await User.create({
        name: 'Deepak Admin',
        email: 'krishdeepak747@gmail.com',
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('[Seeding] Seeded admin user successfully.');
    }

    // Clean up mock default users if they exist in the database
    const deletedDelivery = await User.deleteOne({ email: 'delivery@zephyra.com' });
    if (deletedDelivery.deletedCount > 0) {
      console.log('[Cleanup] Removed mock delivery agent (delivery@zephyra.com) from database.');
    }

    const deletedCustomer = await User.deleteOne({ email: 'customer@zephyra.com' });
    if (deletedCustomer.deletedCount > 0) {
      console.log('[Cleanup] Removed mock customer (customer@zephyra.com) from database.');
    }
  } catch (error) {
    console.error('[Seeding] Error seeding users:', error.message);
  }
};

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb+srv://zephyra:Nosn0dJI5e5DS4ma@cluster0.6kylk2y.mongodb.net/zephyra?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(connStr);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    
    // Run schema migration to ensure all products have status field
    await Product.updateMany({ status: { $exists: false } }, { status: 'published' });
    
    // Seed default products
    await seedProducts();

    // Seed default users
    await seedUsers();
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
