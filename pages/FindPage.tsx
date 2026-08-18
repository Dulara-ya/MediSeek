import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/PageWrapper';
import MapDisplay from '../components/MapDisplay';
import Spinner from '../components/Spinner';
import useGeolocation from '../hooks/useGeolocation';
import { MedicalService, ServiceType, GeoLocation } from '../types';
import { DEFAULT_LOCATION, SearchIcon, MapPinIcon } from '../constants';
import { useProviders } from '../contexts/ProviderContext';

type WithLocation = MedicalService & { location: GeoLocation };

// A simple card component to display a medical service
const ServiceCard: React.FC<{
  service: MedicalService;
  onDirectionsClick: (loc: GeoLocation) => void;
}> = ({ service, onDirectionsClick }) => {
  const hasLocation = !!(service.location && typeof service.location.lat === 'number' && typeof service.location.lng === 'number');

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex">
      <img
        src={service.photoUrl || `https://picsum.photos/seed/${service.id ?? 'unknown'}/100`}
        alt={service.name ?? 'Service'}
        className="w-20 h-20 rounded-md object-cover mr-4"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://picsum.photos/seed/default/100'; }}
      />
      <div className="flex-grow">
        <h3
          className={`font-bold text-lg ${
            service.type === ServiceType.Doctor ? 'text-calm-blue-primary' : 'text-red-500'
          }`}
        >
          {service.name ?? 'Unnamed'}
        </h3>

        {service.type === ServiceType.Doctor && !!service.specialization && (
          <p className="text-sm text-gray-600">{service.specialization}</p>
        )}

        {service.type === ServiceType.Pharmacy && !!service.experience && (
          <p className="text-sm text-gray-600">{service.experience}</p>
        )}

        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <MapPinIcon className="w-3 h-3 mr-1" />
          {service.location?.address ?? 'No address provided'}
        </p>

        {!!service.availableTime && <p className="text-xs text-gray-500">Available: {service.availableTime}</p>}
        {!!service.contact && <p className="text-xs text-gray-500">Contact: {service.contact}</p>}
        {!!service.registrationNumber && <p className="text-xs text-gray-500">Reg No: {service.registrationNumber}</p>}
        {!!service.licenseNumber && <p className="text-xs text-gray-500">License No: {service.licenseNumber}</p>}
        {typeof service.rating === 'number' && (
          <p className="text-xs text-yellow-500">Rating: {service.rating} / 5</p>
        )}

        <button
          onClick={() => {
            if (hasLocation && service.location) onDirectionsClick(service.location);
          }}
          disabled={!hasLocation}
          title={hasLocation ? 'Open directions in Google Maps' : 'Location not available'}
          className={`mt-2 text-sm ${
            hasLocation
              ? 'text-calm-blue-accent hover:underline'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          Get Directions
        </button>
      </div>
    </div>
  );
};

const FindPage: React.FC = () => {
  const { location: userLocation, error: geoError, loading: geoLoading } = useGeolocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.Doctor);
  const [mapCenter, setMapCenter] = useState<GeoLocation>(DEFAULT_LOCATION);

  const { state: providerState } = useProviders();

  // Safe state fallbacks (avoid crashes if context hasn’t populated yet)
  const registeredDoctors = providerState?.registeredDoctors ?? [];
  const registeredPharmacies = providerState?.registeredPharmacies ?? [];

  // Safer human label for current service type
  const typeLabel = useMemo(
    () => (serviceType === ServiceType.Doctor ? 'doctor' : 'pharmacy'),
    [serviceType]
  );

  // Update the map's center to the user's location when it's first available
  useEffect(() => {
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  // Memoized list of services to display based on search term and service type
  const servicesToDisplay: MedicalService[] = useMemo(() => {
    const source = serviceType === ServiceType.Doctor ? registeredDoctors : registeredPharmacies;

    if (!searchTerm.trim()) return source;

    const q = searchTerm.toLowerCase();
    return source.filter((service) => {
      const inName = (service.name ?? '').toLowerCase().includes(q);
      const inSpec = (service.specialization ?? '').toLowerCase().includes(q);
      const inExp = (service.experience ?? '').toLowerCase().includes(q);
      const inAddr = (service.location?.address ?? '').toLowerCase().includes(q);
      return inName || inSpec || inExp || inAddr;
    });
  }, [searchTerm, serviceType, registeredDoctors, registeredPharmacies]);

  // Markers should only include items with valid lat/lng
  const markerServices: WithLocation[] = useMemo(
    () =>
      servicesToDisplay.filter((s): s is WithLocation =>
        !!(s.location && typeof s.location.lat === 'number' && typeof s.location.lng === 'number')
      ),
    [servicesToDisplay]
  );

  // Handle a marker click on the map, centering the map on that location
  const handleMarkerClick = (service: MedicalService) => {
    if (service.location && typeof service.location.lat === 'number' && typeof service.location.lng === 'number') {
      setMapCenter(service.location);
    }
  };

  // Open Google Maps directions in a new tab (no-op if loc invalid)
  const handleGetDirections = (loc: GeoLocation) => {
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (geoLoading) {
    return (
      <PageWrapper title="Finding Services...">
        <Spinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Find Medical Services">
      {geoError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4 text-sm">{geoError}</p>}

      <div className="mb-4">
        <MapDisplay
          center={mapCenter}
          services={markerServices}
          userLocation={userLocation}
          onMarkerClick={handleMarkerClick}
          height="300px"
        />
      </div>

      <div className="sticky top-0 bg-calm-blue-secondary py-2 z-10">
        <div className="flex items-center bg-white p-2 rounded-lg shadow mb-4">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder={
              serviceType === ServiceType.Doctor
                ? 'Search registered doctors (name, specialty, location)...'
                : 'Search registered pharmacies (name, location)...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow focus:outline-none bg-transparent"
          />
        </div>

        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => setServiceType(ServiceType.Doctor)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              serviceType === ServiceType.Doctor
                ? 'bg-calm-blue-primary text-white'
                : 'bg-white text-calm-blue-primary border border-calm-blue-primary'
            }`}
          >
            Doctors ({registeredDoctors.length})
          </button>
          <button
            onClick={() => setServiceType(ServiceType.Pharmacy)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              serviceType === ServiceType.Pharmacy
                ? 'bg-red-500 text-white'
                : 'bg-white text-red-500 border border-red-500'
            }`}
          >
            Pharmacies ({registeredPharmacies.length})
          </button>
        </div>
      </div>

      {servicesToDisplay.length === 0 && !!searchTerm && (
        <p className="text-center text-gray-500 mt-4">
          No registered {typeLabel}s found matching &quot;{searchTerm}&quot;.
        </p>
      )}
      {servicesToDisplay.length === 0 && !searchTerm && (
        <p className="text-center text-gray-500 mt-4">
          No registered {typeLabel}s found. You can register doctors or pharmacies via the &apos;Profile&apos; then
          &apos;Doctor/Pharmacy Login/Register&apos; links.
        </p>
      )}

      <div className="space-y-4">
        {servicesToDisplay.map((service, idx) => (
          <ServiceCard
            key={service.id ?? `${service.name ?? 'service'}-${idx}`}
            service={service}
            onDirectionsClick={handleGetDirections}
          />
        ))}
      </div>
    </PageWrapper>
  );
};

export default FindPage;
