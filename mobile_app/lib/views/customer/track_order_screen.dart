import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:convert';
import 'dart:math' as math;
import 'package:http/http.dart' as http;
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

class TrackOrderScreen extends StatefulWidget {
  final String orderId;
  final String orderNumber;

  const TrackOrderScreen({
    super.key,
    required this.orderId,
    required this.orderNumber,
  });

  @override
  State<TrackOrderScreen> createState() => _TrackOrderScreenState();
}

class _TrackOrderScreenState extends State<TrackOrderScreen> {
  final _apiService = ApiService();
  final _socketService = SocketService();
  final MapController _flutterMapController = MapController();

  LatLng _clientLocation = const LatLng(11.2681, 76.9587); // Customer destination
  LatLng? _agentLocation;
  List<LatLng> _orderRoute = [];
  String _deliveryStatus = 'accepted';
  bool _isLoading = true;

  List<LatLng> _roadRoute = [];
  double _agentRotation = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchInitialTracking();
    _socketService.connect();
    _socketService.joinOrderRoom(widget.orderId);
    _registerSocketListeners();
  }

  double _calculateBearing(LatLng start, LatLng end) {
    final double lat1 = start.latitude * (math.pi / 180.0);
    final double lng1 = start.longitude * (math.pi / 180.0);
    final double lat2 = end.latitude * (math.pi / 180.0);
    final double lng2 = end.longitude * (math.pi / 180.0);

    final double dLon = lng2 - lng1;
    final double y = math.sin(dLon) * math.cos(lat2);
    final double x = math.cos(lat1) * math.sin(lat2) -
        math.sin(lat1) * math.cos(lat2) * math.cos(dLon);

    final double radians = math.atan2(y, x);
    return (radians * (180.0 / math.pi) + 360.0) % 360.0;
  }

  Future<void> _fetchRoadRoute() async {
    if (_agentLocation == null) return;
    try {
      final url = Uri.parse(
          'https://router.project-osrm.org/route/v1/driving/${_agentLocation!.longitude},${_agentLocation!.latitude};${_clientLocation.longitude},${_clientLocation.latitude}?overview=full&geometries=geojson');
      final response = await http.get(url, headers: {'User-Agent': 'com.zephyra.mobile'});
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['routes'] != null && (data['routes'] as List).isNotEmpty) {
          final coords = data['routes'][0]['geometry']['coordinates'] as List<dynamic>;
          final path = coords.map((c) => LatLng(
            (c[1] as num).toDouble(),
            (c[0] as num).toDouble(),
          )).toList();

          setState(() {
            _roadRoute = path;
          });
          _fitBounds();
        }
      }
    } catch (e) {
      print('[OSRM Mobile] Route fetch failed: $e');
    }
  }

  void _fitBounds() {
    if (_agentLocation == null) return;
    try {
      final bounds = LatLngBounds.fromPoints([_agentLocation!, _clientLocation]);
      _flutterMapController.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.all(50.0),
        ),
      );
    } catch (e) {
      // Ignore fitCamera fails
    }
  }

  Future<void> _geocodeCustomerAddress(Map<String, dynamic>? addr) async {
    if (addr == null) return;
    try {
      final query = "${addr['addressLine1']}, ${addr['city']}, ${addr['state']}, ${addr['postalCode']}";
      final url = Uri.parse("https://nominatim.openstreetmap.org/search?q=${Uri.encodeComponent(query)}&format=json&limit=1");
      final response = await http.get(url, headers: {'User-Agent': 'com.zephyra.mobile'});
      if (response.statusCode == 200) {
        final list = jsonDecode(response.body) as List<dynamic>;
        if (list.isNotEmpty) {
          final lat = double.parse(list[0]['lat']);
          final lon = double.parse(list[0]['lon']);
          setState(() {
            _clientLocation = LatLng(lat, lon);
          });
          return;
        }
      }
    } catch (e) {
      // Ignore geocoding errors and proceed to fallback
    }

    final city = addr['city']?.toString().toLowerCase() ?? '';
    if (city.contains('erode')) {
      setState(() {
        _clientLocation = const LatLng(11.3410, 77.7172); // Erode center
      });
    }
  }

  Future<void> _fetchInitialTracking() async {
    try {
      // Fetch order details to geocode the customer address
      final orderResponse = await _apiService.get('/orders/${widget.orderId}');
      if (orderResponse.statusCode == 200) {
        final orderBody = jsonDecode(orderResponse.body);
        _geocodeCustomerAddress(orderBody['shippingAddress']);
        setState(() {
          _deliveryStatus = orderBody['status'] ?? 'accepted';
        });
      }

      final response = await _apiService.get('/tracking/${widget.orderId}');
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        final tracking = body['tracking'];
        if (tracking != null) {
          final log = tracking['locationLog'] as List<dynamic>? ?? [];
          final status = tracking['status'] ?? 'accepted';
          
          if (log.isNotEmpty) {
            final route = log.map((coord) => LatLng(
              (coord['lat'] as num).toDouble(),
              (coord['lng'] as num).toDouble(),
            )).toList();

            setState(() {
              _orderRoute = route;
              _agentLocation = route.last;
              _deliveryStatus = status;
            });
            _fetchRoadRoute();
          }
        }
      }
    } catch (e) {
      print('[Track Order] Fetch initial coordinates error: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _registerSocketListeners() {
    _socketService.onAgentCoordinates((data) {
      if (data['lat'] != null && data['lng'] != null) {
        final newPos = LatLng(
          (data['lat'] as num).toDouble(),
          (data['lng'] as num).toDouble(),
        );

        setState(() {
          if (_agentLocation != null) {
            _agentRotation = _calculateBearing(_agentLocation!, newPos);
          }
          _agentLocation = newPos;
          _orderRoute.add(newPos);
        });

        _fetchRoadRoute();
      }
    });

    _socketService.onStatusUpdate((data) {
      if (data['status'] != null) {
        setState(() {
          _deliveryStatus = data['status'];
        });
      }
    });
  }

  @override
  void dispose() {
    _socketService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mapCenter = _agentLocation ?? _clientLocation;

    return Scaffold(
      appBar: AppBar(
        title: Text('Track Shipment #${widget.orderNumber}', style: const TextStyle(fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF71EB44)))
          : Stack(
              children: [
                FlutterMap(
                  mapController: _flutterMapController,
                  options: MapOptions(
                    initialCenter: mapCenter,
                    initialZoom: 13.5,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.zephyra.mobile',
                    ),
                    if (_orderRoute.isNotEmpty)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: _orderRoute,
                            color: const Color(0xFFC084FC),
                            strokeWidth: 3.0,
                          ),
                        ],
                      ),
                    if (_roadRoute.isNotEmpty)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: _roadRoute,
                            color: const Color(0xFF8B5CF6),
                            strokeWidth: 5.0,
                          ),
                        ],
                      )
                    else if (_agentLocation != null)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: [_agentLocation!, _clientLocation],
                            color: const Color(0xFF8B5CF6),
                            strokeWidth: 2.0,
                            strokeJoin: StrokeJoin.round,
                          ),
                        ],
                      ),
                    MarkerLayer(
                      markers: [
                        // Customer Marker
                        Marker(
                          point: _clientLocation,
                          width: 50,
                          height: 50,
                          child: const Icon(
                            Icons.location_on,
                            color: Colors.red,
                            size: 40,
                          ),
                        ),
                        // Agent Marker
                        if (_agentLocation != null)
                          Marker(
                            point: _agentLocation!,
                            width: 50,
                            height: 50,
                            child: Transform.rotate(
                              angle: _agentRotation * (math.pi / 180.0),
                              child: const Icon(
                                Icons.directions_bike,
                                color: Color(0xFF8B5CF6),
                                size: 40,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
                Positioned(
                  bottom: 24,
                  left: 16,
                  right: 16,
                  child: Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: const BoxDecoration(
                              color: Color(0xFFF1F5F9),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.local_shipping_outlined,
                              color: Color(0xFF71EB44),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  'Delivery Status',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF64748B),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _deliveryStatus.toUpperCase().replaceAll('_', ' '),
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
