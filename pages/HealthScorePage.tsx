import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import Spinner from '../components/Spinner';
import { HealthFormData, HealthPrediction } from '../types';
import { getHealthPrediction } from '../services/geminiService';
import { APP_COLORS } from '../constants';
import { useUserData } from '../contexts/UserDataContext';

const initialFormData: HealthFormData = {
  age: '',
  height: '',
  weight: '',
  glucose: '',
  hemoglobin: '',
  ldlCholesterol: '',
};

const HealthScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score === 0) { // Reset if score is 0
        setDisplayScore(0);
        return;
    }
    const duration = 1500; // ms
    const increment = score / (duration / 20); // Animate in steps
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.ceil(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [score]);
  
  const getScoreColor = (s: number) => {
    if (s < 40) return 'text-red-500';
    if (s < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="my-8 flex flex-col items-center">
      <div className={`relative w-48 h-48 rounded-full border-8 ${getScoreColor(score).replace('text-','border-')} flex items-center justify-center`}>
        <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {displayScore}
        </span>
        <span className="absolute bottom-4 text-gray-500 text-sm">/ 100</span>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700">Your Health Score</p>
    </div>
  );
};


const HealthScorePage: React.FC = () => {
  const [formData, setFormData] = useState<HealthFormData>(initialFormData);
  const [prediction, setPrediction] = useState<HealthPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addHealthPrediction } = useUserData();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrediction(null); // Clear previous prediction
    
    // Basic validation
    for (const key in formData) {
      if (!formData[key as keyof HealthFormData]) {
        setError(`Please fill in all fields. Missing: ${key}`);
        setIsLoading(false);
        return;
      }
      if (isNaN(parseFloat(formData[key as keyof HealthFormData]))) {
        setError(`Field '${key}' must be a number.`);
        setIsLoading(false);
        return;
      }
    }


    const result = await getHealthPrediction(formData);
    if (result) {
      setPrediction(result);
      addHealthPrediction(result);
    } else {
      setError('Failed to get health prediction. The API might be unavailable or an error occurred.');
    }
    setIsLoading(false);
  };
  
  const inputFields: { name: keyof HealthFormData; label: string; unit: string, placeholder: string }[] = [
    { name: 'age', label: 'Age', unit: 'years', placeholder: 'e.g., 30' },
    { name: 'height', label: 'Height', unit: 'cm', placeholder: 'e.g., 170' },
    { name: 'weight', label: 'Weight', unit: 'kg', placeholder: 'e.g., 70' },
    { name: 'glucose', label: 'Blood Glucose', unit: 'mg/dL', placeholder: 'e.g., 90' },
    { name: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', placeholder: 'e.g., 14' },
    { name: 'ldlCholesterol', label: 'LDL Cholesterol', unit: 'mg/dL', placeholder: 'e.g., 100' },
  ];

  return (
    <PageWrapper title="Health Score Predictor">
      <p className="mb-6 text-gray-600">
        Enter your health metrics below to get an AI-powered health score prediction and insights.
        This is not medical advice. Consult a doctor for health concerns.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        {inputFields.map(field => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
              {field.label} ({field.unit})
            </label>
            <input
              type="number"
              name={field.name}
              id={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-calm-blue-primary focus:border-calm-blue-primary sm:text-sm"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: APP_COLORS.primary }}
          className="w-full text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? <Spinner size="sm" color="text-white"/> : 'Calculate My Score'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500 bg-red-100 p-3 rounded-md text-center">{error}</p>}

      {prediction && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-calm-blue-accent mb-4 text-center">Your Health Insights</h2>
          <HealthScoreDisplay score={prediction.healthScore} />
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Potential Diseases (Next 3 Months):</h3>
            {prediction.potentialDiseases.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {prediction.potentialDiseases.map((disease, index) => <li key={index}>{disease}</li>)}
              </ul>
            ) : <p className="text-gray-600">No specific potential diseases highlighted based on current data. Maintain a healthy lifestyle!</p>}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Prevention Tips:</h3>
             {prediction.preventionTips.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {prediction.preventionTips.map((tip, index) => <li key={index}>{tip}</li>)}
              </ul>
             ) : <p className="text-gray-600">Keep up the good work and focus on balanced nutrition and regular exercise!</p>}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default HealthScorePage;