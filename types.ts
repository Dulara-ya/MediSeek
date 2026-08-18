
export interface User {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
}

export enum ServiceType {
  Doctor = 'Doctor',
  Pharmacy = 'Pharmacy',
}

export interface MedicalService {
  id: string;
  name: string;
  type: ServiceType;
  specialization?: string; // For doctors
  experience?: string; // For pharmacies/doctors
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  availableTime?: string;
  contact?: string;
  photoUrl?: string;
  rating?: number;
  // Sri Lankan specific fields (simplified)
  registrationNumber?: string; 
  licenseNumber?: string;
}

export interface HealthFormData {
  age: string;
  height: string;
  weight: string;
  glucose: string;
  hemoglobin: string;
  ldlCholesterol: string;
}

export interface HealthPrediction {
  healthScore: number;
  potentialDiseases: string[];
  preventionTips: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: 'en' | 'si' | 'ta';
  image?: string; // For base64 image data
}

export interface ChatSummary {
  date: string; // YYYY-MM-DD
  summary: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

// --- New Types for Provider Registration ---
interface BaseProviderAuthData {
  email: string;
  password: string;
}

export interface ProviderLoginData extends BaseProviderAuthData {}

interface BaseProviderRegistrationData extends BaseProviderAuthData {
  name: string;
  photo?: File | null; // For file input, mock
  availableTime: string;
  contactNumber: string;
  primaryLocationName: string; // New: Descriptive name for the primary location
  primaryLocationCoordinates: GeoLocation | null; // New: Coordinates selected from map
}

export interface DoctorRegistrationData extends BaseProviderRegistrationData {
  specialization: string;
  workingExperience: string;
  currentWorkingPlace: string;
  educationalQualification: string;
  slmcRegistrationNumber: string; // Sri Lankan Medical Council
  licenseNumberDoctor: string; // Specific license number for doctor
}

export interface PharmacyRegistrationData extends BaseProviderRegistrationData {
  pharmacyExperience: string;
  slPharmacyRegistrationNumber: string; // Sri Lankan Pharmacy Council/Authority
  businessRegistrationNumber: string;
  licenseNumberPharmacy: string; // Specific license number for pharmacy
}