import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import JobManagement from '@/pages/JobManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// The fixed hash for admin access
const ADMIN_HASH = 'roKob5Vo22';

export default function ProtectedJobManagement() {
  const [hash, setHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if hash exists in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlHash = params.get('hash');
    
    if (urlHash) {
      setHash(urlHash);
      verifyHash(urlHash);
    }
  }, [location.search]);

  // Check hash in localStorage on mount
  useEffect(() => {
    const savedHash = localStorage.getItem('adminHash');
    if (savedHash === ADMIN_HASH) {
      setIsAuthorized(true);
    }
  }, []);

  const verifyHash = (hashToVerify: string) => {
    setIsVerifying(true);
    
    // Check against our fixed hash
    if (hashToVerify === ADMIN_HASH) {
      // Save to localStorage for future visits
      localStorage.setItem('adminHash', ADMIN_HASH);
      setIsAuthorized(true);
    } else {
      // If incorrect hash, redirect to home
      navigate('/');
    }
    
    setIsVerifying(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyHash(hash);
  };

  // Render the protected content if authorized
  if (isAuthorized) {
    return <JobManagement />;
  }

  // Otherwise, show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Enter access code"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="w-full"
                type="password"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isVerifying || !hash.trim()}
            >
              {isVerifying ? 'Verifying...' : 'Access'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
