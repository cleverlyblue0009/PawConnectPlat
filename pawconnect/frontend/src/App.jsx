import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Homepage from './components/Homepage';
import PetBrowse from './components/PetBrowse';
import PetDetails from './components/PetDetails';
import AdoptionForm from './components/AdoptionForm';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';

// Placeholder components for other routes
const About = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="container-custom max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About PawConnect</h1>
        <p className="text-lg text-gray-700 mb-4">
          PawConnect is a platform dedicated to connecting loving families with pets in need of homes.
          We work with shelters and rescue organizations across the country to make pet adoption easier
          and more accessible.
        </p>
        <p className="text-lg text-gray-700">
          Our mission is to save lives by simplifying the adoption process and helping every pet find
          their forever home.
        </p>
      </div>
    </div>
  </div>
);

const Shelters = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="container-custom max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Partner with Us</h1>
        <p className="text-lg text-gray-700 mb-4">
          Are you a shelter or rescue organization? Join PawConnect to reach more potential adopters
          and streamline your adoption process.
        </p>
        <div className="bg-rust-50 border border-rust-200 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-rust mb-3">Benefits for Shelters</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Reach thousands of potential adopters</li>
            <li>✓ Manage applications in one place</li>
            <li>✓ Free listing for verified shelters</li>
            <li>✓ Dedicated support team</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const Contact = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="container-custom max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-700">support@pawconnect.com</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-700">(555) PAW-CONNECT</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
            <p className="text-gray-700">Monday - Friday: 9AM - 6PM EST</p>
            <p className="text-gray-700">Saturday - Sunday: 10AM - 4PM EST</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HowItWorks = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="container-custom max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">How It Works</h1>
        
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="w-12 h-12 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Browse Pets</h3>
              <p className="text-gray-700">
                Search through hundreds of adoptable pets from verified shelters. Use our filters to
                find pets that match your lifestyle and preferences.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create an Account</h3>
              <p className="text-gray-700">
                Sign up as an adopter to save your favorite pets and submit adoption applications
                directly through our platform.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Apply to Adopt</h3>
              <p className="text-gray-700">
                Fill out our simple adoption application. The shelter will review your application
                and contact you within 1-3 business days.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
              4
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Meet Your Pet</h3>
              <p className="text-gray-700">
                If approved, schedule a meet and greet with your potential new family member at the
                shelter.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 bg-rust text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
              5
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Home!</h3>
              <p className="text-gray-700">
                Complete the adoption process and bring your new best friend home. We're here to
                support you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/browse" element={<PetBrowse />} />
              <Route path="/pet/:petId" element={<PetDetails />} />
              <Route path="/apply/:petId" element={<AdoptionForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/shelters" element={<Shelters />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              
              {/* Fallback route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-6">Page not found</p>
                    <a href="/" className="btn-primary">
                      Go Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
