import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  X, 
  Clock,
  Play,
  RefreshCw,
  TestTube,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { integrationTestService } from '../services/integrationTestService';

interface TestResult {
  testName: string;
  status: 'success' | 'failure' | 'skipped';
  message: string;
  duration: number;
  data?: any;
}

const IntegrationTestDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSummary(null);

    try {
      const results = await integrationTestService.runAllTests();
      setTestResults(results);
      setSummary(integrationTestService.getTestSummary());
    } catch (error) {
      console.error('Integration tests failed:', error);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <X className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Passed</Badge>;
      case 'failure':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case 'skipped':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Skipped</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Integration Tests
          </h2>
          <p className="text-gray-600">End-to-end system connectivity verification</p>
        </div>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
                <TestTube className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{summary.passed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.passRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-lg font-bold ${summary.passRate === 100 ? 'text-green-600' : summary.passRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {summary.passRate === 100 ? 'All Good' : summary.passRate >= 80 ? 'Mostly OK' : 'Issues'}
                  </p>
                </div>
                {summary.passRate === 100 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : summary.passRate >= 80 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <X className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {isRunning && testResults.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">Running integration tests...</p>
              </div>
            </div>
          ) : testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No test results yet</p>
              <p className="text-sm">Click "Run Tests" to start verification</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    result.status === 'success' ? 'border-green-200 bg-green-50' :
                    result.status === 'failure' ? 'border-red-200 bg-red-50' :
                    'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-medium">{result.testName}</h4>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{result.duration}ms</span>
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                  
                  {result.data && (
                    <details className="mt-3">
                      <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                        View Test Data
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>System Data Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mb-2">
                1
              </div>
              <p className="text-sm font-medium">Frontend</p>
              <p className="text-xs text-gray-600">React App</p>
            </div>
            
            <div className="flex-1 h-px bg-gray-300 mx-4 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                →
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-2">
                2
              </div>
              <p className="text-sm font-medium">Guardian</p>
              <p className="text-xs text-gray-600">Policy Engine</p>
            </div>
            
            <div className="flex-1 h-px bg-gray-300 mx-4 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                →
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mb-2">
                3
              </div>
              <p className="text-sm font-medium">Hedera</p>
              <p className="text-xs text-gray-600">HCS/HTS/HFS</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Data Flow:</strong> Medicine batches → Guardian policies → Hedera consensus → Immutable record</p>
            <p><strong>Verification:</strong> QR scan → Blockchain lookup → Authenticity confirmed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTestDashboard;