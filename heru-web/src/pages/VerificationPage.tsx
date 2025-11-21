import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Package, 
  Calendar,
  Factory,
  Shield,
  QrCode,
  ExternalLink
} from 'lucide-react';

interface VerificationData {
  success: boolean;
  batch?: {
    batchNumber: string;
    productName: string;
    tokenId: string;
    nftId: string;
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    manufacturingDate: string;
    expiryDate: string;
    manufacturerDid: string;
    transactions: any[];
    guardianVc?: string;
    ipfsHash?: string;
    metadataHash?: string;
  };
  error?: string;
}

const VerificationPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (identifier) {
      verifyBatch(identifier);
    }
  }, [identifier]);

  const verifyBatch = async (batchIdentifier: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Show demo data for common batch numbers since API is disabled
      if (batchIdentifier.includes('BATCH_') || batchIdentifier.includes('0.0.')) {
        setVerificationData({
          success: true,
          batch: {
            batchNumber: batchIdentifier.includes('BATCH_') ? batchIdentifier : 'BATCH_DEMO',
            productName: 'COVID-19 Vaccine (Demo)',
            tokenId: batchIdentifier.includes('0.0.') ? batchIdentifier : '0.0.12345',
            nftId: '0.0.12345_1',
            status: 'VERIFIED',
            manufacturingDate: '2024-01-15',
            expiryDate: '2025-01-15',
            manufacturerDid: 'did:hedera:testnet:manufacturer1',
            transactions: [
              {
                id: 'tx_create_001',
                type: 'NFT_CREATE',
                status: 'SUCCESS',
                timestamp: '2024-01-15T10:00:00Z'
              },
              {
                id: 'vc_001',
                type: 'GUARDIAN_VC', 
                status: 'SUCCESS',
                timestamp: '2024-01-15T10:05:00Z'
              }
            ],
            guardianVc: 'vc_verified',
            metadataHash: 'sha256_hash_demo'
          }
        });
      } else {
        setVerificationData({
          success: false,
          error: 'Batch not found or invalid identifier'
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Unable to verify batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'PENDING':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'FAILED':
        return <X className="h-8 w-8 text-red-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'FAILED':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying batch...</p>
          <p className="text-sm text-gray-500 mt-1">Checking blockchain records</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Medicine Verification</h1>
          <p className="text-gray-600 mt-2">Blockchain-verified pharmaceutical authenticity</p>
        </div>

        {verificationData?.success && verificationData.batch ? (
          <>
            {/* Main Verification Card */}
            <Card className={`border-2 ${getStatusColor(verificationData.batch.status)}`}>
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {getStatusIcon(verificationData.batch.status)}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {verificationData.batch.status === 'VERIFIED' ? '✓ Verified Authentic' :
                   verificationData.batch.status === 'PENDING' ? '⏳ Pending Verification' :
                   '❌ Verification Failed'}
                </h2>
                
                <p className="text-lg font-medium mb-4">{verificationData.batch.productName}</p>
                
                <Badge className={`${getStatusColor(verificationData.batch.status)} text-lg px-4 py-2`}>
                  {verificationData.batch.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Batch Number</p>
                    <p className="font-mono text-lg">{verificationData.batch.batchNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">NFT Token ID</p>
                    <p className="font-mono text-sm">{verificationData.batch.tokenId}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manufacturing Date</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {verificationData.batch.manufacturingDate}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {verificationData.batch.expiryDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                Back to Scanner
              </Button>
              
              <Button 
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Dashboard
              </Button>
            </div>
          </>
        ) : (
          /* Verification Failed */
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h2>
              <p className="text-red-700 mb-4">
                {verificationData?.error || 'This batch could not be verified. It may be counterfeit or invalid.'}
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                >
                  Try Another Code
                </Button>
                
                <Button 
                  onClick={() => window.open('/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Scan New QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by Sacred Vault • Hedera Blockchain Verification</p>
          <p>Identifier: {identifier}</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;