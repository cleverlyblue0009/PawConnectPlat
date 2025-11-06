import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petsAPI, usersAPI, sheltersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from './common/Loading';

const PetDetails = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdopter, user } = useAuth();

  const [pet, setPet] = useState(null);
  const [shelter, setShelter] = useState(null);
  const [similarPets, setSimilarPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadPetDetails();
  }, [petId]);

  const loadPetDetails = async () => {
    try {
      setLoading(true);

      // Load pet details
      const petResponse = await petsAPI.getById(petId);
      setPet(petResponse.data);

      // Load shelter info
      const shelterResponse = await sheltersAPI.getById(petResponse.data.shelterId);
      setShelter(shelterResponse.data);

      // Load similar pets
      const similarResponse = await petsAPI.getSimilar(petId);
      setSimilarPets(similarResponse.data || []);

      // Check if favorited
      if (isAuthenticated) {
        const favoritesResponse = await usersAPI.getFavorites();
        setIsFavorited(favoritesResponse.data.includes(petId));
      }
    } catch (error) {
      console.error('Error loading pet details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }

    try {
      if (isFavorited) {
        await usersAPI.removeFavorite(petId);
        setIsFavorited(false);
      } else {
        await usersAPI.addFavorite(petId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }
    if (!isAdopter) {
      alert('Only adopters can apply for pets. Please register as an adopter.');
      return;
    }
    navigate(`/apply/${petId}`);
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
      <div className="container-custom">
        {/* Main Pet Details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Image Gallery - Left Side (60%) */}
            <div className="lg:col-span-3 bg-gray-100">
              {/* Main Image */}
              <div className="relative aspect-square lg:aspect-[4/3]">
                <img
                  src={pet.images[selectedImage] || '/placeholder-pet.jpg'}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Carousel */}
              {pet.images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-2 p-4 bg-white">
                  {pet.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-4 ring-rust' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={image} alt={`${pet.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pet Info - Right Side (40%) */}
            <div className="lg:col-span-2 p-8">
              {/* Header with actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{pet.name}</h1>
                  <p className="text-xl text-gray-600">{pet.breed}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isFavorited
                        ? 'bg-rust border-rust text-white'
                        : 'bg-white border-gray-300 text-gray-400 hover:border-rust hover:text-rust'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-gray-300 text-gray-400 hover:border-rust hover:text-rust transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rust-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-semibold text-gray-900">{pet.age} years</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rust-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-semibold text-gray-900">{pet.weight} lbs</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rust-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-rust">
                      {pet.gender === 'male' ? '♂' : '♀'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold text-gray-900 capitalize">{pet.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rust-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-rust" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      {pet.city}, {pet.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* Characteristics */}
              {pet.characteristics && pet.characteristics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Characteristics</h3>
                  <div className="flex flex-wrap gap-2">
                    {pet.characteristics.map((char, idx) => (
                      <span key={idx} className="badge bg-rust-100 text-rust-700">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shelter Info */}
              {shelter && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Listed by</p>
                  <p className="font-semibold text-gray-900">{shelter.shelterName || `${shelter.firstName} ${shelter.lastName}`}</p>
                </div>
              )}

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`badge badge-${pet.adoptionStatus}`}>
                  {pet.adoptionStatus === 'available' && '✓ Available'}
                  {pet.adoptionStatus === 'pending' && '⏳ Pending'}
                  {pet.adoptionStatus === 'adopted' && '🏠 Adopted'}
                </span>
              </div>

              {/* Action Buttons */}
              {pet.adoptionStatus === 'available' && (
                <div className="space-y-3">
                  <button onClick={handleApply} className="btn-primary w-full text-lg py-4">
                    Apply to Adopt
                  </button>
                  <button className="btn-secondary w-full text-lg py-4">
                    Contact Shelter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description & Adoption Process */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {pet.name}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{pet.description}</p>
            </div>
          </div>

          {/* Adoption Process */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Adoption Process</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Submit Application</h4>
                    <p className="text-sm text-gray-600">Fill out our adoption application form</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Shelter Review</h4>
                    <p className="text-sm text-gray-600">The shelter will review your application</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Meet & Greet</h4>
                    <p className="text-sm text-gray-600">Schedule a visit to meet {pet.name}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Take Home</h4>
                    <p className="text-sm text-gray-600">Complete adoption and bring {pet.name} home!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Pets */}
        {similarPets.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Pets You Might Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarPets.map((similarPet) => (
                <div
                  key={similarPet.petId}
                  className="card-pet"
                  onClick={() => navigate(`/pet/${similarPet.petId}`)}
                >
                  <div className="relative">
                    <img
                      src={similarPet.images[0] || '/placeholder-pet.jpg'}
                      alt={similarPet.name}
                      className="w-full h-48 object-cover"
                    />
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{similarPet.name}</h3>
                        <p className="text-gray-600 text-sm">{similarPet.breed}</p>
                      </div>
                      <span className={`badge ${similarPet.gender === 'male' ? 'badge-male' : 'badge-female'}`}>
                        {similarPet.gender === 'male' ? '♂' : '♀'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span>{similarPet.age} years</span>
                      <span className="mx-2">•</span>
                      <span>{similarPet.city}, {similarPet.state}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {similarPet.characteristics?.slice(0, 2).map((char, idx) => (
                        <span key={idx} className="px-2 py-1 bg-rust-100 text-rust-700 rounded-full text-xs">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetDetails;
