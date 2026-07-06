import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Navigation, CheckCircle, AlertCircle, MapPin, User, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import socket from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import toast from 'react-hot-toast';

// Helper component to auto-pan map view to current coordinates
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Helper to calculate coordinate step fraction between two points
const getNextStepCoords = (start, end, stepFraction = 0.05) => {
  if (!start || !end) return start;
  const lat = start[0] + (end[0] - start[0]) * stepFraction;
  const lng = start[1] + (end[1] - start[1]) * stepFraction;
  return [lat, lng];
};

export const DeliveryTracking = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  // Coordinates & Map state
  const [currentCoords, setCurrentCoords] = useState(null); // Real GPS [lat, lng]
  const [customerCoords, setCustomerCoords] = useState(null); // Geocoded customer destination [lat, lng]
  const [coordinatesLog, setCoordinatesLog] = useState([]);
  
  // Order & UI details
  const [shippingAddressText, setShippingAddressText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('accepted');
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [gpsError, setGpsError] = useState(null);

  const watchSubscriptionRef = useRef(null);
  const deliveryStatusRef = useRef(deliveryStatus);
  const simulationIntervalRef = useRef(null);
  const isDrivingRef = useRef(false);

  // Sync deliveryStatus ref to avoid watchPosition callback restarts
  useEffect(() => {
    deliveryStatusRef.current = deliveryStatus;
  }, [deliveryStatus]);

  // Starts watching real position using browser Geolocation API
  const startLocationWatch = useCallback(() => {
    if (watchSubscriptionRef.current !== null) return; // Already watching

    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.';
      setGpsError(errMsg);
      toast.error(errMsg);
      return;
    }

    setGpsError(null);

    const startWatch = (highAccuracy = true) => {
      watchSubscriptionRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coordsArray = [lat, lng];

          console.log('[GPS Watch] Browser Geolocation resolved coordinates:', lat, lng);

          if (!isDrivingRef.current) {
            setCurrentCoords(coordsArray);
            setCoordinatesLog((prev) => [...prev, coordsArray]);

            // Upload live coordinate packet via Socket.io only when out for delivery
            if (deliveryStatusRef.current === 'out_for_delivery') {
              socket.emit('location-update', {
                orderId,
                agentId: user?._id || user?.id,
                lat,
                lng,
                bearing: 0,
              });
            }
          }
        },
        (error) => {
          console.warn(`[GPS Watch] Error (highAccuracy=${highAccuracy}):`, error.message);
          
          if (highAccuracy && error.code !== error.PERMISSION_DENIED) {
            // Fall back to low-accuracy if high-accuracy times out or fails (common on static indoor laptops)
            console.log('[GPS Watch] Retrying with highAccuracy = false...');
            if (watchSubscriptionRef.current !== null) {
              navigator.geolocation.clearWatch(watchSubscriptionRef.current);
              watchSubscriptionRef.current = null;
            }
            startWatch(false);
            return;
          }

          let errorMsg = 'Failed to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'GPS Location Permission Denied. Please enable location permissions in your browser.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'GPS position is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'GPS location request timed out.';
          }
          setGpsError(errorMsg);
          toast.error(errorMsg);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
          maximumAge: 10000,
        }
      );
    };

    startWatch(true);
  }, [orderId, user]);

  // 1. Fetch order details, geocode customer address, and load initial tracking history
  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID provided.');
      navigate('/delivery');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setGpsError(null);

      let resolvedCustomerLat = 11.3410;
      let resolvedCustomerLng = 77.7172;

      // A. Pull order details (Customer address, name, phone)
      try {
        const orderRes = await api.get(`/orders/${orderId}`);
        if (orderRes.data) {
          const order = orderRes.data;
          setOrderNumber(order.orderNumber || '');
          setDeliveryStatus(order.status || 'accepted');
          
          if (order.shippingAddress) {
            const addr = order.shippingAddress;
            setCustomerName(addr.fullName || '');
            setCustomerPhone(addr.phoneNumber || '');
            
            const addrText = `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.postalCode}`;
            setShippingAddressText(addrText);

            // Geocode using OpenStreetMap Nominatim
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addrText)}&format=json&limit=1`
              );
              const geoData = await geoRes.json();
              if (geoData && geoData.length > 0) {
                resolvedCustomerLat = parseFloat(geoData[0].lat);
                resolvedCustomerLng = parseFloat(geoData[0].lon);
                setCustomerCoords([resolvedCustomerLat, resolvedCustomerLng]);
              } else {
                // Fallback to city
                const cityGeoRes = await fetch(
                  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr.city)}&format=json&limit=1`
                );
                const cityGeoData = await cityGeoRes.json();
                if (cityGeoData && cityGeoData.length > 0) {
                  resolvedCustomerLat = parseFloat(cityGeoData[0].lat);
                  resolvedCustomerLng = parseFloat(cityGeoData[0].lon);
                  setCustomerCoords([resolvedCustomerLat, resolvedCustomerLng]);
                }
              }
            } catch (geoErr) {
              console.error('[Delivery GPS] Address Geocoding failed:', geoErr);
            }
          }
        }
      } catch (err) {
        console.error('[Delivery GPS] Failed to pull order information:', err);
        toast.error('Failed to retrieve order metadata.');
      }

      // B. Fetch historical route coordinates
      try {
        const response = await api.get(`/tracking/${orderId}`);
        if (response.data.success && response.data.tracking) {
          const { locationLog } = response.data.tracking;
          // Filter out legacy SF mock coordinates
          const filteredLog = (locationLog || []).filter(
            coord => !(coord.lat > 37.7 && coord.lat < 37.8 && coord.lng > -122.5 && coord.lng < -122.4)
          );

          if (filteredLog.length > 0) {
            const formatted = filteredLog.map(coord => [coord.lat, coord.lng]);
            setCoordinatesLog(formatted);
            setCurrentCoords(formatted[formatted.length - 1]);
          }
        }
      } catch (error) {
        console.error('[Delivery GPS] Failed to pull tracking log:', error);
      }

      setIsLoading(false);
      // Immediately start Geolocation Watcher on page load to request browser permissions
      startLocationWatch();
    };

    loadData();
    socket.connect();
    socket.emit('join-order-room', orderId);

    return () => {
      if (watchSubscriptionRef.current !== null) {
        navigator.geolocation.clearWatch(watchSubscriptionRef.current);
      }
      if (simulationIntervalRef.current !== null) {
        clearInterval(simulationIntervalRef.current);
      }
      socket.disconnect();
    };
  }, [orderId, navigate, startLocationWatch]);

  // Triggers Start Delivery flow
  const handleStartDelivery = async () => {
    try {
      // Set status to out_for_delivery on backend
      const response = await api.post(`/delivery/status/${orderId}`, {
        status: 'out_for_delivery',
      });

      if (response.data) {
        setDeliveryStatus('out_for_delivery');
        isDrivingRef.current = true;
        startLocationWatch();

        // Start auto-movement simulation towards customer destination
        if (simulationIntervalRef.current !== null) {
          clearInterval(simulationIntervalRef.current);
        }

        let currentAgentPos = currentCoords || [11.3410, 77.7172];
        const destPos = customerCoords || [11.2681, 76.9587];

        simulationIntervalRef.current = setInterval(() => {
          if (deliveryStatusRef.current !== 'out_for_delivery') {
            clearInterval(simulationIntervalRef.current);
            return;
          }

          // Step 8% closer to customer destination
          currentAgentPos = getNextStepCoords(currentAgentPos, destPos, 0.08);
          
          setCurrentCoords(currentAgentPos);
          setCoordinatesLog((prev) => [...prev, currentAgentPos]);

          // Emit coordinate update over socket to customer
          socket.emit('location-update', {
            orderId,
            agentId: user?._id || user?.id,
            lat: currentAgentPos[0],
            lng: currentAgentPos[1],
            bearing: 0,
          });

          // If we arrive at destination (within ~50 meters), clear interval
          const dist = Math.sqrt(
            Math.pow(currentAgentPos[0] - destPos[0], 2) +
            Math.pow(currentAgentPos[1] - destPos[1], 2)
          );
          if (dist < 0.001) {
            clearInterval(simulationIntervalRef.current);
          }
        }, 3000);

        toast.success('Delivery run started! GPS location streaming is online.');
      }
    } catch (err) {
      console.error('[Delivery GPS] Start delivery status transition failed:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status to out for delivery.');
    }
  };

  // Triggers final delivery completion
  const handleMarkDelivered = async () => {
    try {
      // Set status to delivered on backend
      const response = await api.post(`/delivery/status/${orderId}`, {
        status: 'delivered',
      });

      if (response.data) {
        // Emit completion event to socket
        socket.emit('order-delivered', { orderId });
        
        // Stop tracking watch & simulation timer
        if (watchSubscriptionRef.current !== null) {
          navigator.geolocation.clearWatch(watchSubscriptionRef.current);
          watchSubscriptionRef.current = null;
        }
        if (simulationIntervalRef.current !== null) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        isDrivingRef.current = false;

        setDeliveryStatus('delivered');
        toast.success('Order marked as successfully delivered!');
        
        // Redirect back to delivery contracts dashboard
        setTimeout(() => {
          navigate('/delivery');
        }, 1500);
      }
    } catch (err) {
      console.error('[Delivery GPS] Deliver status transition failed:', err);
      toast.error(err.response?.data?.message || 'Failed to mark order as delivered.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-app-text-secondary mt-3">Loading delivery route console...</span>
      </div>
    );
  }

  // Determine center of map
  const mapCenter = currentCoords || customerCoords || [11.3410, 77.7172];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Delivery Dispatch</h1>
          <p className="text-sm text-app-text-secondary">
            Order Reference: <strong className="text-app-text-primary">#{orderNumber}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              deliveryStatus === 'delivered'
                ? 'success'
                : deliveryStatus === 'out_for_delivery'
                ? 'info'
                : 'secondary'
            }
          >
            {deliveryStatus.toUpperCase().replace(/_/g, ' ')}
          </Badge>
          {deliveryStatus === 'out_for_delivery' && !gpsError && (
            <Badge variant="success" dot>
              Live GPS Streaming
            </Badge>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="p-4 border border-danger-200 bg-danger-50 dark:bg-danger-500/10 dark:border-danger-500/20 text-danger-600 rounded-xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">GPS Error</h4>
            <p className="mt-0.5">{gpsError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-app-border h-[450px] shadow-sm relative z-10">
          <MapContainer
            center={mapCenter}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentCoords && <MapController center={currentCoords} />}
            
            {/* Courier Position Marker */}
            {currentCoords && (
              <Marker position={currentCoords}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}

            {/* Customer Drop-off Marker */}
            {customerCoords && (
              <Marker position={customerCoords}>
                <Popup>Customer Drop-off Destination</Popup>
              </Marker>
            )}

            {/* Path Polyline */}
            {coordinatesLog.length > 0 && (
              <Polyline
                positions={coordinatesLog}
                color="#22c55e"
                weight={5}
              />
            )}
          </MapContainer>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base">Delivery Information</h3>
            </CardHeader>
            <CardBody className="space-y-5">
              {/* Customer Profile */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-app-bg-secondary rounded-lg">
                    <User className="w-4 h-4 text-app-text-secondary" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-app-text-secondary">Customer</span>
                    <p className="text-sm font-bold text-app-text-primary">{customerName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-app-bg-secondary rounded-lg">
                    <Phone className="w-4 h-4 text-app-text-secondary" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-app-text-secondary">Contact</span>
                    <p className="text-sm font-semibold text-app-text-primary">{customerPhone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-app-bg-secondary rounded-lg shrink-0">
                    <MapPin className="w-4 h-4 text-app-text-secondary" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-app-text-secondary">Address</span>
                    <p className="text-xs font-medium text-app-text-primary leading-relaxed mt-0.5">
                      {shippingAddressText || 'Loading address...'}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-app-border" />

              {/* Status Controls */}
              <div className="space-y-3">
                {deliveryStatus === 'accepted' || deliveryStatus === 'picked_up' ? (
                  <Button
                    variant="success"
                    className="w-full font-bold cursor-pointer"
                    icon={Navigation}
                    onClick={handleStartDelivery}
                  >
                    Start Delivery Run
                  </Button>
                ) : deliveryStatus === 'out_for_delivery' ? (
                  <Button
                    variant="primary"
                    className="w-full font-bold cursor-pointer"
                    icon={CheckCircle}
                    onClick={handleMarkDelivered}
                  >
                    Mark as Delivered
                  </Button>
                ) : (
                  <div className="p-4 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 text-success-600 rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">Delivery Completed!</span>
                  </div>
                )}
                
                <p className="text-[11px] text-app-text-secondary text-center leading-relaxed">
                  {deliveryStatus === 'out_for_delivery'
                    ? 'GPS tracking is active. Keep this tab open to continuously stream coordinates to the customer.'
                    : 'Real-time GPS coordination activates when the delivery run is started.'}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const DeliveryTrackingWithWrapper = () => <DeliveryTracking />;
export default DeliveryTrackingWithWrapper;
