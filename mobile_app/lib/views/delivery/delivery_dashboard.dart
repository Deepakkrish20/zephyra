import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:convert';
import 'dart:async';
import '../../services/api_service.dart';
import '../../services/location_service.dart';
import '../../services/socket_service.dart';
import 'package:geolocator/geolocator.dart';
import '../../widgets/custom_button.dart';

class DeliveryDashboard extends StatefulWidget {
  const DeliveryDashboard({super.key});

  @override
  State<DeliveryDashboard> createState() => _DeliveryDashboardState();
}

class _DeliveryDashboardState extends State<DeliveryDashboard> with SingleTickerProviderStateMixin {
  final _apiService = ApiService();
  final _socketService = SocketService();
  final _locationService = LocationService();
  final MapController _flutterMapController = MapController();
  
  late TabController _tabController;
  StreamSubscription<Position>? _positionSubscription;
  
  bool _isLoadingStats = true;
  bool _isLoadingAvailable = true;
  bool _isLoadingActive = true;
  bool _isTrackingLocation = false;

  // Stats Data
  int _completedCount = 0;
  double _earnings = 0.0;
  double _tips = 0.0;
  double _rating = 5.0;

  // Lists Data
  List<dynamic> _availableJobs = [];
  List<dynamic> _activeJobs = [];

