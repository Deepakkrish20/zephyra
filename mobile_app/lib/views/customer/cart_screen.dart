import 'package:flutter/material.dart';
import 'dart:convert';
import '../../services/api_service.dart';
import '../../widgets/custom_button.dart';
import 'checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _apiService = ApiService();
  List<dynamic> _items = [];
  bool _isLoading = true;
  double _subtotal = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchCart();
  }

  Future<void> _fetchCart() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _apiService.get('/cart');
      final body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        final cart = body['data']['cart'];
        final itemsList = cart['items'] as List<dynamic>? ?? [];
        
        double calcSubtotal = 0.0;
        for (var item in itemsList) {
          final product = item['productId'];
          if (product != null) {
            final price = (product['price'] as num).toDouble();
            final quantity = (item['quantity'] as num).toInt();
            calcSubtotal += price * quantity;
          }
        }

        setState(() {
          _items = itemsList;
          _subtotal = calcSubtotal;
        });
      }
    } catch (e) {
      // Handle silently
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _updateQuantity(String productId, int newQuantity) async {
    try {
      final response = await _apiService.post('/cart', {
        'productId': productId,
        'quantity': newQuantity,
      });

      if (response.statusCode == 200) {
        _fetchCart();
      }
    } catch (e) {
      // Handle
    }
  }

  Future<void> _removeItem(String productId) async {
    try {
      final response = await _apiService.delete('/cart/$productId');
      final body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Item removed from cart'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        _fetchCart();
      }
    } catch (e) {
      //
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAFAFA),
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: Container(
          margin: const EdgeInsets.only(left: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFFE4E4E7)),
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        title: const Text(
          'Shopping Cart',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)))
          : _items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF4F4F5),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFE4E4E7)),
                        ),
                        child: const Icon(
                          Icons.shopping_bag_outlined,
                          size: 40,
                          color: Color(0xFF71717A),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Your cart is currently empty.',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF71717A),
                        ),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _items.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final item = _items[index];
                          final product = item['productId'];
                          if (product == null) return const SizedBox();

                          final name = product['name'] ?? '';
                          final price = (product['price'] as num).toDouble();
                          final imageUrl = product['imageUrl'];
                          final stock = (product['stock'] as num).toInt();
                          final quantity = (item['quantity'] as num).toInt();

                          return Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFFE4E4E7)),
                            ),
                            child: Row(
                              children: [
                                // Thumbnail Image
                                Container(
                                  width: 76,
                                  height: 76,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF4F4F5),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: const Color(0xFFE4E4E7)),
                                    image: imageUrl != null
                                        ? DecorationImage(
                                            image: NetworkImage(imageUrl),
                                            fit: BoxFit.cover,
                                          )
                                        : null,
                                  ),
                                  child: imageUrl == null
                                      ? const Icon(Icons.image_not_supported_outlined, color: Color(0xFFA1A1AA))
                                      : null,
                                ),
                                const SizedBox(width: 16),
                                
                                // Title and price
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '\$${price.toStringAsFixed(2)}',
                                        style: const TextStyle(
                                          color: Color(0xFF71EB44),
                                          fontWeight: FontWeight.w900,
                                          fontSize: 15,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      
                                      // Quantity Adjuster Row
                                      Row(
                                        children: [
                                          GestureDetector(
                                            onTap: () {
                                              if (quantity > 1) {
                                                _updateQuantity(product['_id'], quantity - 1);
                                              } else {
                                                _removeItem(product['_id']);
                                              }
                                            },
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFF4F4F5),
                                                shape: BoxShape.circle,
                                                border: Border.all(color: const Color(0xFFE4E4E7)),
                                              ),
                                              child: const Icon(Icons.remove, size: 14, color: Colors.black),
                                            ),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 10.0),
                                            child: Text(
                                              '$quantity',
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                            ),
                                          ),
                                          GestureDetector(
                                            onTap: () {
                                              if (quantity < stock) {
                                                _updateQuantity(product['_id'], quantity + 1);
                                              }
                                            },
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFF4F4F5),
                                                shape: BoxShape.circle,
                                                border: Border.all(color: const Color(0xFFE4E4E7)),
                                              ),
                                              child: const Icon(Icons.add, size: 14, color: Colors.black),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                
                                // Delete button
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 22),
                                  onPressed: () => _removeItem(product['_id']),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    
                    // Totals Summary Card
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        border: Border(
                          top: BorderSide(color: Color(0xFFE4E4E7)),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Color(0x02000000),
                            blurRadius: 10,
                            offset: Offset(0, -5),
                          ),
                        ],
                      ),
                      child: SafeArea(
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Subtotal',
                                  style: TextStyle(color: Color(0xFF71717A), fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  '\$${_subtotal.toStringAsFixed(2)}',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            const Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Delivery Fee',
                                  style: TextStyle(color: Color(0xFF71717A), fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  'FREE',
                                  style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            const Divider(color: Color(0xFFE4E4E7)),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total Amount',
                                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                                Text(
                                  '\$${_subtotal.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF71EB44),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            
                            // Checkout Button
                            SizedBox(
                              width: double.infinity,
                              height: 50,
                              child: CustomButton(
                                text: 'Proceed to Checkout',
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => CheckoutScreen(
                                        subtotal: _subtotal,
                                        items: _items,
                                      ),
                                    ),
                                  ).then((_) {
                                    _fetchCart();
                                  });
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
