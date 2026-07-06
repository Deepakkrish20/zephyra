import 'package:socket_io_client/socket_io_client.dart' as io_client;

class SocketService {
  static const String _socketUrl = 'https://zephyra-ku4d.onrender.com';
  io_client.Socket? _socket;

  // Initialize and connect to socket
  void connect() {
    if (_socket != null && _socket!.connected) return;

    _socket = io_client.io(_socketUrl, io_client.OptionBuilder()
      .setTransports(['websocket']) // Use websocket transport specifically for Flutter compatibility
      .disableAutoConnect()
      .build());

    _socket!.connect();
    
    _socket!.onConnect((_) {
      print('[Socket Service] Connected to server.');
    });

    _socket!.onDisconnect((_) {
      print('[Socket Service] Disconnected from server.');
    });
  }

  // Join the order room
  void joinOrderRoom(String orderId) {
    if (_socket == null || !_socket!.connected) {
      connect();
    }
    _socket!.emit('join-order-room', orderId);
  }

  // Emit coordinate location update
  void emitLocationUpdate({
    required String orderId,
    required String agentId,
    required double latitude,
    required double longitude,
  }) {
    if (_socket == null || !_socket!.connected) return;

    _socket!.emit('location-update', {
      'orderId': orderId,
      'agentId': agentId,
      'lat': latitude,
      'lng': longitude,
      'bearing': 0,
    });
  }

  // Register listener for live coordinates (for customer tracking)
  void onAgentCoordinates(Function(Map<String, dynamic>) onData) {
    if (_socket == null) return;

    _socket!.on('agent-gps-coordinates', (data) {
      if (data is Map) {
        onData(Map<String, dynamic>.from(data));
      }
    });
  }

  // Register listener for order status updates
  void onStatusUpdate(Function(Map<String, dynamic>) onData) {
    if (_socket == null) return;

    _socket!.on('status-update', (data) {
      if (data is Map) {
        onData(Map<String, dynamic>.from(data));
      }
    });
  }

  // Disconnect socket and clean up listeners
  void disconnect() {
    if (_socket != null) {
      _socket!.off('agent-gps-coordinates');
      _socket!.off('status-update');
      _socket!.disconnect();
      _socket = null;
    }
  }
}
