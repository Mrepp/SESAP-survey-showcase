
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Interview } from '../../types/interview';
import { storage } from '../../utils/storage';
import { calculateDiffScore } from '../../utils/diff';
import { embedInterviewData } from '../../utils/embeddings';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
  ssr: false,
});

export default function ReviewPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [editedJson, setEditedJson] = useState('');
  const [helpfulnessScore, setHelpfulnessScore] = useState<number>(5);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const interviews = storage.getInterviews();
      const found = interviews.find(i => i.id === id);
      if (found) {
        setInterview(found);
        setEditedJson(
          JSON.stringify(found.editedJson || found.originalJson, null, 2)
        );
        setHelpfulnessScore(found.helpfulnessScore || 5);
        
        // Mark as in-progress if pending
        if (found.status === 'pending') {
          storage.updateInterview(id as string, { status: 'in-progress' });
        }
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!interview) return;
    
    setError('');
    try {
      const parsedJson = JSON.parse(editedJson);
      const diffScore = calculateDiffScore(interview.originalJson, parsedJson);
      
      storage.updateInterview(interview.id, {
        editedJson: parsedJson,
        helpfulnessScore,
        diffScore,
      });
      
      setInterview({
        ...interview,
        editedJson: parsedJson,
        helpfulnessScore,
        diffScore,
      });
      
      alert('Changes saved successfully!');
    } catch (e) {
      setError('Invalid JSON format');
    }
  };

  const handleComplete = async () => {
    if (!interview) return;
    
    setError('');
    setIsGeneratingEmbeddings(true);
    
    try {
      const parsedJson = JSON.parse(editedJson);
      const diffScore = calculateDiffScore(interview.originalJson, parsedJson);
      
      // Generate embeddings
      const embeddings = await embedInterviewData(parsedJson);
      
      storage.updateInterview(interview.id, {
        editedJson: parsedJson,
        helpfulnessScore,
        diffScore,
        embeddings,
        status: 'completed',
      });
      
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'Error completing review');
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Review Interview - {interview.id}</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Review Interview
                  </h1>
                  <p className="text-sm text-gray-500">{interview.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isGeneratingEmbeddings}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isGeneratingEmbeddings ? 'Generating Embeddings...' : 'Complete & Verify'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Raw Transcript */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Raw Transcript
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {interview.rawTranscript}
                </p>
              </div>
            </div>

            {/* JSON Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                LLM Generated JSON (Editable)
              </h2>
              <textarea
                value={editedJson}
                onChange={(e) => setEditedJson(e.target.value)}
                className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Helpfulness Score */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Helpfulness Rating
            </h2>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min="1"
                max="10"
                value={helpfulnessScore}
                onChange={(e) => setHelpfulnessScore(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-2xl font-bold text-blue-600 min-w-[60px] text-center">
                {helpfulnessScore}/10
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Not Helpful</span>
              <span>Very Helpful</span>
            </div>
          </div>

          {/* Diff Viewer */}
          {interview.editedJson && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Changes Made
                {interview.diffScore !== undefined && (
                  <span className="ml-3 text-sm font-normal text-gray-600">
                    Diff Score: {interview.diffScore}%
                  </span>
                )}
              </h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <ReactDiffViewer
                  oldValue={JSON.stringify(interview.originalJson, null, 2)}
                  newValue={JSON.stringify(interview.editedJson, null, 2)}
                  splitView={true}
                  useDarkTheme={false}
                  leftTitle="Original"
                  rightTitle="Edited"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}