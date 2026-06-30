import 'package:flutter/material.dart';
import 'dart:convert';
import '../../services/api_service.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_input.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> with SingleTickerProviderStateMixin {
  final _apiService = ApiService();
  late TabController _tabController;
  bool _isLoadingStats = true;
  bool _isLoadingOrders = true;
  bool _isLoadingAgents = true;
  bool _isLoadingProducts = true;

  // Stats Data
  double _grossRevenue = 0.0;
  int _activeOrders = 0;
  int _pendingApprovals = 0;
  int _totalProducts = 0;
  List<dynamic> _recentOrders = [];

  // Lists Data
  List<dynamic> _ordersQueue = [];
  List<dynamic> _agentsList = [];
  List<dynamic> _productsList = [];

  // Form controllers for creating delivery agent
  final _agentFormKey = GlobalKey<FormState>();
  final _agentNameController = TextEditingController();
  final _agentEmailController = TextEditingController();
  final _agentPasswordController = TextEditingController();
  bool _isCreatingAgent = false;

  // Form controllers for adding/editing product
  final _productFormKey = GlobalKey<FormState>();
  final _prodNameController = TextEditingController();
  final _prodPriceController = TextEditingController();
  final _prodStockController = TextEditingController();
  final _prodDescController = TextEditingController();
  final _prodCategoryController = TextEditingController();
  final _prodImageController = TextEditingController();
  String _prodStatus = 'published';
  bool _isSavingProduct = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(_handleTabSelection);
    _fetchStats();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _agentNameController.dispose();
    _agentEmailController.dispose();
    _agentPasswordController.dispose();
    _prodNameController.dispose();
    _prodPriceController.dispose();
    _prodStockController.dispose();
    _prodDescController.dispose();
    _prodCategoryController.dispose();
    _prodImageController.dispose();
    super.dispose();
  }

  void _handleTabSelection() {
    if (_tabController.indexIsChanging) return;
    
    switch (_tabController.index) {
      case 0:
        _fetchStats();
        break;
      case 1:
        _fetchProducts();
        break;
      case 2:
        _fetchOrders();
        break;
      case 3:
        _fetchAgents();
        break;
    }
  }

  Future<void> _fetchStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final response = await _apiService.get('/admin/dashboard');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        final data = body['data'];
        setState(() {
          _grossRevenue = (data['grossRevenue'] as num).toDouble();
          _activeOrders = (data['totalActiveOrders'] as num).toInt();
          _pendingApprovals = (data['pendingApprovalCount'] as num).toInt();
          _totalProducts = (data['totalProducts'] as num).toInt();
          _recentOrders = data['recentOrders'] ?? [];
        });
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isLoadingStats = false);
    }
  }

  Future<void> _fetchProducts() async {
    setState(() => _isLoadingProducts = true);
    try {
      final response = await _apiService.get('/products');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        setState(() {
          _productsList = body['data']['products'] ?? [];
        });
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isLoadingProducts = false);
    }
  }

  Future<void> _fetchOrders() async {
    setState(() => _isLoadingOrders = true);
    try {
      final response = await _apiService.get('/admin/orders');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        setState(() {
          _ordersQueue = body['data']['orders'] ?? [];
        });
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isLoadingOrders = false);
    }
  }

  Future<void> _fetchAgents() async {
    setState(() => _isLoadingAgents = true);
    try {
      final response = await _apiService.get('/admin/delivery-agents');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        setState(() {
          _agentsList = body['data']['agents'] ?? [];
        });
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isLoadingAgents = false);
    }
  }

  Future<void> _handleOrderAction(String orderId, String action) async {
    try {
      final response = await _apiService.put('/admin/orders/$orderId/$action', {});
      final body = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Order status updated successfully!'),
              backgroundColor: const Color(0xFF71EB44),
            ),
          );
        }
        _fetchOrders();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(body['message'] ?? 'Failed to update order status')),
          );
        }
      }
    } catch (e) {
      //
    }
  }

  Future<void> _createAgentAccount() async {
    if (!_agentFormKey.currentState!.validate()) return;
    setState(() => _isCreatingAgent = true);

    try {
      final response = await _apiService.post('/admin/delivery-agents', {
        'name': _agentNameController.text.trim(),
        'email': _agentEmailController.text.trim(),
        'password': _agentPasswordController.text,
      });

      final body = jsonDecode(response.body);
      if (response.statusCode == 201 && body['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Delivery agent account created successfully!'),
              backgroundColor: Color(0xFF71EB44),
            ),
          );
          Navigator.pop(context); // Close dialog
        }
        _agentNameController.clear();
        _agentEmailController.clear();
        _agentPasswordController.clear();
        _fetchAgents();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(body['message'] ?? 'Failed to create agent account')),
          );
        }
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isCreatingAgent = false);
    }
  }

  Future<void> _saveProduct({String? editProductId}) async {
    if (!_productFormKey.currentState!.validate()) return;
    setState(() => _isSavingProduct = true);

    final payload = {
      'name': _prodNameController.text.trim(),
      'price': double.parse(_prodPriceController.text.trim()),
      'stock': int.parse(_prodStockController.text.trim()),
      'description': _prodDescController.text.trim(),
      'category': _prodCategoryController.text.trim(),
      'imageUrl': _prodImageController.text.trim(),
      'status': _prodStatus,
    };

    try {
      final response = editProductId != null
          ? await _apiService.put('/admin/products/$editProductId', payload)
          : await _apiService.post('/admin/products', payload);

      final body = jsonDecode(response.body);
      if (body['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(editProductId != null ? 'Product updated!' : 'Product created!'),
              backgroundColor: const Color(0xFF71EB44),
            ),
          );
          Navigator.pop(context); // Close dialog
        }
        _fetchProducts();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(body['message'] ?? 'Failed to save product')),
          );
        }
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isSavingProduct = false);
    }
  }

  void _showAgentCreationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New Delivery Agent'),
        content: Form(
          key: _agentFormKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CustomInput(
                controller: _agentNameController,
                labelText: 'Full Name',
                hintText: 'Agent Name',
                prefixIcon: Icons.person_outline,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              CustomInput(
                controller: _agentEmailController,
                labelText: 'Email Address',
                hintText: 'agent@zephyra.com',
                prefixIcon: Icons.email_outlined,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              CustomInput(
                controller: _agentPasswordController,
                labelText: 'Password',
                hintText: '••••••••',
                prefixIcon: Icons.lock_outline,
                isPassword: true,
                validator: (v) => v == null || v.length < 6 ? 'Password min 6 chars' : null,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          _isCreatingAgent
              ? const CircularProgressIndicator(color: Color(0xFF71EB44))
              : CustomButton(
                  text: 'Create',
                  onPressed: _createAgentAccount,
                ),
        ],
      ),
    );
  }

  void _showProductDialog({Map<String, dynamic>? product}) {
    if (product != null) {
      _prodNameController.text = product['name'] ?? '';
      _prodPriceController.text = (product['price'] as num).toString();
      _prodStockController.text = (product['stock'] as num).toString();
      _prodDescController.text = product['description'] ?? '';
      _prodCategoryController.text = product['category'] ?? 'General';
      _prodImageController.text = product['imageUrl'] ?? '';
      _prodStatus = product['status'] ?? 'published';
    } else {
      _prodNameController.clear();
      _prodPriceController.clear();
      _prodStockController.clear();
      _prodDescController.clear();
      _prodCategoryController.text = 'General';
      _prodImageController.clear();
      _prodStatus = 'published';
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(product != null ? 'Edit Product' : 'Add New Product'),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Form(
              key: _productFormKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CustomInput(
                    controller: _prodNameController,
                    labelText: 'Product Name',
                    hintText: 'Wireless Headphones',
                    prefixIcon: Icons.shopping_bag_outlined,
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: CustomInput(
                          controller: _prodPriceController,
                          labelText: 'Price (\$)',
                          hintText: '199.99',
                          prefixIcon: Icons.attach_money_outlined,
                          keyboardType: TextInputType.number,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: CustomInput(
                          controller: _prodStockController,
                          labelText: 'Stock Qty',
                          hintText: '10',
                          prefixIcon: Icons.inventory_2_outlined,
                          keyboardType: TextInputType.number,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    controller: _prodDescController,
                    labelText: 'Description',
                    hintText: 'Product summary specs...',
                    prefixIcon: Icons.description_outlined,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    controller: _prodCategoryController,
                    labelText: 'Category',
                    hintText: 'Electronics',
                    prefixIcon: Icons.category_outlined,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    controller: _prodImageController,
                    labelText: 'Image URL',
                    hintText: 'https://images.unsplash.com/...',
                    prefixIcon: Icons.image_outlined,
                  ),
                  const SizedBox(height: 16),
                  
                  // Publishing status dropdown
                  DropdownButtonFormField<String>(
                    initialValue: _prodStatus,
                    decoration: const InputDecoration(labelText: 'Publish Status'),
                    items: const [
                      DropdownMenuItem(value: 'published', child: Text('Published')),
                      DropdownMenuItem(value: 'draft', child: Text('Draft')),
                      DropdownMenuItem(value: 'hidden', child: Text('Hidden')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _prodStatus = val;
                        });
                      }
                    },
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
          _isSavingProduct
              ? const CircularProgressIndicator(color: Color(0xFF71EB44))
              : CustomButton(
                  text: 'Save',
                  onPressed: () => _saveProduct(editProductId: product?['_id']),
                ),
        ],
      ),
    );
  }

  // --- STATS VIEW TAB ---
  Widget _buildStatsTab() {
    if (_isLoadingStats) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Row of metric cards
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  'Gross Revenue',
                  '\$${_grossRevenue.toStringAsFixed(2)}',
                  Icons.monetization_on,
                  const Color(0xFFF0FDF4),
                  Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  'Active Dispatches',
                  '$_activeOrders',
                  Icons.local_shipping,
                  const Color(0xFFEFF6FF),
                  Colors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  'Pending Approval',
                  '$_pendingApprovals',
                  Icons.pending_actions,
                  const Color(0xFFFFF7ED),
                  Colors.orange,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  'Total Catalog',
                  '$_totalProducts',
                  Icons.grid_view,
                  const Color(0xFFF9F5FF),
                  Colors.purple,
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          const Text(
            'Recent Orders',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          
          _recentOrders.isEmpty
              ? const Text('No orders placed yet.')
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _recentOrders.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final order = _recentOrders[index];
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                order['orderNumber'] ?? '',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '\$${(order['totalAmount'] as num).toStringAsFixed(2)}',
                                style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: order['status'] == 'delivered'
                                  ? const Color(0xFFF0FDF4)
                                  : const Color(0xFFFFF7ED),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              (order['status'] as String).replaceAll('_', ' ').toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: order['status'] == 'delivered' ? Colors.green : Colors.orange,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String val, IconData icon, Color bg, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: iconColor),
          ),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(val, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  // --- INVENTORY MANAGER TAB ---
  Widget _buildInventoryTab() {
    if (_isLoadingProducts) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _productsList.length,
      itemBuilder: (context, index) {
        final product = _productsList[index];
        final name = product['name'] ?? '';
        final price = (product['price'] as num).toDouble();
        final stock = (product['stock'] as num).toInt();
        final status = product['status'] ?? 'draft';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: const Color(0xFFF1F5F9),
              child: Text(
                name.isNotEmpty ? name[0] : 'P',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Price: \$${price.toStringAsFixed(2)} | Stock: $stock'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: status == 'published'
                    ? const Color(0xFFF0FDF4)
                    : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                status.toUpperCase(),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: status == 'published' ? Colors.green : Colors.grey,
                ),
              ),
            ),
            onTap: () => _showProductDialog(product: product),
          ),
        );
      },
    );
  }

  // --- ORDER DISPATCH TAB ---
  Widget _buildOrdersTab() {
    if (_isLoadingOrders) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)));
    }

    final pendingOrders = _ordersQueue.where((o) => o['status'] == 'pending_approval').toList();

    if (pendingOrders.isEmpty) {
      return const Center(child: Text('No orders pending approval.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: pendingOrders.length,
      itemBuilder: (context, index) {
        final order = pendingOrders[index];
        final total = (order['totalAmount'] as num).toDouble();
        final customerName = order['customer']?['name'] ?? 'Customer';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      order['orderNumber'] ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      '\$${total.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF71EB44)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Customer: $customerName'),
                const Divider(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _handleOrderAction(order['_id'], 'reject'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Reject'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: CustomButton(
                        text: 'Approve',
                        onPressed: () => _handleOrderAction(order['_id'], 'approve'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // --- DELIVERY AGENTS TAB ---
  Widget _buildAgentsTab() {
    if (_isLoadingAgents) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _agentsList.length,
      itemBuilder: (context, index) {
        final agent = _agentsList[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFEFF6FF),
              child: Icon(Icons.delivery_dining, color: Colors.blue),
            ),
            title: Text(agent['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(agent['email'] ?? ''),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Zephyra Admin Panel', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  title: const Text('Logout', style: TextStyle(fontWeight: FontWeight.bold)),
                  content: const Text('Are you sure you want to log out of the Admin Panel?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel', style: TextStyle(color: Color(0xFF71717A))),
                    ),
                    TextButton(
                      onPressed: () async {
                        Navigator.pop(context);
                        await _apiService.deleteToken();
                        if (context.mounted) {
                          Navigator.pushReplacementNamed(context, '/login');
                        }
                      },
                      child: const Text('Logout', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.black,
          indicatorColor: const Color(0xFF71EB44),
          tabs: const [
            Tab(icon: Icon(Icons.dashboard_outlined), text: 'Stats'),
            Tab(icon: Icon(Icons.inventory_2_outlined), text: 'Inventory'),
            Tab(icon: Icon(Icons.local_shipping_outlined), text: 'Dispatch'),
            Tab(icon: Icon(Icons.people_outline), text: 'Agents'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildStatsTab(),
          _buildInventoryTab(),
          _buildOrdersTab(),
          _buildAgentsTab(),
        ],
      ),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget? _buildFloatingActionButton() {
    if (_tabController.index == 1) {
      return FloatingActionButton(
        onPressed: () => _showProductDialog(),
        backgroundColor: const Color(0xFF71EB44),
        child: const Icon(Icons.add, color: Colors.black),
      );
    } else if (_tabController.index == 3) {
      return FloatingActionButton(
        onPressed: _showAgentCreationDialog,
        backgroundColor: const Color(0xFF71EB44),
        child: const Icon(Icons.person_add, color: Colors.black),
      );
    }
    return null;
  }
}
