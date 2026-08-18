// contexts/ProviderContext.tsx
import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { MedicalService, ServiceType, DoctorRegistrationData, PharmacyRegistrationData } from '../types';
import { db, storage } from '../firebase'; // <-- adjust if your path is different

// Firestore & Auth
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

// Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/* ----------------------- tiny utils ----------------------- */

function sanitize(input?: string | null) {
  return (input ?? '').replace(/–|—/g, '-').trim();
}
function parseNum(v: any): number | undefined {
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : undefined;
}
async function uploadPhotoIfAny(folder: string, file?: File) {
  if (!file) return undefined;
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
  const storageRef = ref(storage, key);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/** Waits for Firebase Auth to be initialized and returns the current user (or null) */
function waitForAuthUser(timeoutMs = 3000): Promise<User | null> {
  const auth = getAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsub();
      resolve(getAuth().currentUser); // may be null
    }, timeoutMs);
    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(timer);
      unsub();
      resolve(u);
    });
  });
}

/* ----------------------- mappers ----------------------- */

function mapFirestoreToDoctor(id: string, data: any): MedicalService {
  return {
    id,
    type: ServiceType.Doctor,
    name: data.name ?? '',
    specialization: data.specialization ?? '',
    experience: data.experience ?? '',
    location: {
      lat: parseNum(data?.location?.lat),
      lng: parseNum(data?.location?.lng),
      address: data?.location?.address ?? '',
    },
    availableTime: data.availableTime ?? '',
    contact: data.contact ?? '',
    photoUrl: data.photoUrl ?? '',
    registrationNumber: data.registrationNumber ?? '',
    licenseNumber: data.licenseNumber ?? '',
    rating: typeof data.rating === 'number' ? data.rating : undefined,
  };
}
function mapFirestoreToPharmacy(id: string, data: any): MedicalService {
  return {
    id,
    type: ServiceType.Pharmacy,
    name: data.name ?? '',
    experience: data.experience ?? '',
    location: {
      lat: parseNum(data?.location?.lat),
      lng: parseNum(data?.location?.lng),
      address: data?.location?.address ?? '',
    },
    availableTime: data.availableTime ?? '',
    contact: data.contact ?? '',
    photoUrl: data.photoUrl ?? '',
    registrationNumber: data.registrationNumber ?? '',
    licenseNumber: data.licenseNumber ?? '',
    rating: typeof data.rating === 'number' ? data.rating : undefined,
  };
}

/* ----------------------- state ----------------------- */

interface ProviderContextState {
  registeredDoctors: MedicalService[];
  registeredPharmacies: MedicalService[];
}
type ProviderAction =
  | { type: 'SET_DOCTORS'; payload: MedicalService[] }
  | { type: 'SET_PHARMACIES'; payload: MedicalService[] }
  | { type: 'ADD_DOCTOR'; payload: MedicalService }
  | { type: 'ADD_PHARMACY'; payload: MedicalService };

const ProviderContext = createContext<{
  state: ProviderContextState;
  addRegisteredDoctor: (doctorData: DoctorRegistrationData) => Promise<void>;
  addRegisteredPharmacy: (pharmacyData: PharmacyRegistrationData) => Promise<void>;
} | undefined>(undefined);

function reducer(state: ProviderContextState, action: ProviderAction): ProviderContextState {
  switch (action.type) {
    case 'SET_DOCTORS':
      return { ...state, registeredDoctors: action.payload };
    case 'SET_PHARMACIES':
      return { ...state, registeredPharmacies: action.payload };
    case 'ADD_DOCTOR':
      return { ...state, registeredDoctors: [...state.registeredDoctors, action.payload] };
    case 'ADD_PHARMACY':
      return { ...state, registeredPharmacies: [...state.registeredPharmacies, action.payload] };
    default:
      return state;
  }
}

/* ----------------------- provider ----------------------- */

