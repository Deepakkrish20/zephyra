import 'package:flutter/material.dart';
import 'dart:convert';
import '../../services/api_service.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_input.dart';

class CheckoutScreen extends StatefulWidget {
  final double subtotal;
  final List<dynamic> items;
  final bool isDirectBuy;

  const CheckoutScreen({
    super.key,
    required this.subtotal,
    required this.items,
    this.isDirectBuy = false,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _apiService = ApiService();
  final _addressFormKey = GlobalKey<FormState>();
  
  // New address controller inputs
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _line1Controller = TextEditingController();
  final _line2Controller = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipController = TextEditingController();
  final _landmarkController = TextEditingController();

  List<dynamic> _addresses = [];
  int _selectedAddressIndex = 0;
  bool _isLoadingAddresses = true;
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _fetchAddresses();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _line1Controller.dispose();
    _line2Controller.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  Future<void> _fetchAddresses({bool selectLast = false}) async {
    setState(() {
      _isLoadingAddresses = true;
    });

    try {
      final response = await _apiService.get('/auth/addresses');
      final body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        setState(() {
          _addresses = body['data']['addresses'] ?? [];
          if (selectLast && _addresses.isNotEmpty) {
            _selectedAddressIndex = _addresses.length - 1;
          }
        });
      }
    } catch (e) {
      //
    } finally {
      setState(() {
        _isLoadingAddresses = false;
      });
    }
  }

  Future<void> _addNewAddress() async {
    if (!_addressFormKey.currentState!.validate()) return;

    try {
      final response = await _apiService.post('/auth/addresses', {
        'fullName': _nameController.text.trim(),
        'phoneNumber': _phoneController.text.trim(),
        'addressLine1': _line1Controller.text.trim(),
        'addressLine2': _line2Controller.text.trim(),
        'city': _cityController.text.trim(),
        'state': _stateController.text.trim(),
        'postalCode': _zipController.text.trim(),
        'landmark': _landmarkController.text.trim(),
      });

      final body = jsonDecode(response.body);

      if (response.statusCode == 201 && body['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Address added successfully!'),
              backgroundColor: Color(0xFF71EB44),
            ),
          );
          Navigator.pop(context); // Close Dialog
        }
        
        // Reset inputs
        _nameController.clear();
        _phoneController.clear();
        _line1Controller.clear();
        _line2Controller.clear();
        _cityController.clear();
        _stateController.clear();
        _zipController.clear();
        _landmarkController.clear();

        _fetchAddresses(selectLast: true);
      }
    } catch (e) {
      //
    }
  }

  Future<void> _placeOrder() async {
    if (_addresses.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add a shipping address first.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isPlacingOrder = true;
    });

    try {
      final selectedAddr = _addresses[_selectedAddressIndex];
      final response = await _apiService.post('/checkout', {
        'address': selectedAddr,
        if (widget.isDirectBuy) 'items': widget.items,
      });

      final body = jsonDecode(response.body);

      if (response.statusCode == 201 && body['success'] == true) {
        if (mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: const Center(
                child: Icon(
                  Icons.check_circle_outline,
                  color: Color(0xFF71EB44),
                  size: 64,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Order Placed!',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your order number is ${body['data']['order']['orderNumber']}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF64748B)),
                  ),
                ],
              ),
              actions: [
                Center(
                  child: CustomButton(
                    text: 'Continue Shopping',
                    onPressed: () {
                      Navigator.pop(context); // Close Dialog
                      Navigator.pop(context); // Pop Checkout
                      Navigator.pop(context); // Pop Cart
                    },
                  ),
                ),
              ],
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(body['message'] ?? 'Failed to place order'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Network error. Failed to place order.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isPlacingOrder = false;
        });
      }
    }
  }

  void _showAddAddressDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Address'),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Form(
              key: _addressFormKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CustomInput(
                    controller: _nameController,
                    labelText: 'Full Name',
                    hintText: 'John Doe',
                    prefixIcon: Icons.person_outline,
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    controller: _phoneController,
                    labelText: 'Phone Number',
                    hintText: '+1234567890',
                    prefixIcon: Icons.phone_outlined,
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    controller: _line1Controller,
                    labelText: 'Address Line 1',
                    hintText: 'Street address, P.O. box',
                    prefixIcon: Icons.home_outlined,
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    controller: _line2Controller,
                    labelText: 'Address Line 2 (Optional)',
                    hintText: 'Apartment, suite, unit',
                    prefixIcon: Icons.apartment_outlined,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: CustomInput(
                          controller: _cityController,
                          labelText: 'City',
                          hintText: 'New York',
                          prefixIcon: Icons.location_city_outlined,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: CustomInput(
                          controller: _stateController,
                          labelText: 'State',
                          hintText: 'NY',
                          prefixIcon: Icons.map_outlined,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: CustomInput(
                          controller: _zipController,
                          labelText: 'ZIP Code',
                          hintText: '10001',
                          prefixIcon: Icons.pin_drop_outlined,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: CustomInput(
                          controller: _landmarkController,
                          labelText: 'Landmark',
                          hintText: 'Near central park',
                          prefixIcon: Icons.star_border_outlined,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          CustomButton(
            text: 'Save',
            onPressed: _addNewAddress,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
      ),
      body: _isLoadingAddresses
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)))
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title address selector
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Shipping Address',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            TextButton.icon(
                              onPressed: _showAddAddressDialog,
                              icon: const Icon(Icons.add, size: 16, color: Color(0xFF71EB44)),
                              label: const Text(
                                'Add New',
                                style: TextStyle(color: Color(0xFF71EB44), fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        
                        // Addresses list selector
                        _addresses.isEmpty
                            ? Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: const Column(
                                  children: [
                                    Icon(Icons.location_off_outlined, color: Color(0xFF94A3B8)),
                                    SizedBox(height: 8),
                                    Text(
                                      'No saved addresses found. Add one above!',
                                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _addresses.length,
                                separatorBuilder: (context, index) => const SizedBox(height: 10),
                                itemBuilder: (context, index) {
                                  final addr = _addresses[index];
                                  final isSelected = _selectedAddressIndex == index;

                                  return GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _selectedAddressIndex = index;
                                      });
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: isSelected ? const Color(0xFFF0FDF4) : Colors.white,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: isSelected ? const Color(0xFF71EB44) : const Color(0xFFE2E8F0),
                                          width: isSelected ? 2 : 1,
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                                            color: isSelected ? const Color(0xFF71EB44) : const Color(0xFFCBD5E1),
                                          ),
                                          const SizedBox(width: 16),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  addr['fullName'] ?? '',
                                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  '${addr['addressLine1']}, ${addr['addressLine2'] ?? ''}',
                                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                                ),
                                                Text(
                                                  '${addr['city']}, ${addr['state']} - ${addr['postalCode']}',
                                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                                ),
                                                Text(
                                                  'Phone: ${addr['phoneNumber']}',
                                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                        
                        const SizedBox(height: 32),
                        
                        // Order details summary list
                        const Text(
                          'Order Summary',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: widget.items.length,
                          separatorBuilder: (context, index) => const Divider(color: Color(0xFFF1F5F9)),
                          itemBuilder: (context, index) {
                            final item = widget.items[index];
                            final product = item['productId'];
                            if (product == null) return const SizedBox();

                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4.0),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      '${product['name']} (x${item['quantity']})',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                    ),
                                  ),
                                  Text(
                                    '\$${((product['price'] as num) * (item['quantity'] as num)).toStringAsFixed(2)}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Place Order Action Footer
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x05000000),
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
                              'Total Amount',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '\$${widget.subtotal.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF71EB44),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: _isPlacingOrder
                              ? const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)))
                              : CustomButton(
                                  text: 'Place Order',
                                  onPressed: _placeOrder,
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
