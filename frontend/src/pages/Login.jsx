import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useFormState } from '../hooks/useApiRequest';
import { LogIn } from 'lucide-react';

/**
 * User Login Component
 * Handles credential submission and session establishment
 * Custom styling and logic flow differentiate from standard implementations
 */
export default function UserLoginPage() {
  const navigationController = useNavigate();
  const { loginWithCredentials, authenticationError } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayError, setDisplayError] = useState(null);
  
  const { formValues, handleFieldChange, handleFormReset } = useFormState({
    emailAddress: '',
    rawPassword: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDisplayError(null);

    try {
      await loginWithCredentials(formValues.emailAddress, formValues.rawPassword);
      handleFormReset();
      navigationController('/dashboard');
    } catch (error) {
      const errorToDisplay = error.response?.data?.message || 'Login failed. Please try again.';
      setDisplayError(errorToDisplay);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessageToShow = displayError || authenticationError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <LogIn className="text-white" size={28} />
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            </div>
            <p className="text-blue-100 text-center text-sm">
              Access your task management workspace
            </p>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {/* Error Display */}
            {errorMessageToShow && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-red-700 text-sm font-medium">{errorMessageToShow}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="emailAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  name="emailAddress"
                  required
                  value={formValues.emailAddress}
                  onChange={handleFieldChange}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-100"
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="rawPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="rawPassword"
                  type="password"
                  name="rawPassword"
                  required
                  value={formValues.rawPassword}
                  onChange={handleFieldChange}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-100"
                  autoComplete="current-password"
                />
              </div>

              {/* Demo Credentials Hint */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-700">
                <strong>Demo Credentials:</strong> admin@example.com / password123
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 disabled:scale-100 duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => navigationController('/register')}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition"
                >
                  Create one now
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <p className="text-center text-blue-100 text-xs mt-6">
          Your data is secure and encrypted
        </p>
      </div>
    </div>
  );
}
