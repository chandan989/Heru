import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, X, CheckCircle, AlertTriangle, Search, RefreshCw } from 'lucide-react';

interface VerificationResult {
  isValid: boolean;
  batch?: {
    batchNumber: string;
    tokenId: string;
    productName: string;
    manufacturingDate: string;
    expiryDate: string;
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    manufacturerDid: string;
  };
  message: string;
}

interface QRScannerProps {
  onScanResult?: (result: VerificationResult) => void;
  className?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanResult, className }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<VerificationResult | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Demo batch data for verification
  const demoBatches = [
    {
      batchNumber: 'BATCH_001',
      tokenId: '0.0.12345',
      productName: 'Insulin Pen',
      manufacturingDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'VERIFIED' as const,
      manufacturerDid: 'did:hedera:testnet:manufacturer1'
    },
    {
      batchNumber: 'BATCH_002',
      tokenId: '0.0.12346',
      productName: 'COVID-19 Vaccine',
      manufacturingDate: '2024-02-01',
      expiryDate: '2024-08-01',
      status: 'PENDING' as const,
      manufacturerDid: 'did:hedera:testnet:manufacturer2'
    }
  ];

  // Start camera for QR scanning
  const startScanning = async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        
        // Start QR scanning loop
        scanForQR();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Simple QR code detection (in real implementation, use a proper QR library)
  const scanForQR = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context && video.videoWidth > 0 && video.videoHeight > 0) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // In a real implementation, you would use a QR detection library here
      // For demo purposes, we'll simulate QR detection after 3 seconds
      setTimeout(() => {
        if (isScanning) {
          // Simulate finding a QR code with batch info
          const simulatedQRData = 'BATCH_001'; // or JSON.stringify(batch data)
          handleQRDetected(simulatedQRData);
        }
      }, 3000);
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanForQR);
    }
  };

  // Handle QR code detection
  const handleQRDetected = (qrData: string) => {
    stopScanning();
    verifyBatch(qrData);
  };

  // Verify batch from QR data or manual input
  const verifyBatch = async (identifier: string) => {
    setIsVerifying(true);
    setScanResult(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find batch in demo data
      const batch = demoBatches.find(b => 
        b.batchNumber === identifier || 
        b.tokenId === identifier ||
        identifier.includes(b.batchNumber)
      );

      if (batch) {
        // Check if batch is expired
        const isExpired = new Date(batch.expiryDate) < new Date();
        
        const result: VerificationResult = {
          isValid: !isExpired && batch.status === 'VERIFIED',
          batch,
          message: isExpired 
            ? 'Medicine batch has expired'
            : batch.status === 'VERIFIED' 
              ? 'Medicine batch verified successfully'
              : 'Medicine batch verification pending'
        };

        setScanResult(result);
        onScanResult?.(result);
      } else {
        const result: VerificationResult = {
          isValid: false,
          message: 'Medicine batch not found or invalid'
        };
        setScanResult(result);
        onScanResult?.(result);
      }
    } catch (error) {
      console.error('Verification error:', error);
      const result: VerificationResult = {
        isValid: false,
        message: 'Verification failed. Please try again.'
      };
      setScanResult(result);
      onScanResult?.(result);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle manual verification
  const handleManualVerification = () => {
    if (manualInput.trim()) {
      verifyBatch(manualInput.trim());
    }
  };

  // Clear results
  const clearResults = () => {
    setScanResult(null);
    setManualInput('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <QrCode className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Medicine Verification</h2>
        </div>
        {scanResult && (
          <button
            onClick={clearResults}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {!scanResult ? (
        <div className="space-y-6">
          {/* QR Scanner Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan QR Code
            </h3>
            
            {!isScanning ? (
              <div className="text-center py-8">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">
                  Position the QR code within the frame to verify medicine authenticity
                </p>
                <button
                  onClick={startScanning}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Camera className="h-5 w-5" />
                  Start Camera
                </button>
                {cameraError && (
                  <p className="text-red-600 text-sm mt-2">{cameraError}</p>
                )}
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-500 w-48 h-48 rounded-lg">
                    <div className="absolute inset-0 border-2 border-green-500 animate-pulse rounded-lg"></div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={stopScanning}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Stop Scanning
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Manual Verification
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter batch number or token ID (e.g., BATCH_001)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleManualVerification()}
              />
              <button
                onClick={handleManualVerification}
                disabled={!manualInput.trim() || isVerifying}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
              >
                {isVerifying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Verify
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Try: BATCH_001, BATCH_002, or 0.0.12345
            </p>
          </div>
        </div>
      ) : (
        /* Verification Results */
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            scanResult.isValid 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {scanResult.isValid ? (
              <CheckCircle className="h-12 w-12" />
            ) : (
              <AlertTriangle className="h-12 w-12" />
            )}
          </div>

          <h3 className={`text-xl font-semibold mb-2 ${
            scanResult.isValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {scanResult.isValid ? 'Verified' : 'Verification Failed'}
          </h3>

          <p className="text-gray-600 mb-6">{scanResult.message}</p>

          {scanResult.batch && (
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <h4 className="font-semibold mb-3">Batch Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Batch Number:</div>
                <div className="font-mono">{scanResult.batch.batchNumber}</div>
                
                <div className="text-gray-600">Product:</div>
                <div>{scanResult.batch.productName}</div>
                
                <div className="text-gray-600">Token ID:</div>
                <div className="font-mono text-xs">{scanResult.batch.tokenId}</div>
                
                <div className="text-gray-600">Manufacturing:</div>
                <div>{scanResult.batch.manufacturingDate}</div>
                
                <div className="text-gray-600">Expiry:</div>
                <div>{scanResult.batch.expiryDate}</div>
                
                <div className="text-gray-600">Status:</div>
                <div className={`font-semibold ${
                  scanResult.batch.status === 'VERIFIED' 
                    ? 'text-green-600' 
                    : scanResult.batch.status === 'PENDING'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {scanResult.batch.status}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Scan Another
            </button>
            <button
              onClick={startScanning}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Scan QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;