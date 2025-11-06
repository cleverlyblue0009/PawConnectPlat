import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, petsAPI, usersAPI } from '../services/api';
import Loading from './common/Loading';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdopter, isShelter } = useAuth();

  const [applications, setApplications] = useState([]);
  const [favoritePets, setFavoritePets] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdopter) {
        // Load applications and favorites for adopters
        const [appsResponse, favsResponse] = await Promise.all([
          applicationsAPI.getByUser(user.userId),
          usersAPI.getFavoritePets(),
        ]);
        setApplications(appsResponse.data || []);
        setFavoritePets(favsResponse.data || []);
      }

      if (isShelter) {
        // Load applications and pets for shelters
        const [appsResponse, petsResponse] = await Promise.all([
          applicationsAPI.getByShelter(user.userId),
          petsAPI.getByShelter(user.userId),
        ]);
        setApplications(appsResponse.data || []);
        setMyPets(petsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-700',
      under_review: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600">
                {isAdopter && 'Manage your adoption applications and favorite pets'}
                {isShelter && 'Manage your shelter pets and adoption applications'}
              </p>
            </div>
            <div className="flex gap-3">
              {isShelter && (
                <button
                  onClick={() => navigate('/add-pet')}
                  className="btn-primary"
                >
                  + Add New Pet
                </button>
              )}
              <button
                onClick={() => navigate('/profile')}
                className="btn-outline"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  {isAdopter ? 'Applications' : 'Total Pets'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {isAdopter ? applications.length : myPets.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-rust-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  {isAdopter ? 'Favorites' : 'Applications'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {isAdopter ? favoritePets.length : applications.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-rust-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-rust" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-rust-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-8 py-4 font-semibold transition-colors ${
                  activeTab === 'applications'
                    ? 'text-rust border-b-2 border-rust'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Applications ({applications.length})
              </button>
              {isAdopter && (
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-8 py-4 font-semibold transition-colors ${
                    activeTab === 'favorites'
                      ? 'text-rust border-b-2 border-rust'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Favorites ({favoritePets.length})
                </button>
              )}
              {isShelter && (
                <button
                  onClick={() => setActiveTab('pets')}
                  className={`px-8 py-4 font-semibold transition-colors ${
                    activeTab === 'pets'
                      ? 'text-rust border-b-2 border-rust'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Pets ({myPets.length})
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <div
                      key={application.applicationId}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/application/${application.applicationId}`)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          {application.pet && (
                            <img
                              src={application.pet.images[0]}
                              alt={application.pet.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {application.pet?.name || 'Pet'}
                            </h3>
                            <p className="text-gray-600">{application.pet?.breed}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Applied on {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`badge ${getStatusColor(application.status)}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </div>
                      {isShelter && application.applicant && (
                        <div className="text-sm text-gray-600">
                          <p>Applicant: {application.applicant.firstName} {application.applicant.lastName}</p>
                          <p>Email: {application.applicant.email}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-6">
                      {isAdopter
                        ? "You haven't applied for any pets yet. Start browsing to find your perfect match!"
                        : "No applications have been submitted for your pets yet."}
                    </p>
                    {isAdopter && (
                      <button onClick={() => navigate('/browse')} className="btn-primary">
                        Browse Pets
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && isAdopter && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritePets.length > 0 ? (
                  favoritePets.map((pet) => (
                    <div
                      key={pet.petId}
                      className="card-pet"
                      onClick={() => navigate(`/pet/${pet.petId}`)}
                    >
                      <img
                        src={pet.images[0]}
                        alt={pet.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                        <p className="text-gray-600 text-sm">{pet.breed}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {pet.city}, {pet.state} • {pet.age} years
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start adding pets to your favorites to keep track of them!
                    </p>
                    <button onClick={() => navigate('/browse')} className="btn-primary">
                      Browse Pets
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* My Pets Tab */}
            {activeTab === 'pets' && isShelter && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPets.length > 0 ? (
                  myPets.map((pet) => (
                    <div key={pet.petId} className="card rounded-lg overflow-hidden">
                      <img
                        src={pet.images[0]}
                        alt={pet.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                            <p className="text-gray-600 text-sm">{pet.breed}</p>
                          </div>
                          <span className={`badge badge-${pet.adoptionStatus}`}>
                            {pet.adoptionStatus}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => navigate(`/pet/${pet.petId}`)}
                            className="btn-outline flex-1 text-sm py-2"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/edit-pet/${pet.petId}`)}
                            className="btn-primary flex-1 text-sm py-2"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🐾</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No pets listed yet</h3>
                    <p className="text-gray-600 mb-6">
                      Add your first pet to start receiving adoption applications!
                    </p>
                    <button onClick={() => navigate('/add-pet')} className="btn-primary">
                      Add New Pet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
