import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Satellite, AlertCircle } from "lucide-react";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { useEffect, useRef, useState } from "react";

interface MapWidgetProps {
  className?: string;
}

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: object) => {
          panTo: (pos: { lat: number; lng: number }) => void;
        };
        Marker: new (options: object) => {
          setPosition: (pos: { lat: number; lng: number }) => void;
        };
        Polyline: new (options: object) => {
          setPath: (path: { lat: number; lng: number }[]) => void;
        };
        SymbolPath: {
          CIRCLE: number;
        };
      };
    };
    initGoogleMaps: () => void;
  }
}

export default function MapWidget({ className }: MapWidgetProps) {
  const { gpsData, gpsHistory, isConnected } = useBluetooth();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<{ panTo: (pos: { lat: number; lng: number }) => void } | null>(null);
  const markerRef = useRef<{ setPosition: (pos: { lat: number; lng: number }) => void } | null>(null);
  const pathRef = useRef<{ setPath: (path: { lat: number; lng: number }[]) => void } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      return;
    }

    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    window.initGoogleMaps = () => {
      setMapLoaded(true);
    };

    script.onerror = () => {
      setMapError('Failed to load Google Maps');
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    const defaultCenter = { lat: 37.7749, lng: -122.4194 };
    const initialCenter = gpsData?.fix && gpsData.latitude !== 0 
      ? { lat: gpsData.latitude, lng: gpsData.longitude }
      : defaultCenter;

    if (!googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 15,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });

      markerRef.current = new window.google.maps.Marker({
        position: initialCenter,
        map: googleMapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#16a34a",
          strokeWeight: 3,
        },
      });

      pathRef.current = new window.google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: googleMapRef.current,
      });
    }
  }, [mapLoaded, gpsData]);

  useEffect(() => {
    if (!googleMapRef.current || !markerRef.current || !pathRef.current) return;
    if (!gpsData?.fix || gpsData.latitude === 0) return;

    const newPos = { lat: gpsData.latitude, lng: gpsData.longitude };
    
    markerRef.current.setPosition(newPos);
    googleMapRef.current.panTo(newPos);

    const validHistory = gpsHistory.filter(g => g.fix && g.latitude !== 0);
    const pathCoords = validHistory.map(g => ({ lat: g.latitude, lng: g.longitude }));
    pathRef.current.setPath(pathCoords);
  }, [gpsData, gpsHistory]);

  const formatSpeed = (knots: number) => {
    const kmh = knots * 1.852;
    return kmh.toFixed(1);
  };

  const hasValidGPS = gpsData?.fix && gpsData.latitude !== 0 && gpsData.longitude !== 0;

  return (
    <Card className={className} data-testid="widget-map">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">GPS Tracking</CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className={`flex items-center gap-1 text-xs ${hasValidGPS ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              <Satellite className="w-4 h-4" />
              <span>{gpsData?.satellites || 0} sats</span>
            </div>
          )}
          <MapPin className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-slate-800">
          {mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{mapError}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add VITE_GOOGLE_MAPS_API_KEY to enable maps
              </p>
            </div>
          ) : !mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full" />
          )}
          
          {!isConnected && mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Connect device for live GPS</p>
              </div>
            </div>
          )}

          {isConnected && !hasValidGPS && mapLoaded && !mapError && (
            <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-md rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Waiting for GPS fix...</p>
            </div>
          )}

          {hasValidGPS && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-lg p-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground truncate">
                {gpsData!.latitude.toFixed(6)}, {gpsData!.longitude.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold text-foreground">
              {hasValidGPS ? formatSpeed(gpsData!.speed) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">km/h</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-foreground">
              {hasValidGPS ? gpsData!.altitude.toFixed(0) : '--'}
            </div>
            <div className="text-xs text-muted-foreground">Altitude (m)</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-foreground">
              {hasValidGPS ? gpsData!.course.toFixed(0) + '°' : '--'}
            </div>
            <div className="text-xs text-muted-foreground">Heading</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
