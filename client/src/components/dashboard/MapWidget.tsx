import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Satellite, Gauge, Mountain, Compass } from "lucide-react";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapWidgetProps {
  className?: string;
}

export default function MapWidget({ className }: MapWidgetProps) {
  const { gpsData, gpsHistory, isConnected } = useBluetooth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter: L.LatLngExpression = [37.7749, -122.4194];
    const initialCenter: L.LatLngExpression = gpsData?.fix && gpsData.latitude !== 0 
      ? [gpsData.latitude, gpsData.longitude]
      : defaultCenter;

    mapInstanceRef.current = L.map(mapRef.current, {
      center: initialCenter,
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    markerRef.current = L.circleMarker(initialCenter, {
      radius: 10,
      fillColor: "#f97316",
      fillOpacity: 1,
      color: "#ea580c",
      weight: 3,
    }).addTo(mapInstanceRef.current);

    pathRef.current = L.polyline([], {
      color: "#f97316",
      weight: 3,
      opacity: 0.8,
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !pathRef.current) return;
    if (!gpsData?.fix || gpsData.latitude === 0) return;

    const newPos: L.LatLngExpression = [gpsData.latitude, gpsData.longitude];
    
    markerRef.current.setLatLng(newPos);
    mapInstanceRef.current.panTo(newPos);

    const validHistory = gpsHistory.filter(g => g.fix && g.latitude !== 0);
    const pathCoords: L.LatLngExpression[] = validHistory.map(g => [g.latitude, g.longitude]);
    pathRef.current.setLatLngs(pathCoords);
  }, [gpsData, gpsHistory]);

  const formatSpeed = (knots: number) => {
    const kmh = knots * 1.852;
    return kmh.toFixed(1);
  };

  const hasValidGPS = gpsData?.fix && gpsData.latitude !== 0 && gpsData.longitude !== 0;

  return (
    <Card className={`${className} flex flex-col overflow-hidden`} data-testid="widget-map">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 flex-shrink-0">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          GPS Tracking
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className={`flex items-center gap-1 text-xs ${hasValidGPS ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              <Satellite className="w-4 h-4" />
              <span>{gpsData?.satellites || 0} sats</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="relative flex-1 min-h-[180px] rounded-xl overflow-hidden mb-3 bg-slate-900">
          <div ref={mapRef} className="absolute inset-0" />
          
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-[1000]">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Connect device for live GPS</p>
              </div>
            </div>
          )}

          {isConnected && !hasValidGPS && (
            <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-md rounded-lg p-2 text-center z-[1000]">
              <p className="text-xs text-muted-foreground">Waiting for GPS fix...</p>
            </div>
          )}

          {hasValidGPS && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-lg p-2 z-[1000]">
              <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-foreground truncate">
                {gpsData!.latitude.toFixed(6)}, {gpsData!.longitude.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center flex-shrink-0">
          <div className="bg-muted/30 rounded-lg p-2">
            <Gauge className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-base font-semibold text-foreground">
              {hasValidGPS ? formatSpeed(gpsData!.speed) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">km/h</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <Mountain className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-base font-semibold text-foreground">
              {hasValidGPS ? gpsData!.altitude.toFixed(0) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">Altitude</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <Compass className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-base font-semibold text-foreground">
              {hasValidGPS ? gpsData!.course.toFixed(0) + '°' : '--'}
            </div>
            <div className="text-xs text-muted-foreground">Heading</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