  // Map configuration
  LatLng _currentLocation = const LatLng(11.2761, 76.9507);
  LatLng _customerLocation = const LatLng(11.2681, 76.9587);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(_handleTabSelection);
    _fetchStats();
    _initCurrentLocation();
  }

  Future<void> _initCurrentLocation() async {
    try {
      final pos = await _locationService.getCurrentPosition();
      setState(() {
        _currentLocation = LatLng(pos.latitude, pos.longitude);
        _customerLocation = LatLng(pos.latitude - 0.005, pos.longitude + 0.005);
      });
    } catch (e) {
      print('Failed to get init location: $e');
    }
  }

  void _startLocationTracking(String orderId, String agentId) {
    if (_isTrackingLocation) return;
    
    _socketService.connect();
    _socketService.joinOrderRoom(orderId);

    _positionSubscription = _locationService.getPositionStream().listen(
      (position) {
        final newLoc = LatLng(position.latitude, position.longitude);
        setState(() {
          _currentLocation = newLoc;
        });

        try {
          _flutterMapController.move(newLoc, _flutterMapController.camera.zoom);
        } catch (e) {
          // ignore if map not initialized yet
        }

        _socketService.emitLocationUpdate(
          orderId: orderId,
          agentId: agentId,
          latitude: position.latitude,
          longitude: position.longitude,
        );
      },
      onError: (err) {
        print('Location stream error: $err');
      }
    );

    setState(() {
      _isTrackingLocation = true;
    });
  }

  void _stopLocationTracking() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _socketService.disconnect();
    setState(() {
      _isTrackingLocation = false;
    });
  }

  @override
  void dispose() {
    _stopLocationTracking();
    _tabController.dispose();
    super.dispose();
  }

  void _handleTabSelection() {
    if (_tabController.indexIsChanging) return;

    switch (_tabController.index) {
      case 0:
        _fetchStats();
        break;
      case 1:
        _fetchAvailableJobs();
        break;
      case 2:
        _fetchActiveJobs();
        break;
    }
  }

  Future<void> _fetchStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final response = await _apiService.get('/delivery/stats');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        final data = body['data'];
        setState(() {
          _completedCount = (data['completedOrdersCount'] as num).toInt();
          _earnings = (data['totalEarnings'] as num).toDouble();
          _tips = (data['totalTips'] as num).toDouble();
          _rating = (data['averageRating'] as num).toDouble();
        });
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isLoadingStats = false);
    }
  }

  Future<void> _fetchAvailableJobs() async {
    setState(() => _isLoadingAvailable = true);
    try {
      final response = await _apiService.get('/delivery/available');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        setState(() {
          _availableJobs = body['data']['orders'] ?? [];
        });
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isLoadingAvailable = false);
    }
  }

  Future<void> _fetchActiveJobs() async {
    setState(() => _isLoadingActive = true);
    try {
      final response = await _apiService.get('/delivery/active');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        setState(() {
          _activeJobs = body['data']['orders'] ?? [];
        });

        // Auto-start tracking if there is an active job out for delivery
        final activeRun = _activeJobs.firstWhere(
          (o) => o['status'] == 'out_for_delivery',
          orElse: () => null,
        );
        if (activeRun != null) {
          _startLocationTracking(activeRun['_id'], activeRun['deliveryAgent'] ?? 'mock-agent-123');
        }
      }
    } catch (e) {
      //
    } finally {
      setState(() => _isLoadingActive = false);
    }
  }

  Future<void> _acceptJob(String orderId) async {
    try {
      final response = await _apiService.post('/delivery/accept/$orderId', {});
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Delivery claimed successfully!'),
              backgroundColor: Color(0xFF71EB44),
            ),
          );
        }
        _tabController.animateTo(2); // Auto switch to active contracts tab
        _fetchActiveJobs();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(body['message'] ?? 'Failed to claim delivery')),
          );
        }
      }
    } catch (e) {
      //
    }
  }

  Future<void> _updateJobStatus(String orderId, String currentStatus) async {
    String nextStatus = 'accepted';
    if (currentStatus == 'accepted') {
      nextStatus = 'picked_up';
    } else if (currentStatus == 'picked_up') {
      nextStatus = 'out_for_delivery';
    } else if (currentStatus == 'out_for_delivery') {
      nextStatus = 'delivered';
    }

    try {
      final response = await _apiService.post('/delivery/status/$orderId', {
        'status': nextStatus,
      });

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Status updated to ${nextStatus.replaceAll("_", " ")}!'),
              backgroundColor: const Color(0xFF71EB44),
            ),
          );
        }

        // Live location tracking start/stop trigger
        final currentJob = _activeJobs.firstWhere((o) => o['_id'] == orderId, orElse: () => null);
        final agentId = currentJob != null ? (currentJob['deliveryAgent'] ?? 'mock-agent-123') : 'mock-agent-123';

        if (nextStatus == 'out_for_delivery') {
          _startLocationTracking(orderId, agentId);
        } else if (nextStatus == 'delivered') {
          _stopLocationTracking();
        }

        _fetchActiveJobs();
        _fetchStats();
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(body['message'] ?? 'Failed to update status')),
          );
        }
      }
    } catch (e) {
      //
    }
  }

  // --- STATS TAB VIEW ---
  Widget _buildStatsTab() {
    if (_isLoadingStats) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  'Total Payout',
                  '\$${_earnings.toStringAsFixed(2)}',
                  Icons.monetization_on_outlined,
                  const Color(0xFFF0FDF4),
                  Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  'Total Tips',
                  '\$${_tips.toStringAsFixed(2)}',
                  Icons.volunteer_activism_outlined,
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
                  'Deliveries',
                  '$_completedCount',
                  Icons.done_all_outlined,
                  const Color(0xFFFFF7ED),
                  Colors.orange,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  'Agent Rating',
                  '$_rating / 5.0',
                  Icons.star_outline_sharp,
                  const Color(0xFFF9F5FF),
                  Colors.purple,
                ),
              ),
            ],
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

  // --- AVAILABLE JOBS TAB VIEW ---
  Widget _buildAvailableTab() {
    if (_isLoadingAvailable) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)));
    }

    if (_availableJobs.isEmpty) {
      return const Center(child: Text('No available delivery jobs.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _availableJobs.length,
      itemBuilder: (context, index) {
        final order = _availableJobs[index];
        final orderNum = order['orderNumber'] ?? '';
        final total = (order['totalAmount'] as num).toDouble();
        final addr = order['shippingAddress'];

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(orderNum, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('\$${total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 8),
                if (addr != null) ...[
                  Text('Customer: ${addr['fullName']}'),
                  Text('Delivery Location: ${addr['addressLine1']}, ${addr['city']}'),
                ],
                const Divider(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: CustomButton(
                    text: 'Accept & Pick Up',
                    onPressed: () => _acceptJob(order['_id']),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // --- ACTIVE CONTRACTS TAB VIEW ---
  Widget _buildActiveTab() {
    if (_isLoadingActive) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)));
    }

    if (_activeJobs.isEmpty) {
      return const Center(child: Text('You have no active deliveries.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _activeJobs.length,
      itemBuilder: (context, index) {
        final order = _activeJobs[index];
        final orderNum = order['orderNumber'] ?? '';
        final status = order['status'] ?? 'accepted';
        final addr = order['shippingAddress'];

        String buttonText = 'Mark Picked Up';
        if (status == 'picked_up') {
          buttonText = 'Mark Out for Delivery';
        } else if (status == 'out_for_delivery') {
          buttonText = 'Mark Delivered';
        }

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(orderNum, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        status.toUpperCase().replaceAll('_', ' '),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (addr != null) ...[
                  Text('Customer: ${addr['fullName']}'),
                  Text('Phone: ${addr['phoneNumber']}'),
                  Text('Location: ${addr['addressLine1']}, ${addr['city']}'),
                ],
                const Divider(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: CustomButton(
                    text: buttonText,
                    onPressed: () => _updateJobStatus(order['_id'], status),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // --- MAP ROUTING OVERLAY TAB ---
  Widget _buildMapTab() {
    return FlutterMap(
      mapController: _flutterMapController,
      options: MapOptions(
        initialCenter: _currentLocation,
        initialZoom: 14.0,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.zephyra.mobile',
        ),
        PolylineLayer(
          polylines: [
            Polyline(
              points: [_currentLocation, _customerLocation],
              color: Colors.purple,
              strokeWidth: 4.0,
            ),
          ],
        ),
        MarkerLayer(
          markers: [
            Marker(
              point: _currentLocation,
              width: 50,
              height: 50,
              child: const Icon(
                Icons.directions_bike,
                color: Colors.blue,
                size: 40,
              ),
            ),
            Marker(
              point: _customerLocation,
              width: 50,
              height: 50,
              child: const Icon(
                Icons.location_on,
                color: Colors.red,
                size: 40,
              ),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Courier Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  title: const Text('Logout', style: TextStyle(fontWeight: FontWeight.bold)),
                  content: const Text('Are you sure you want to log out of the Courier Dashboard?'),
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
            Tab(icon: Icon(Icons.leaderboard_outlined), text: 'Stats'),
            Tab(icon: Icon(Icons.assignment_outlined), text: 'Jobs'),
            Tab(icon: Icon(Icons.directions_run_outlined), text: 'Active'),
            Tab(icon: Icon(Icons.map_outlined), text: 'Map'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildStatsTab(),
          _buildAvailableTab(),
          _buildActiveTab(),
          _buildMapTab(),
        ],
      ),
    );
  }
}
