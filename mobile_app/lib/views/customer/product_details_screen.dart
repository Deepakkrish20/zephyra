import 'package:flutter/material.dart';
import 'dart:convert';
import '../../services/api_service.dart';
import '../../widgets/custom_button.dart';
import 'checkout_screen.dart';

class ProductDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailsScreen({super.key, required this.product});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  final _apiService = ApiService();
  int _quantity = 1;
  bool _isAdding = false;

  Future<void> _handleAddToCart() async {
    setState(() {
      _isAdding = true;
    });

    try {
      final response = await _apiService.post('/cart', {
        'productId': widget.product['_id'],
        'quantity': _quantity,
      });

      final body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Item added to cart!'),
              backgroundColor: Color(0xFF71EB44),
            ),
          );
          Navigator.pop(context);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(body['message'] ?? 'Failed to add item'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Network error. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isAdding = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final maxStock = (widget.product['stock'] as num).toInt();
    final imageUrl = widget.product['imageUrl'];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: Container(
          margin: const EdgeInsets.only(left: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFF4F4F5),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFFE4E4E7)),
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Hero Image Card
                  Container(
                    width: double.infinity,
                    height: 280,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF4F4F5),
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(color: const Color(0xFFE4E4E7)),
                      image: imageUrl != null
                          ? DecorationImage(
                              image: NetworkImage(imageUrl),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: imageUrl == null
                        ? const Center(
                            child: Icon(
                              Icons.image_not_supported_outlined,
                              size: 48,
                              color: Color(0xFFA1A1AA),
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(height: 24),
                  
                  // Category Badge & Stock indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF4F4F5),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          (widget.product['category'] ?? 'General').toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF71717A),
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: maxStock > 0 ? const Color(0xFFE8FCDD) : const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          maxStock > 0 ? 'IN STOCK' : 'OUT OF STOCK',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: maxStock > 0 ? Colors.green : Colors.red,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Product Name
                  Text(
                    widget.product['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 10),
                  
                  // Price Tag
                  Text(
                    '\$${(widget.product['price'] as num).toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF71EB44),
                    ),
                  ),
                  
                  const SizedBox(height: 20),
                  const Divider(color: Color(0xFFE4E4E7)),
                  const SizedBox(height: 20),
                  
                  // Product Description
                  const Text(
                    'About this product',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.product['description'] ?? 'No description is available for this product details.',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF71717A),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (maxStock > 0) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Select Quantity',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFF4F4F5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE4E4E7)),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove, size: 16),
                                onPressed: () {
                                  if (_quantity > 1) {
                                    setState(() => _quantity--);
                                  }
                                },
                              ),
                              Text(
                                '$_quantity',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add, size: 16),
                                onPressed: () {
                                  if (_quantity < maxStock) {
                                    setState(() => _quantity++);
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
          
          // Sticky Bottom Action Panel
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Color(0xFFE4E4E7)),
              ),
              boxShadow: [
                BoxShadow(
                  color: Color(0x05000000),
                  blurRadius: 10,
                  offset: Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  if (maxStock > 0) ...[
                    // Add to Cart Button (Minor style)
                    Expanded(
                      child: _isAdding
                          ? const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)))
                          : SizedBox(
                              height: 52,
                              child: OutlinedButton(
                                onPressed: _handleAddToCart,
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFFE4E4E7)),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                ),
                                child: const Text(
                                  'Add to Cart',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                    ),
                    const SizedBox(width: 12),
                    
                    // Buy Now Button (Primary style)
                    Expanded(
                      child: SizedBox(
                        height: 52,
                        child: CustomButton(
                          text: 'Buy Now',
                          onPressed: () {
                            // Direct Buy Now checkout navigation
                            final double prodPrice = (widget.product['price'] as num).toDouble();
                            final double total = prodPrice * _quantity;
                            final buyNowItems = [
                              {
                                'productId': widget.product['_id'],
                                'quantity': _quantity,
                              }
                            ];

                            // Navigate to CheckoutScreen in direct buy mode
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => CheckoutScreen(
                                  subtotal: total,
                                  items: buyNowItems,
                                  isDirectBuy: true,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ] else ...[
                    // Out of Stock state
                    Expanded(
                      child: Container(
                        height: 52,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF4F4F5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Text(
                          'Out of Stock',
                          style: TextStyle(
                            color: Color(0xFF71717A),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
