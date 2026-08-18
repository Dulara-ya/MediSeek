import React from 'react';
import { MedicalService, ServiceType } from './types';

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002'; // Not used in this version but good to have

export const LOGO_URL_WITH_TEXT = './Asset/mediseekwithname.png';
export const LOGO_URL_ICON = './Asset/mediseekK.png';

export const APP_COLORS = {
  primary: '#1976D2',
  secondary: '#E3F2FD',
  accent: '#0D47A1',
  background: '#FFFFFF',
  neutralText: '#333333',
  white: '#FFFFFF',
  red: '#D32F2F', // A slightly less harsh red
  blue: '#1976D2', // For doctor markers, matches new primary
};

export const MOCK_DOCTORS: MedicalService[] = [
  { id: 'doc1', name: 'Dr. John Doe', type: ServiceType.Doctor, specialization: 'Cardiologist', location: { lat: 6.9271, lng: 79.8612, address: 'Colombo General Hospital' }, contact: '0112345678', photoUrl: 'https://picsum.photos/seed/doc1/100/100', rating: 4.5, availableTime: 'Mon-Fri 9am-5pm' },
  { id: 'doc2', name: 'Dr. Jane Smith', type: ServiceType.Doctor, specialization: 'Pediatrician', location: { lat: 6.8651, lng: 79.8810, address: 'Lady Ridgeway Hospital' }, contact: '0112987654', photoUrl: 'https://picsum.photos/seed/doc2/100/100', rating: 4.8, availableTime: 'Mon, Wed, Fri 10am-4pm' },
  { id: 'doc3', name: 'Dr. Sunil Perera', type: ServiceType.Doctor, specialization: 'General Physician', location: { lat: 7.2906, lng: 80.6337, address: 'Kandy Clinic' }, contact: '0812223334', photoUrl: 'https://picsum.photos/seed/doc3/100/100', rating: 4.2, availableTime: 'Tue, Thu 2pm-8pm' },
];

export const MOCK_PHARMACIES: MedicalService[] = [
  { id: 'pharm1', name: 'Central Pharmacy', type: ServiceType.Pharmacy, location: { lat: 6.9200, lng: 79.8580, address: 'Union Place, Colombo' }, contact: '0115550000', photoUrl: 'https://picsum.photos/seed/pharm1/100/100', rating: 4.0, availableTime: '24/7' },
  { id: 'pharm2', name: 'HealthFirst Pharmacy', type: ServiceType.Pharmacy, location: { lat: 6.8800, lng: 79.8700, address: 'Galle Road, Wellawatte' }, contact: '0115551111', photoUrl: 'https://picsum.photos/seed/pharm2/100/100', rating: 4.3, availableTime: '8am-10pm' },
  { id: 'pharm3', name: 'City Meds', type: ServiceType.Pharmacy, location: { lat: 7.2950, lng: 80.6350, address: 'Peradeniya Road, Kandy' }, contact: '0815552222', photoUrl: 'https://picsum.photos/seed/pharm3/100/100', rating: 3.9, availableTime: '9am-9pm' },
];

// SVG Icons (Heroicons)
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

export const ChatBubbleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.697-3.697A48.75 48.75 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22-1.28.28-2.596.401-3.923.401H4.5A2.25 2.25 0 012.25 12.75v-4.5c0-.969.616-1.813 1.5-2.097m14.25-3.866A2.25 2.25 0 0017.25 2.25L16.5 2.25H4.5A2.25 2.25 0 002.25 4.5v10.5A2.25 2.25 0 004.5 17.25h7.5c.659 0 1.291-.073 1.888-.201a5.215 5.215 0 011.378-.856 2.24 2.24 0 00.884-.445 2.25 2.25 0 00.582-2.35V7.952a2.25 2.25 0 00-2.25-2.25H15M10.5 5.25A2.25 2.25 0 008.25 3H7.5M15 5.25A2.25 2.25 0 0012.75 3H12" />
  </svg>
);

export const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);
export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);

export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09.971-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const DEFAULT_LOCATION: { lat: number; lng: number } = { lat: 6.9271, lng: 79.8612 }; // Colombo, Sri Lanka
export const MAP_ZOOM_LEVEL = 12;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_Maps_API_KEY || '';


export const EMERGENCY_NUMBER = "1990"; // Suwa Seriya
export const EMERGENCY_NUMBER_2 = "1919"; // Police