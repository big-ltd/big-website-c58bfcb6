
import { useEffect } from 'react';

const AccountDeletionRedirect = () => {
  useEffect(() => {
    // Redirect to mailto link immediately when component mounts
    window.location.href = 'mailto:support@big.com.cy?subject=Account%20Deletion%20Request';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Account Deletion Request</h1>
        <p className="text-gray-600 mb-4">
          Redirecting you to your email client to send a deletion request...
        </p>
        <p className="text-sm text-gray-500">
          If the redirect doesn't work, please email us at:{' '}
          <a 
            href="mailto:support@big.com.cy?subject=Account%20Deletion%20Request"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            support@big.com.cy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AccountDeletionRedirect;
