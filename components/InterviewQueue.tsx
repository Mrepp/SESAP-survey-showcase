import { Interview } from '../types/interview';
import InterviewCard from './InterviewCard';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface Props {
  title: string;
  interviews: Interview[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
  type: 'pending' | 'completed';
}

export default function InterviewQueue({ title, interviews, onDelete, onRefresh, type }: Props) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box>
        {interviews.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              color: 'text.secondary' 
            }}
          >
            <Typography variant="body1">
              No {type === 'pending' ? 'pending' : 'completed'} interviews
            </Typography>
          </Box>
        ) : (
          interviews.map(interview => (
            <InterviewCard
              key={interview.interviewId}
              interview={interview}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
