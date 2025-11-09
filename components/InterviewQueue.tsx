import { Interview } from '../types/interview';
import InterviewCard from './InterviewCard';
import { Download } from 'lucide-react';

interface Props {
  title: string;
  interviews: Interview[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
  type: 'pending' | 'completed';
}

export default function InterviewQueue({ 
  title, 
  interviews, 
  onDelete, 
  onRefresh,
  type 
}: Props) {
  const handleDownloadAll = () => {
    interviews.forEach(interview => {
      const data = {
        id: interview.id,
        transcript: interview.rawTranscript,
        data: interview.editedJson || interview.originalJson,
        helpfulnessScore: interview.helpfulnessScore,
        diffScore: interview.diffScore,
        embeddings: interview.embeddings,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${interview.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'}
            </p>
          </div>
          {type === 'completed' && interviews.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
        {interviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No interviews in this queue</p>
          </div>
        ) : (
          interviews.map(interview => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
}