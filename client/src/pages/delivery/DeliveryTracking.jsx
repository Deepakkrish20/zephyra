import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useTrackingStore } from '@/store/trackingStore';

export const DeliveryTracking = () => {
  const { updateAgentLocation, startTracking } = useTrackingStore();
  const [coordinatesLog, setCoordinatesLog] = useState([]);

  const customerCoords = [37.7749, -122.4194]; // Target
  const [currentLat, setCurrentLat] = useState(37.7812);
  const [currentLng, setCurrentLng] = useState(-122.4172);

  useEffect(() => {
    startTracking('ZEP-9902');
    updateAgentLocation(currentLat, currentLng);
    setCoordinatesLog([{ lat: currentLat, lng: currentLng }]);
  }, []);

  const handleSimulateStep = () => {
    // Walk closer to customer coordinates
    const stepSize = 0.0015;
    const latDiff = customerCoords[0] - currentLat;
    const lngDiff = customerCoords[1] - currentLng;

    const newLat =
      currentLat + (Math.abs(latDiff) > stepSize ? Math.sign(latDiff) * stepSize : latDiff);
    const newLng =
      currentLng + (Math.abs(lngDiff) > stepSize ? Math.sign(lngDiff) * stepSize : lngDiff);

    setCurrentLat(newLat);
    setCurrentLng(newLng);
    updateAgentLocation(newLat, newLng);
    setCoordinatesLog((prev) => [...prev, { lat: newLat, lng: newLng }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GPS Duty Log</h1>
          <p className="text-sm text-app-text-secondary">
            Simulate live agent updates transmitted to customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" dot>
            GPS Broadcast Online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-app-border h-[400px] shadow-sm relative z-10">
          <MapContainer
            center={[currentLat, currentLng]}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Agent Location Marker */}
            <Marker position={[currentLat, currentLng]}>
              <Popup>Your Coordinates</Popup>
            </Marker>
            {/* Customer Destination Marker */}
            <Marker position={customerCoords}>
              <Popup>Customer Drop-off</Popup>
            </Marker>
            {/* Trail */}
            <Polyline
              positions={coordinatesLog.map((c) => [c.lat, c.lng])}
              color="#71eb44"
              weight={4}
            />
          </MapContainer>
        </div>

        {/* Simulator controls */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base">GPS Location Broadcast Emulator</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-app-text-secondary uppercase">
                  Current Node Broadcast
                </span>
                <p className="font-mono text-sm bg-app-bg-secondary p-3 rounded-lg border border-app-border">
                  Lat: {currentLat.toFixed(6)}
                  <br />
                  Lng: {currentLng.toFixed(6)}
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" icon={Navigation} onClick={handleSimulateStep}>
                  Simulate Driving Step
                </Button>
                <p className="text-xs text-app-text-secondary leading-relaxed">
                  Clicking the button shifts coordinates closer to the customer destination and
                  records a polyline path on the map.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default DeliveryTracking;
