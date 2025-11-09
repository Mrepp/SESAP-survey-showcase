import { Interview } from '../types/interview';
import { X, Eye, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/router';

interface Props {
  interview: Interview;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function InterviewCard({ interview, onDelete, onRefresh }: Props) {
  const router = useRouter();
  
  const getStatusBadge = () => {
    switch (interview.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
    }
  };

  const handleReview = () => {
    router.push(`/review/${interview.id}`);
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge()}
            {interview.helpfulnessScore !== undefined && (
              <span className="text-xs text-gray-500">
                Score: {interview.helpfulnessScore}/10
              </span>
            )}
            {interview.diffScore !== undefined && (
              <span className="text-xs text-gray-500">
                Changes: {interview.diffScore}%
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {interview.rawTranscript}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              Created: {new Date(interview.createdAt).toLocaleDateString()}
            </span>
            {interview.embeddings && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Embedded
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 ml-4">
          <button
            onClick={handleReview}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Review"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(interview.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}