export const ProviderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    registeredDoctors: [],
    registeredPharmacies: [],
  });

  // Initial load of lists
  useEffect(() => {
    (async () => {
      try {
        const [dSnap, pSnap] = await Promise.all([
          getDocs(query(collection(db, 'doctors'), orderBy('createdAt', 'asc'))).catch(() =>
            getDocs(collection(db, 'doctors'))
          ),
          getDocs(query(collection(db, 'pharmacies'), orderBy('createdAt', 'asc'))).catch(() =>
            getDocs(collection(db, 'pharmacies'))
          ),
        ]);

        dispatch({ type: 'SET_DOCTORS', payload: dSnap.docs.map(d => mapFirestoreToDoctor(d.id, d.data())) });
        dispatch({ type: 'SET_PHARMACIES', payload: pSnap.docs.map(d => mapFirestoreToPharmacy(d.id, d.data())) });
      } catch (e) {
        console.error('Failed to load providers:', e);
      }
    })();
  }, []);

  /* --------------- create/update actions --------------- */

  const addRegisteredDoctor = async (doctorData: DoctorRegistrationData) => {
    // REMOVED: Authentication check
    try {
      const photoUrl = await uploadPhotoIfAny('doctors', doctorData.photo);
      const payload: any = {
        name: sanitize(doctorData.name),
        specialization: sanitize(doctorData.specialization),
        experience: sanitize(doctorData.workingExperience),
        availableTime: sanitize(doctorData.availableTime),
        contact: sanitize(doctorData.contactNumber),
        photoUrl: photoUrl ?? `https://picsum.photos/seed/newdoc/100/100`,
        registrationNumber: sanitize(doctorData.slmcRegistrationNumber),
        licenseNumber: sanitize(doctorData.licenseNumberDoctor),
        rating: null,
        // ownerUid: user.uid, // REMOVED: No longer tied to a user
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const lat = parseNum(doctorData.primaryLocationCoordinates?.lat);
      const lng = parseNum(doctorData.primaryLocationCoordinates?.lng);
      if (lat !== undefined && lng !== undefined) {
        payload.location = {
          lat,
          lng,
          address: sanitize(doctorData.primaryLocationName),
        };
      }

      // CHANGED: Use addDoc to create a new document with a random ID
      const docRef = await addDoc(collection(db, 'doctors'), payload);

      // Local optimistic update
      dispatch({
        type: 'ADD_DOCTOR',
        // CHANGED: Use the new docRef.id for the local state
        payload: mapFirestoreToDoctor(docRef.id, payload),
      });
    } catch (error: any) {
      console.error('Error adding doctor to Firestore:', { code: error.code, message: error.message });
      throw error;
    }
  };

  const addRegisteredPharmacy = async (pharmacyData: PharmacyRegistrationData) => {
    // REMOVED: Authentication check
    try {
      const photoUrl = await uploadPhotoIfAny('pharmacies', pharmacyData.photo);
      const payload: any = {
        name: sanitize(pharmacyData.name),
        experience: sanitize(pharmacyData.pharmacyExperience),
        availableTime: sanitize(pharmacyData.availableTime),
        contact: sanitize(pharmacyData.contactNumber),
        photoUrl: photoUrl ?? `https://picsum.photos/seed/newpharm/100/100`,
        registrationNumber: sanitize(pharmacyData.slPharmacyRegistrationNumber),
        licenseNumber: sanitize(pharmacyData.licenseNumberPharmacy),
        rating: null,
        // ownerUid: user.uid, // REMOVED: No longer tied to a user
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const lat = parseNum(pharmacyData.primaryLocationCoordinates?.lat);
      const lng = parseNum(pharmacyData.primaryLocationCoordinates?.lng);
      if (lat !== undefined && lng !== undefined) {
        payload.location = {
          lat,
          lng,
          address: sanitize(pharmacyData.primaryLocationName),
        };
      }

      // CHANGED: Use addDoc to create a new document with a random ID
      const docRef = await addDoc(collection(db, 'pharmacies'), payload);

      // Local optimistic update
      dispatch({
        type: 'ADD_PHARMACY',
        // CHANGED: Use the new docRef.id for the local state
        payload: mapFirestoreToPharmacy(docRef.id, payload),
      });
    } catch (error: any) {
      console.error('Error adding pharmacy to Firestore:', { code: error.code, message: error.message });
      throw error;
    }
  };

  return (
    <ProviderContext.Provider value={{ state, addRegisteredDoctor, addRegisteredPharmacy }}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProviders = () => {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error('useProviders must be used within a ProviderProvider');
  return ctx;
};