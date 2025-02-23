import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const RegistrationSuccess: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center py-32 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-purple-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Registration Successful!
        </h1>
        
        <p className="text-gray-300 mb-8">
          Thank you for registering for the BGMI tournament. We have received your application and 
          will send you a confirmation email with further details shortly.
        </p>
        
        <div className="space-y-4">
          <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Next Steps</h2>
            <ul className="text-gray-300 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">1.</span>
                <span>Check your email for the confirmation message</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">2.</span>
                <span>Join our Discord server for tournament updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">3.</span>
                <span>Review the tournament schedule and rules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">4.</span>
                <span>Prepare your team and equipment for the tournament</span>
              </li>
            </ul>
          </div>
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 
            rounded-lg text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSuccess;