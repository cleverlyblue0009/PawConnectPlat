import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { petsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from './common/Loading';

const PetBrowse = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Filter states
  const [filters, setFilters] = useState({
    query: '',
    species: [],
    gender: '',
    minAge: 0,
    maxAge: 15,
    size: '',
    city: '',
    state: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 20,
    offset: 0,
  });

  // Load pets when filters change
  useEffect(() => {
    loadPets();
  }, [filters]);

  // Load favorites on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadPets = async () => {
    try {
      setLoading(true);
      
      // Build params object - only include species if selected
      const params = {
        query: filters.query || undefined,
        species: filters.species.length > 0 ? filters.species[0] : undefined, // DynamoDB only supports single species filter
        gender: filters.gender || undefined,
        minAge: filters.minAge > 0 ? filters.minAge : undefined,
        maxAge: filters.maxAge < 15 ? filters.maxAge : undefined,
        size: filters.size || undefined,
        city: filters.city || undefined,
        state: filters.state || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: filters.limit,
        offset: filters.offset,
      };

      console.log('📤 Fetching pets with params:', params);
      
      const response = await petsAPI.getAll(params);
      
      console.log('📥 API Response:', response);
      
      setPets(response.pets || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('❌ Error loading pets:', error);
      setPets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await usersAPI.getFavorites();
      setFavorites(response.favorites || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset pagination
    }));
  };

  const handleSpeciesToggle = (species) => {
    // For now, only allow single species selection
    setFilters((prev) => ({
      ...prev,
      species: prev.species.includes(species) ? [] : [species],
      offset: 0,
    }));
  };

  const toggleFavorite = async (petId, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }

    try {
      if (favorites.includes(petId)) {
        await usersAPI.removeFavorite(petId);
        setFavorites((prev) => prev.filter((id) => id !== petId));
      } else {
        await usersAPI.addFavorite(petId);
        setFavorites((prev) => [...prev, petId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      species: [],
      gender: '',
      minAge: 0,
      maxAge: 15,
      size: '',
      city: '',
      state: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 20,
      offset: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 hidden lg:block">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-amber-700 hover:text-amber-900 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Name or breed..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                />
              </div>

              {/* Species */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Species
                </label>
                <div className="space-y-2">
                  {['dog', 'cat', 'other'].map((species) => (
                    <label key={species} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.species.includes(species)}
                        onChange={() => handleSpeciesToggle(species)}
                        className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-700"
                      />
                      <span className="ml-2 text-gray-700 capitalize">{species}s</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender
                </label>
                <div className="space-y-2">
                  {['', 'male', 'female'].map((gender) => (
                    <label key={gender || 'any'} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={filters.gender === gender}
                        onChange={() => handleFilterChange('gender', gender)}
                        className="w-4 h-4 text-amber-700 border-gray-300 focus:ring-amber-700"
                      />
                      <span className="ml-2 text-gray-700 capitalize">
                        {gender || 'Any'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range: {filters.minAge} - {filters.maxAge}+ years
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={filters.minAge}
                    onChange={(e) => handleFilterChange('minAge', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={filters.maxAge}
                    onChange={(e) => handleFilterChange('maxAge', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Size
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                >
                  <option value="">Any Size</option>
                  <option value="small">Small (0-25 lbs)</option>
                  <option value="medium">Medium (26-60 lbs)</option>
                  <option value="large">Large (61-100 lbs)</option>
                  <option value="extra-large">Extra Large (100+ lbs)</option>
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Pet</h1>
                  <p className="text-gray-600">
                    {total} {total === 1 ? 'pet' : 'pets'} available for adoption
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="age-asc">Age: Low to High</option>
                    <option value="age-desc">Age: High to Low</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${
                        viewMode === 'grid' ? 'bg-amber-700 text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${
                        viewMode === 'list' ? 'bg-amber-700 text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pet Grid/List */}
            {loading ? (
              <Loading />
            ) : pets.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {pets.map((pet) => (
                  <div
                    key={pet.petId}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/pet/${pet.petId}`)}
                  >
                    <div className="relative">
                      <img
                        src={pet.images?.[0] || '/placeholder-pet.jpg'}
                        alt={pet.name}
                        className={viewMode === 'grid' ? 'w-full h-64 object-cover' : 'w-full h-48 object-cover'}
                      />
                      <button
                        onClick={(e) => toggleFavorite(pet.petId, e)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          className={`w-6 h-6 ${
                            favorites.includes(pet.petId) ? 'text-red-500 fill-current' : 'text-gray-400'
                          }`}
                          fill={favorites.includes(pet.petId) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                          <p className="text-gray-600">{pet.breed}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            pet.gender === 'male'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {pet.gender === 'male' ? '♂' : '♀'} {pet.gender}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          {pet.city}, {pet.state}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{pet.age} years old</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pet.characteristics?.slice(0, 3).map((char, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                      <button className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition-colors font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No pets found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button onClick={clearFilters} className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition-colors">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pets.length > 0 && total > filters.limit && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handleFilterChange('offset', Math.max(0, filters.offset - filters.limit))}
                  disabled={filters.offset === 0}
                  className="px-6 py-2 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {Math.floor(filters.offset / filters.limit) + 1} of{' '}
                  {Math.ceil(total / filters.limit)}
                </span>
                <button
                  onClick={() => handleFilterChange('offset', filters.offset + filters.limit)}
                  disabled={filters.offset + filters.limit >= total}
                  className="px-6 py-2 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetBrowse;