import React, { useEffect, useState } from 'react';
import { Compass, Loader2, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useTrackingStore } from '@/store/trackingStore';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import api from '@/services/api';
import L from 'leaflet';

// Fix Leaflet default marker icons bug in Vite/React bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom delivery agent icon rotation helper
const calculateBearing = (startLat, startLng, endLat, endLng) => {
  const dLng = (endLng - startLng) * (Math.PI / 180);
  const sLat = startLat * (Math.PI / 180);
  const eLat = endLat * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(eLat);
  const x = Math.cos(sLat) * Math.sin(eLat) - Math.sin(sLat) * Math.cos(eLat) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
};

// Helper component to auto-pan and fit camera bounds to both driver and customer
const MapBoundsController = ({ agentCoords, clientCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (agentCoords && agentCoords[0] && clientCoords && clientCoords[0]) {
      const bounds = L.latLngBounds([agentCoords, clientCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [agentCoords, clientCoords, map]);
  return null;
};

export const TrackOrder = () => {
  const { orderId: paramOrderId } = useParams();
  const { startTracking, stopTracking, agentLocation, orderRoute, isTracking, deliveryStatus, error } = useTrackingStore();
  const [resolvedOrderId, setResolvedOrderId] = useState(paramOrderId || null);
  const [searchingOrder, setSearchingOrder] = useState(!paramOrderId);

  const [clientCoords, setClientCoords] = useState([11.3410, 77.7172]); // Erode Default fallback
  const [shippingAddressText, setShippingAddressText] = useState('');
  
  const [roadRoute, setRoadRoute] = useState([]);
  const [bearing, setBearing] = useState(0);
  const prevAgentLocRef = React.useRef(null);

  // 1. Resolve order ID if navigated generally to /customer/track
  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        setSearchingOrder(true);
        const response = await api.get('/tracking/active-order');
        if (response.data.success && response.data.orderId) {
          setResolvedOrderId(response.data.orderId);
        }
      } catch (err) {
        console.error('[Track Order] Failed to resolve active order:', err);
      } finally {
        setSearchingOrder(false);
      }
    };

    if (!paramOrderId) {
      fetchActiveOrder();
    } else {
      setResolvedOrderId(paramOrderId);
    }
  }, [paramOrderId]);

  // 2. Load order details, shipping address, and geocode coordinates
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderRes = await api.get(`/orders/${resolvedOrderId}`);
        if (orderRes.data && orderRes.data.shippingAddress) {
          const addr = orderRes.data.shippingAddress;
          const addrText = `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.postalCode}`;
          setShippingAddressText(addrText);

          // Geocode address using free OpenStreetMap Nominatim API
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addrText)}&format=json&limit=1`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              const lat = parseFloat(geoData[0].lat);
              const lng = parseFloat(geoData[0].lon);
              setClientCoords([lat, lng]);
            } else {
              // Try city level search if full address fails to match
              const cityGeoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr.city)}&format=json&limit=1`
              );
              const cityGeoData = await cityGeoRes.json();
              if (cityGeoData && cityGeoData.length > 0) {
                const lat = parseFloat(cityGeoData[0].lat);
                const lng = parseFloat(cityGeoData[0].lon);
                setClientCoords([lat, lng]);
              }
            }
          } catch (geoErr) {
            console.error('[Geocoding] Nominatim lookup failed:', geoErr);
          }
        }
      } catch (err) {
        console.error('[Track Order] Failed to fetch order details:', err);
      }
    };

    if (resolvedOrderId) {
      fetchOrderDetails();
      startTracking(resolvedOrderId);
    }
    return () => {
      stopTracking();
    };
  }, [resolvedOrderId, startTracking, stopTracking]);

  // 3. OSRM Road Routing Calculation
  useEffect(() => {
    if (!agentLocation || !clientCoords) return;

    const fetchRoadRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${agentLocation.lng},${agentLocation.lat};${clientCoords[1]},${clientCoords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates;
          const path = coords.map((c) => [c[1], c[0]]);
          setRoadRoute(path);
        }
      } catch (err) {
        console.error('[OSRM] Routing failed:', err);
      }
    };

    fetchRoadRoute();
  }, [agentLocation, clientCoords]);

  // 4. Live Vehicle Bearing/Rotation calculation
  useEffect(() => {
    if (agentLocation) {
      if (prevAgentLocRef.current) {
        const prev = prevAgentLocRef.current;
        if (prev.lat !== agentLocation.lat || prev.lng !== agentLocation.lng) {
          const deg = calculateBearing(prev.lat, prev.lng, agentLocation.lat, agentLocation.lng);
          if (deg !== 0) {
            setBearing(deg);
          }
        }
      }
      prevAgentLocRef.current = agentLocation;
    }
  }, [agentLocation]);

  if (searchingOrder) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
        <span className="text-sm text-app-text-secondary mt-3">Locating your active order shipment...</span>
      </div>
    );
  }

  if (!isTracking || !resolvedOrderId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-app-border rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="p-3 bg-app-bg-secondary rounded-full text-app-text-secondary">
          <Compass className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-lg">No Active Tracking</h3>
          <p className="text-sm text-app-text-secondary mt-1">
            You don&apos;t have any active deliveries to track at the moment.
          </p>
        </div>
        <Link to="/customer/orders">
          <Button variant="primary" size="md" className="font-bold cursor-pointer">
            View My Orders
          </Button>
        </Link>
      </div>
    );
  }

  const mapCenter = agentLocation ? [agentLocation.lat, agentLocation.lng] : clientCoords;

  // Custom rotated delivery agent DivIcon
  const rotatedAgentIcon = L.divIcon({
    html: `<div style="transform: rotate(${bearing}deg); transition: transform 0.4s ease-in-out; display: flex; align-items: center; justify-content: center;">
             <img src="https://cdn-icons-png.flaticon.com/512/854/854878.png" style="width: 38px; height: 38px;" alt="Delivery Vehicle" />
           </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
    className: 'rotated-agent-icon-container',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track Your Shipment</h1>
          <p className="text-sm text-app-text-secondary">
            Delivery Status:{' '}
            <strong className="text-app-text-primary uppercase">{deliveryStatus?.replace(/_/g, ' ') || 'In Transit'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" dot>
            Live Tracking Active
          </Badge>
        </div>
      </div>

      {deliveryStatus === 'delivered' && (
        <div className="p-4 border border-success-200 bg-success-50 dark:bg-success-500/10 dark:border-success-500/20 text-success-600 rounded-xl text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Your package has been successfully delivered! Thank you for ordering with Zephyra.</span>
        </div>
      )}

      {error && (
        <div className="p-4 border border-danger-200 bg-danger-50 dark:bg-danger-500/10 dark:border-danger-500/20 text-danger-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-app-border h-[400px] shadow-sm relative z-10">
          <MapContainer
            center={mapCenter}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            />
            {agentLocation && (
              <MapBoundsController
                agentCoords={[agentLocation.lat, agentLocation.lng]}
                clientCoords={clientCoords}
              />
            )}
            
            {/* Customer Marker */}
            <Marker position={clientCoords}>
              <Popup>Your Delivery Address</Popup>
            </Marker>
            
            {/* Delivery Agent Marker */}
            {agentLocation && (
              <Marker position={[agentLocation.lat, agentLocation.lng]} icon={rotatedAgentIcon}>
                <Popup>Delivery Agent Location</Popup>
              </Marker>
            )}
            
            {/* Dynamic Route Trail */}
            {orderRoute.length > 0 && (
              <Polyline
                positions={orderRoute.map(c => [c.lat, c.lng])}
                color="#8b5cf6"
                weight={4}
              />
            )}
            
            {/* Road navigation route */}
            {roadRoute.length > 0 ? (
              <Polyline
                positions={roadRoute}
                color="#8b5cf6"
                weight={5}
                lineCap="round"
                lineJoin="round"
              />
            ) : (
              // Fallback to straight line connector
              agentLocation && (
                <Polyline
                  positions={[[agentLocation.lat, agentLocation.lng], clientCoords]}
                  color="#8b5cf6"
                  dashArray="5, 10"
                  weight={2}
                />
              )
            )}
          </MapContainer>
        </div>

        {/* Tracking Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base">Delivery Information</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-app-text-secondary uppercase">
                  Delivery Destination
                </span>
                <p className="text-xs font-semibold text-app-text-primary leading-relaxed">
                  {shippingAddressText || 'Loading destination details...'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-app-text-secondary uppercase">
                  Courier Coordinates
                </span>
                {agentLocation ? (
                  <p className="font-mono text-xs bg-app-bg-secondary p-3 rounded-lg border border-app-border">
                    Lat: {agentLocation.lat.toFixed(6)}
                    <br />
                    Lng: {agentLocation.lng.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-xs text-app-text-secondary italic">Waiting for signal broadcast...</p>
                )}
              </div>

              {/* Steps */}
              <div className="relative border-l border-app-border pl-6 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 bg-primary-600 text-white rounded-full p-1.5 flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold">
                    {deliveryStatus === 'out_for_delivery' ? 'Courier is approaching' : 'Status: ' + (deliveryStatus || 'Accepted')}
                  </h4>
                  <p className="text-xs text-app-text-secondary">Live updates enabled via socket</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
