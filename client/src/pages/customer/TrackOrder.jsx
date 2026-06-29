import React from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useTrackingStore } from '@/store/trackingStore';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import L from 'leaflet';

// Fix Leaflet default marker icons bug in Vite/React bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom delivery agent icon
const agentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export const TrackOrder = () => {
  const { agentLocation, isTracking, deliveryStatus } = useTrackingStore();

  const clientCoords = [37.7749, -122.4194]; // San Francisco Default

  if (!isTracking) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track Your Shipment</h1>
          <p className="text-sm text-app-text-secondary">
            Delivery Status:{' '}
            <strong className="text-app-text-primary">{deliveryStatus || 'In Transit'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" dot>
            Live Tracking Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-app-border h-[400px] shadow-sm relative z-10">
          <MapContainer
            center={clientCoords}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Customer Marker */}
            <Marker position={clientCoords}>
              <Popup>Your Home Address</Popup>
            </Marker>
            {/* Delivery Agent Marker */}
            {agentLocation && (
              <Marker position={[agentLocation.lat, agentLocation.lng]} icon={agentIcon}>
                <Popup>Delivery Agent</Popup>
              </Marker>
            )}
            {/* Mock Route Polyline */}
            {agentLocation && (
              <Polyline
                positions={[[agentLocation.lat, agentLocation.lng], clientCoords]}
                color="#8b5cf6"
                dashArray="5, 10"
              />
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
              {/* Steps */}
              <div className="relative border-l border-app-border pl-6 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 bg-primary-600 text-white rounded-full p-1.5 flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold">Courier is approaching</h4>
                  <p className="text-xs text-app-text-secondary">Live updates enabled</p>
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
