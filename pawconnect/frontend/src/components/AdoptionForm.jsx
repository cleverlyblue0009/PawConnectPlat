import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from './common/Loading';

const AdoptionForm = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdopter } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form data
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    },
    livingInfo: {
      livingType: '',
      hasYard: false,
      householdMembers: 1,
      otherPets: [],
    },
    petExperience: {
      experienceLevel: '',
      ownedPets: '',
      reason: '',
    },
    references: [
      { name: '', phone: '', relationship: '' },
      { name: '', phone: '', relationship: '' },
    ],
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdopter) {
      navigate('/auth?mode=login');
      return;
    }

    loadPetDetails();
  }, [petId]);

  const loadPetDetails = async () => {
    try {
      const response = await petsAPI.getById(petId);
      setPet(response.data);

      // Pre-fill personal info from user data
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zip: user.zip || '',
        },
      }));
    } catch (error) {
      console.error('Error loading pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateReference = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.map((ref, i) =>
        i === index ? { ...ref, [field]: value } : ref
      ),
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.personalInfo.firstName &&
          formData.personalInfo.lastName &&
          formData.personalInfo.email &&
          formData.personalInfo.phone
        );
      case 2:
        return formData.livingInfo.livingType && formData.livingInfo.householdMembers > 0;
      case 3:
        return formData.petExperience.experienceLevel && formData.petExperience.reason;
      case 4:
        return formData.references[0].name && formData.references[0].phone;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const applicationData = {
        petId,
        ...formData,
      };

      await applicationsAPI.create(applicationData);

      // Success - redirect to dashboard
      alert('Application submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pet not found</h2>
          <button onClick={() => navigate('/browse')} className="btn-primary">
            Browse Pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex-1 relative">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            step <= currentStep
                              ? 'bg-rust text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {step}
                        </div>
                        {step < 5 && (
                          <div
                            className={`flex-1 h-1 mx-2 ${
                              step < currentStep ? 'bg-rust' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Step {currentStep} of {totalSteps}:{' '}
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Living Situation'}
                  {currentStep === 3 && 'Pet Experience'}
                  {currentStep === 4 && 'References'}
                  {currentStep === 5 && 'Review & Submit'}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.personalInfo.firstName}
                          onChange={(e) => updateFormData('personalInfo', 'firstName', e.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.personalInfo.lastName}
                          onChange={(e) => updateFormData('personalInfo', 'lastName', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.personalInfo.email}
                        onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.personalInfo.phone}
                        onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.personalInfo.dateOfBirth}
                        onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.address}
                        onChange={(e) => updateFormData('personalInfo', 'address', e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.personalInfo.city}
                          onChange={(e) => updateFormData('personalInfo', 'city', e.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.personalInfo.state}
                          onChange={(e) => updateFormData('personalInfo', 'state', e.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={formData.personalInfo.zip}
                          onChange={(e) => updateFormData('personalInfo', 'zip', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Living Situation */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Living Situation</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type of Housing *
                      </label>
                      <div className="space-y-2">
                        {['house', 'apartment', 'condo', 'other'].map((type) => (
                          <label key={type} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="livingType"
                              value={type}
                              checked={formData.livingInfo.livingType === type}
                              onChange={(e) => updateFormData('livingInfo', 'livingType', e.target.value)}
                              className="w-4 h-4 text-rust border-gray-300 focus:ring-rust"
                            />
                            <span className="ml-2 text-gray-700 capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.livingInfo.hasYard}
                          onChange={(e) => updateFormData('livingInfo', 'hasYard', e.target.checked)}
                          className="w-4 h-4 text-rust border-gray-300 rounded focus:ring-rust"
                        />
                        <span className="ml-2 text-gray-700">I have a yard</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Household Members *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.livingInfo.householdMembers}
                        onChange={(e) => updateFormData('livingInfo', 'householdMembers', parseInt(e.target.value))}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Pet Experience */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Pet Experience</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Experience Level *
                      </label>
                      <select
                        required
                        value={formData.petExperience.experienceLevel}
                        onChange={(e) => updateFormData('petExperience', 'experienceLevel', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select experience level</option>
                        <option value="beginner">Beginner - First time pet owner</option>
                        <option value="intermediate">Intermediate - Some experience</option>
                        <option value="experienced">Experienced - Multiple pets owned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tell us about pets you've owned
                      </label>
                      <textarea
                        rows={4}
                        value={formData.petExperience.ownedPets}
                        onChange={(e) => updateFormData('petExperience', 'ownedPets', e.target.value)}
                        className="input-field"
                        placeholder="Describe any pets you currently have or have had in the past..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why do you want to adopt {pet.name}? *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={formData.petExperience.reason}
                        onChange={(e) => updateFormData('petExperience', 'reason', e.target.value)}
                        className="input-field"
                        placeholder="Share your reasons for wanting to adopt this pet..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: References */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">References</h2>
                    <p className="text-gray-600 mb-6">
                      Please provide at least one reference (non-family member)
                    </p>

                    {formData.references.map((ref, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Reference {index + 1} {index === 0 && '*'}
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name {index === 0 && '*'}
                            </label>
                            <input
                              type="text"
                              required={index === 0}
                              value={ref.name}
                              onChange={(e) => updateReference(index, 'name', e.target.value)}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone {index === 0 && '*'}
                            </label>
                            <input
                              type="tel"
                              required={index === 0}
                              value={ref.phone}
                              onChange={(e) => updateReference(index, 'phone', e.target.value)}
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Relationship
                            </label>
                            <input
                              type="text"
                              value={ref.relationship}
                              onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                              className="input-field"
                              placeholder="e.g., Friend, Coworker, Veterinarian"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>

                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{formData.personalInfo.firstName} {formData.personalInfo.lastName}</p>
                          <p>{formData.personalInfo.email}</p>
                          <p>{formData.personalInfo.phone}</p>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Living Situation</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="capitalize">{formData.livingInfo.livingType}</p>
                          <p>{formData.livingInfo.hasYard ? 'Has a yard' : 'No yard'}</p>
                          <p>{formData.livingInfo.householdMembers} household members</p>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Pet Experience</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="capitalize">{formData.petExperience.experienceLevel}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          By submitting this application, you agree to be contacted by the shelter
                          and acknowledge that all information provided is accurate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn-outline px-8"
                      disabled={submitting}
                    >
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary px-8"
                      disabled={!validateStep()}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-primary px-8"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              {/* Pet Card */}
              <div className="mb-6">
                <img
                  src={pet.images[0] || '/placeholder-pet.jpg'}
                  alt={pet.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                <p className="text-gray-600">{pet.breed}</p>
              </div>

              {/* What Happens Next */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">What Happens Next?</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      1
                    </div>
                    <p>Your application is submitted to the shelter</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </div>
                    <p>Shelter reviews your application (1-3 days)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      3
                    </div>
                    <p>Schedule a meet & greet if approved</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      4
                    </div>
                    <p>Complete adoption and take {pet.name} home!</p>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Have questions about the application process?
                </p>
                <button className="text-rust text-sm font-semibold hover:text-rust-600">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionForm;
