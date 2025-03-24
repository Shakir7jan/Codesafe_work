import React from 'react';
import { useLocation } from 'wouter';
import { ScanDetailReport } from '@/components/dashboard';
import { Helmet } from 'react-helmet';

interface ScanReportProps {
  scanId: number;
}

const ScanReport: React.FC<ScanReportProps> = ({ scanId }) => {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/dashboard/scans');
  };

  return (
    <div className="min-h-screen bg-primary-dark text-gray-100 font-sans antialiased">
      <Helmet>
        <title>Scan Report | CodeSafe AI</title>
        <meta name="description" content="Detailed security scan report with vulnerabilities and remediation guidance" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <ScanDetailReport scanId={scanId} onBack={handleBack} />
      </div>
    </div>
  );
};

export default ScanReport; 