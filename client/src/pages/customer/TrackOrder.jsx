import React, { useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { MapPin, Truck, Compass, PhoneCall } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useTrackingStore } from '@/store/trackingStore';
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
  popupAnchor: [0, -38]
});

export const TrackOrder = () => {
  const { agentLocation, isTracking, startTracking, updateAgentLocation } = useTrackingStore();

  const clientCoords = [37.7749, -122.4194]; // San Francisco Default
  const mockAgentCoords = [37.7833, -122.4167]; // Near SFO

  useEffect(() => {
    startTracking('ZEP-9902');
    updateAgentLocation(mockAgentCoords[0], mockAgentCoords[1]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track Your Shipment</h1>
          <p className="text-sm text-app-text-secondary">Order ID: <strong className="text-app-text-primary">#ZEP-9902</strong></p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" dot>Live Tracking Active</Badge>
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
              <Popup>
                Your Home Address
              </Popup>
            </Marker>
            {/* Delivery Agent Marker */}
            {agentLocation && (
              <Marker position={[agentLocation.lat, agentLocation.lng]} icon={agentIcon}>
                <Popup>
                  Delivery Agent (Alex)
                </Popup>
              </Marker>
            )}
            {/* Mock Route Polyline */}
            {agentLocation && (
              <Polyline 
                positions={[
                  [agentLocation.lat, agentLocation.lng],
                  clientCoords
                ]} 
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
                  <p className="text-xs text-app-text-secondary">Estimated arrival: 8 mins</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 bg-success-500 text-white rounded-full p-1.5 flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold">Order Approved & Dispatched</h4>
                  <p className="text-xs text-app-text-secondary">Assigned to agent #ZEP-DRV-09</p>
                </div>
              </div>

              {/* Agent contact */}
              <div className="flex items-center justify-between p-4 bg-app-bg-secondary rounded-xl border border-app-border">
                <div>
                  <p className="text-xs text-app-text-secondary">Delivery Agent</p>
                  <p className="text-sm font-bold">Alex Mercer</p>
                </div>
                <button className="bg-primary-50 text-primary-600 p-2.5 rounded-full hover:bg-primary-100 transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default TrackOrder;
