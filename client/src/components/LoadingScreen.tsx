import { Shield } from 'lucide-react';
import GridBackground from './GridBackground';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-dark text-gray-100">
      <div className="absolute inset-0 bg-radial-gradient-accent-blue opacity-20" />
      <GridBackground opacity={0.3} gridSize={30} />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-pulse flex flex-col items-center">
          <Shield className="h-16 w-16 text-accent-blue mb-4" />
          <div className="text-2xl font-bold blue-gradient-text">SecureScanAI</div>
        </div>
        
        <div className="mt-8 flex flex-col items-center">
          <div className="relative w-48 h-1 bg-primary-medium/50 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-accent-blue rounded-full animate-loading"></div>
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
} 