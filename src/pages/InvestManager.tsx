
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import SlideUploader from '@/components/investor/SlideUploader';
import SlidePreview from '@/components/investor/SlidePreview';
import AddInvestorForm from '@/components/investor/AddInvestorForm';
import InvestorHashTable from '@/components/investor/InvestorHashTable';
import { useSlideManagement } from '@/hooks/useSlideManagement';
import { useInvestorHashCodes } from '@/hooks/useInvestorHashCodes';

const ADMIN_HASH = "adminSecretHash123";

const InvestHashCodes = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    currentSlides,
    uploadLoading,
    storageError,
    checkCurrentSlides,
    handleFileUpload,
    handleClearAllSlides,
    handleDeleteSlide,
    handleMoveSlide,
    handleRefreshCache,
    handleDownloadAllSlides
  } = useSlideManagement();

  const {
    hashCodes,
    fetchHashCodes,
    addInvestor
  } = useInvestorHashCodes();

  useEffect(() => {
    const hash = searchParams.get('hash');
    if (hash === ADMIN_HASH) {
      setIsAuthorized(true);
      fetchHashCodes();
      checkCurrentSlides();
    } else {
      setIsAuthorized(false);
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-white text-xl font-semibold">Verifying access...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-gradient-primary">
            <h1 className="text-2xl font-bold text-white">Investor Hash Codes Management</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl text-white mb-4">Upload Investor Slides</h2>
              <SlideUploader 
                currentSlides={currentSlides}
                uploadLoading={uploadLoading}
                onFileUpload={handleFileUpload}
                onClearAllSlides={() => handleClearAllSlides(true)}
                onRefreshCache={handleRefreshCache}
                onDownloadAllSlides={handleDownloadAllSlides}
                hasError={storageError}
              />
              
              <SlidePreview 
                slides={currentSlides}
                uploadLoading={uploadLoading}
                onMoveSlide={handleMoveSlide}
                onDeleteSlide={handleDeleteSlide}
              />
            </div>

            <AddInvestorForm onAddInvestor={addInvestor} />

            <div>
              <h2 className="text-xl text-white mb-4">Existing Hash Codes</h2>
              <InvestorHashTable hashCodes={hashCodes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestHashCodes;
