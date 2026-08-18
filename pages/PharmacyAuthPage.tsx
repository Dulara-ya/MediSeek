import React, { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { LOGO_URL_WITH_TEXT, APP_COLORS } from "../constants";
import { PharmacyRegistrationData, ProviderLoginData } from "../types";
import { Link } from "react-router-dom";
import LocationSelectorMap from "../components/LocationSelectorMap";
import { useProviders } from "../contexts/ProviderContext";

const initialPharmacyFormData: PharmacyRegistrationData = {
  email: "",
  password: "",
  name: "",
  pharmacyExperience: "",
  slPharmacyRegistrationNumber: "",
  businessRegistrationNumber: "",
  licenseNumberPharmacy: "",
  photo: null,
  availableTime: "",
  contactNumber: "",
  primaryLocationName: "",
  primaryLocationCoordinates: null,
};

const PharmacyAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<PharmacyRegistrationData>(initialPharmacyFormData);
  const [loginData, setLoginData] = useState<ProviderLoginData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addRegisteredPharmacy } = useProviders();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFormData((prev) => ({ ...prev, photo: f }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setFormData((prev) => ({ ...prev, primaryLocationCoordinates: location }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isLogin) {
      if (loginData.email && loginData.password) {
        // Mock login – replace with real auth flow as needed
        setSuccess(`Mock Pharmacy login successful for ${loginData.email}. In a real app, you would be redirected.`);
      } else {
        setError("Please enter email and password for login.");
      }
      return;
    }

    // Registration path
    const requiredFields: (keyof PharmacyRegistrationData)[] = [
      "name",
      "email",
      "password",
      "slPharmacyRegistrationNumber",
      "businessRegistrationNumber",
      "contactNumber",
      "availableTime",
      "primaryLocationName",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        const label = String(field).replace(/([A-Z])/g, " $1").toLowerCase();
        setError(`Please fill in all required fields. Missing: ${label}`);
        return;
      }
    }
    if (!formData.primaryLocationCoordinates) {
      setError("Please select your pharmacy location on the map.");
      return;
    }

    try {
      await addRegisteredPharmacy(formData);
      setSuccess(`Pharmacy ${formData.name} registered successfully! You can now find it on the map.`);
      setFormData(initialPharmacyFormData); // reset
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsLogin((v) => !v);
    setError(null);
    setSuccess(null);
    setFormData(initialPharmacyFormData);
    setLoginData({ email: "", password: "" });
  };

  const commonFields = (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={isLogin ? loginData.email : formData.email}
          onChange={handleInputChange}
          className="input-style"
          required
          autoComplete="email"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={isLogin ? loginData.password : formData.password}
          onChange={handleInputChange}
          className="input-style"
          required
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </div>
    </>
  );

  const registrationFields = (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Pharmacy Name
        </label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="input-style" required />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pharmacyExperience">
          Experience (e.g., years in business, services offered)
        </label>
        <textarea
          name="pharmacyExperience"
          id="pharmacyExperience"
          value={formData.pharmacyExperience}
          onChange={handleInputChange}
          className="input-style h-20"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slPharmacyRegistrationNumber">
          Sri Lankan Pharmacy Registration Number
        </label>
        <input
          type="text"
          name="slPharmacyRegistrationNumber"
          id="slPharmacyRegistrationNumber"
          value={formData.slPharmacyRegistrationNumber}
          onChange={handleInputChange}
          className="input-style"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessRegistrationNumber">
          Business Registration Number
        </label>
        <input
          type="text"
          name="businessRegistrationNumber"
          id="businessRegistrationNumber"
          value={formData.businessRegistrationNumber}
          onChange={handleInputChange}
          className="input-style"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="licenseNumberPharmacy">
          Pharmacy License Number
        </label>
        <input
          type="text"
          name="licenseNumberPharmacy"
          id="licenseNumberPharmacy"
          value={formData.licenseNumberPharmacy}
          onChange={handleInputChange}
          className="input-style"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photo">
          Pharmacy Photo/Logo (Mock)
        </label>
        <input type="file" name="photo" id="photo" onChange={handleFileChange} className="input-style" accept="image/*" />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="availableTime">
          Available Time (e.g., Mon–Sat 8am–10pm, Sun 9am–6pm)
        </label>
        <input
          type="text"
          name="availableTime"
          id="availableTime"
          value={formData.availableTime}
          onChange={handleInputChange}
          className="input-style"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
          WhatsApp or Contactable Number
        </label>
        <input
          type="tel"
          name="contactNumber"
          id="contactNumber"
          value={formData.contactNumber}
          onChange={handleInputChange}
          className="input-style"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="primaryLocationName">
          Pharmacy Location Name
        </label>
        <input
          type="text"
          name="primaryLocationName"
          id="primaryLocationName"
          value={formData.primaryLocationName}
          onChange={handleInputChange}
          className="input-style"
          placeholder="e.g., Central Pharmacy, HealthHub Mart"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Select Pharmacy Location on Map</label>

        {/* UPDATED: match LocationSelectorMap's props (value + onChange) */}
        <LocationSelectorMap value={formData.primaryLocationCoordinates} onChange={handleLocationSelect} />

        {formData.primaryLocationCoordinates && (
          <p className="text-xs text-gray-600 mt-1">
            Selected: Lat: {formData.primaryLocationCoordinates.lat.toFixed(4)}, Lng:{" "}
            {formData.primaryLocationCoordinates.lng.toFixed(4)}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">Click on the map to place or move the marker for your pharmacy location.</p>
      </div>
    </>
  );

  return (
    <PageWrapper title={isLogin ? "Pharmacy Login" : "Pharmacy Registration"} className="flex flex-col items-center justify-center min-h-screen">
      <style>
        {`.input-style { shadow: appearance-none; border-radius: 0.25rem; width: 100%; padding: 0.5rem 0.75rem; color: #333; line-height: 1.5; border: 1px solid #ccc; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; } .input-style:focus { outline:0; border-color: ${APP_COLORS.primary}; box-shadow: 0 0 0 0.2rem rgba(74, 144, 226, 0.25); }`}
      </style>

      <Link to="/">
        <img src={LOGO_URL_WITH_TEXT} alt="MediSeek Logo" className="w-48 mb-8" />
      </Link>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 w-full max-w-lg text-center">{error}</p>}
      {success && <p className="text-green-500 bg-green-100 p-3 rounded mb-4 w-full max-w-lg text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        {commonFields}
        {!isLogin && registrationFields}

        <div className="flex items-center justify-between mb-6">
          <button
            type="submit"
            style={{ backgroundColor: APP_COLORS.primary }}
            className="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:opacity-90"
          >
            {isLogin ? "Login" : "Register"}
          </button>

          <button
            type="button"
            onClick={toggleMode}
            className="inline-block align-baseline font-bold text-sm text-mediseek-primary hover:text-mediseek-primary/80"
          >
            {isLogin ? "Create Pharmacy Account" : "Already have an account? Login"}
          </button>
        </div>
      </form>

      <p className="text-center text-gray-500 text-xs mt-6">
        <Link to="/auth" className="hover:underline">
          Are you a patient user?
        </Link>{" "}
        |{" "}
        <Link to="/doctor-auth" className="hover:underline">
          Doctor Login/Registration
        </Link>
      </p>
    </PageWrapper>
  );
};

export default PharmacyAuthPage;
