import { useState, useEffect } from 'react';
import { Interview } from '../types/interview';
import { storage } from '../utils/storage';
import AddInterviewModal from '../components/AddInterviewModal';
import InterviewQueue from '../components/InterviewQueue';
import { Plus } from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setInterviews(storage.getInterviews());
  }, []);

  const pendingInterviews = interviews.filter(
    i => i.status === 'pending' || i.status === 'in-progress'
  );
  
  const completedInterviews = interviews.filter(
    i => i.status === 'completed'
  );

  const handleAddInterview = (rawTranscript: string, jsonData: any) => {
    const newInterview: Interview = {
      id: `interview-${Date.now()}`,
      rawTranscript,
      originalJson: jsonData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    storage.addInterview(newInterview);
    setInterviews(storage.getInterviews());
    setIsAddModalOpen(false);
  };

  const handleDeleteInterview = (id: string) => {
    storage.deleteInterview(id);
    setInterviews(storage.getInterviews());
  };

  const refreshInterviews = () => {
    setInterviews(storage.getInterviews());
  };

  return (
    <>
      <Head>
        <title>Interview Review System</title>
        <meta name="description" content="Human review system for LLM-generated interview transcripts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Interview Review System
              </h1>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Interview
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InterviewQueue
              title="Pending Review"
              interviews={pendingInterviews}
              onDelete={handleDeleteInterview}
              onRefresh={refreshInterviews}
              type="pending"
            />
            
            <InterviewQueue
              title="Completed & Verified"
              interviews={completedInterviews}
              onDelete={handleDeleteInterview}
              onRefresh={refreshInterviews}
              type="completed"
            />
          </div>
        </main>

        <AddInterviewModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddInterview}
        />
      </div>
    </>
  );
}