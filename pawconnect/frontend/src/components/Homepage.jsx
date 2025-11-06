import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { petsAPI } from '../services/api';
import Loading from './common/Loading';

const Homepage = () => {
  const navigate = useNavigate();
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeaturedPets();
  }, []);

  const loadFeaturedPets = async () => {
    try {
      const response = await petsAPI.getFeatured(6);
      setFeaturedPets(response.data || []);
    } catch (error) {
      console.error('Error loading featured pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?query=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rust-50 via-orange-50 to-amber-50 py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connecting Hearts, One Paw at a Time
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Find your perfect companion. Browse thousands of adoptable pets from local shelters
              and rescue organizations.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search by name or breed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rust focus:border-transparent outline-none text-lg"
                />
                <button type="submit" className="btn-primary px-8 text-lg">
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/browse')} className="btn-primary text-lg px-8 py-4">
                Find Your Pet
              </button>
              <button onClick={() => navigate('/how-it-works')} className="btn-secondary text-lg px-8 py-4">
                How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-rust mb-2">12,847</div>
              <div className="text-gray-600 font-medium">Pets Adopted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-rust mb-2">450+</div>
              <div className="text-gray-600 font-medium">Partner Shelters</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-rust mb-2">98%</div>
              <div className="text-gray-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Featured Pets</h2>
            <p className="text-xl text-gray-600">
              These adorable friends are waiting for their forever homes
            </p>
          </div>

          {loading ? (
            <Loading />
          ) : featuredPets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {featuredPets.map((pet) => (
                <div
                  key={pet.petId}
                  className="card-pet"
                  onClick={() => navigate(`/pet/${pet.petId}`)}
                >
                  <div className="relative">
                    <img
                      src={pet.images[0] || '/placeholder-pet.jpg'}
                      alt={pet.name}
                      className="w-full h-64 object-cover"
                    />
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-rust-50 transition-colors">
                      <svg
                        className="w-6 h-6 text-gray-400 hover:text-rust"
                        fill="none"
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
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No featured pets available at the moment.</p>
            </div>
          )}

          <div className="text-center">
            <button onClick={() => navigate('/browse')} className="btn-secondary text-lg px-10 py-4">
              View All Pets
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to find your perfect companion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-rust-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rust">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Pets</h3>
              <p className="text-gray-600">
                Search through hundreds of adoptable pets from verified shelters
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rust-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rust">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Find Your Match</h3>
              <p className="text-gray-600">
                Use filters to find pets that fit your lifestyle and preferences
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rust-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rust">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Apply to Adopt</h3>
              <p className="text-gray-600">
                Submit an application directly through our platform
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-rust-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rust">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome Home</h3>
              <p className="text-gray-600">
                Connect with the shelter and bring your new friend home
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rust to-rust-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Companion?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Thousands of loving pets are waiting for their forever homes. Start your adoption journey
            today!
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="bg-white text-rust px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Browsing Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
