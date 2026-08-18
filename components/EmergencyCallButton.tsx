
import React from 'react';
import { PhoneIcon, EMERGENCY_NUMBER, APP_COLORS } from '../constants';

const EmergencyCallButton: React.FC = () => {
  return (
    <a
      href={`tel:${EMERGENCY_NUMBER}`}
      className="fixed bottom-20 right-4 z-50 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-transform duration-150 ease-in-out hover:scale-105"
      aria-label={`Call Emergency ${EMERGENCY_NUMBER}`}
    >
      <PhoneIcon className="w-6 h-6" />
    </a>
  );
};

export default EmergencyCallButton;
