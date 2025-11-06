import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { petsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from './common/Loading';

const PetBrowse = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Filter states
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
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

  useEffect(() => {
    loadPets();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [filters]);

  const loadPets = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        species: filters.species.length > 0 ? filters.species.join(',') : undefined,
      };

      const response = await petsAPI.getAll(params);
      setPets(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await usersAPI.getFavorites();
      setFavorites(response.data || []);
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
    setFilters((prev) => {
      const newSpecies = prev.species.includes(species)
        ? prev.species.filter((s) => s !== species)
        : [...prev.species, species];
      return { ...prev, species: newSpecies, offset: 0 };
    });
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
      <div className="container-custom">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 hidden lg:block">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-rust hover:text-rust-600 font-medium"
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
                  className="input-field"
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
                        className="w-4 h-4 text-rust border-gray-300 rounded focus:ring-rust"
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
                        className="w-4 h-4 text-rust border-gray-300 focus:ring-rust"
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
                  className="input-field"
                >
                  <option value="">Any Size</option>
                  <option value="small">Small (0-20 lbs)</option>
                  <option value="medium">Medium (21-50 lbs)</option>
                  <option value="large">Large (51-100 lbs)</option>
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
                  className="input-field"
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
                  className="input-field"
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
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none"
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
                        viewMode === 'grid' ? 'bg-rust text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${
                        viewMode === 'list' ? 'bg-rust text-white' : 'bg-white text-gray-600'
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
                    className="card-pet"
                    onClick={() => navigate(`/pet/${pet.petId}`)}
                  >
                    <div className="relative">
                      <img
                        src={pet.images[0] || '/placeholder-pet.jpg'}
                        alt={pet.name}
                        className={viewMode === 'grid' ? 'w-full h-64 object-cover' : 'w-full h-48 object-cover'}
                      />
                      <button
                        onClick={(e) => toggleFavorite(pet.petId, e)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-rust-50 transition-colors"
                      >
                        <svg
                          className={`w-6 h-6 ${
                            favorites.includes(pet.petId) ? 'text-rust fill-current' : 'text-gray-400'
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
                          className={`badge ${
                            pet.gender === 'male' ? 'badge-male' : 'badge-female'
                          }`}
                        >
                          {pet.gender === 'male' ? '♂' : '♀'} {pet.gender}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm">
                          {pet.city}, {pet.state}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-sm">{pet.age} years old</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pet.characteristics?.slice(0, 3).map((char, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-rust-100 text-rust-700 rounded-full text-xs font-medium"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                      <button className="btn-primary w-full">View Details</button>
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
                <button onClick={clearFilters} className="btn-primary">
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
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
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
