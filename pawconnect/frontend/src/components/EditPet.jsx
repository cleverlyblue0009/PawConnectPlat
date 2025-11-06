import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { petsAPI } from '../services/api';
import Loading from './common/Loading';

const EditPet = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isShelter } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    gender: 'male',
    size: 'medium',
    description: '',
    healthInfo: '',
    adoptionFee: '',
    adoptionStatus: 'available',
    city: '',
    state: '',
    characteristics: [],
  });

  const [characteristicInput, setCharacteristicInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isShelter) {
      navigate('/auth?mode=login');
      return;
    }
    loadPetData();
  }, [isAuthenticated, isShelter, petId]);

  const loadPetData = async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getById(petId);
      const pet = response.data;

      // Check if this pet belongs to the current shelter
      if (pet.shelterId !== user.userId) {
        setError('You do not have permission to edit this pet');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      setFormData({
        name: pet.name || '',
        species: pet.species || 'dog',
        breed: pet.breed || '',
        age: pet.age || '',
        gender: pet.gender || 'male',
        size: pet.size || 'medium',
        description: pet.description || '',
        healthInfo: pet.healthInfo || '',
        adoptionFee: pet.adoptionFee || '',
        adoptionStatus: pet.adoptionStatus || 'available',
        city: pet.city || '',
        state: pet.state || '',
        characteristics: pet.characteristics || [],
      });

      setExistingImages(pet.images || []);
    } catch (err) {
      console.error('Error loading pet data:', err);
      setError('Failed to load pet data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length + existingImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addCharacteristic = () => {
    if (characteristicInput.trim() && !formData.characteristics.includes(characteristicInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        characteristics: [...prev.characteristics, characteristicInput.trim()],
      }));
      setCharacteristicInput('');
    }
  };

  const removeCharacteristic = (char) => {
    setFormData((prev) => ({
      ...prev,
      characteristics: prev.characteristics.filter((c) => c !== char),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validation
      if (existingImages.length === 0 && imageFiles.length === 0) {
        setError('Please have at least one image');
        setSubmitting(false);
        return;
      }

      if (!formData.name || !formData.breed || !formData.age) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Create FormData
      const data = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === 'characteristics') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Add existing images
      data.append('existingImages', JSON.stringify(existingImages));

      // Add new images
      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      // Submit to API
      await petsAPI.update(petId, data);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating pet:', err);
      setError(err.message || 'Failed to update pet. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      await petsAPI.delete(petId);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError(err.message || 'Failed to delete pet. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated || !isShelter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-rust hover:text-rust-600 font-medium mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Pet</h1>
            <p className="text-gray-600 mt-2">Update the details for this pet</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-red-500">*</span>
              </label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Current ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-500 mb-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add more images (max {5 - existingImages.length - imageFiles.length} more)
                  </p>
                </label>
              </div>
              
              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Pet's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species <span className="text-red-500">*</span>
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="30"
                  step="0.5"
                  className="input-field"
                  placeholder="Age in years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size <span className="text-red-500">*</span>
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="small">Small (0-20 lbs)</option>
                  <option value="medium">Medium (21-50 lbs)</option>
                  <option value="large">Large (51-100 lbs)</option>
                  <option value="extra-large">Extra Large (100+ lbs)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="input-field"
                placeholder="Tell potential adopters about this pet's personality, habits, and what makes them special..."
              />
            </div>

            {/* Health Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Information
              </label>
              <textarea
                name="healthInfo"
                value={formData.healthInfo}
                onChange={handleInputChange}
                rows="3"
                className="input-field"
                placeholder="Vaccination status, medical history, special needs..."
              />
            </div>

            {/* Characteristics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Characteristics
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={characteristicInput}
                  onChange={(e) => setCharacteristicInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCharacteristic();
                    }
                  }}
                  className="input-field"
                  placeholder="e.g., Friendly, House-trained, Good with kids"
                />
                <button
                  type="button"
                  onClick={addCharacteristic}
                  className="btn-outline px-4"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.characteristics.map((char, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-rust-100 text-rust-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {char}
                    <button
                      type="button"
                      onClick={() => removeCharacteristic(char)}
                      className="text-rust-600 hover:text-rust-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location and Adoption Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adoption Fee ($)
                </label>
                <input
                  type="number"
                  name="adoptionFee"
                  value={formData.adoptionFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adoption Status
                </label>
                <select
                  name="adoptionStatus"
                  value={formData.adoptionStatus}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="adopted">Adopted</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-outline flex-1"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                Delete Pet
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPet;
