import { Interview } from '../types/interview';
import { useRouter } from 'next/router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import DownloadIcon from '@mui/icons-material/Download';

interface Props {
  interview: Interview;
  onDelete: (id: string) => void;
}

export default function InterviewCard({ interview, onDelete }: Props) {
  const router = useRouter();

  const getStatusChip = () => {
    switch (interview.status) {
      case 'pending':
        return (
          <Chip
            icon={<AccessTimeIcon />}
            label="Pending"
            color="warning"
            size="small"
          />
        );
      case 'in-progress':
        return (
          <Chip
            icon={<AccessTimeIcon />}
            label="In Progress"
            color="info"
            size="small"
          />
        );
      case 'completed':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Completed"
            color="success"
            size="small"
          />
        );
    }
  };

  const handleReview = () => {
    router.push(`/review/${interview.interviewId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(interview, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-${interview.interviewId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Interview header with name and date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div">
              {interview.intervieweeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(interview.interviewDate)} • {interview.interviewFormat}
            </Typography>
          </Box>
          {getStatusChip()}
        </Box>

        {/* Demographics chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {interview.demographics?.major && (
            <Chip
              label={interview.demographics.major}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {interview.demographics?.year && (
            <Chip
              label={interview.demographics.year}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {interview.status === 'completed' && interview.transcript?.validation?.minimumLengthCheck?.passed && (
            <Chip
              icon={<VerifiedIcon />}
              label="Validated"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>

        {/* Metrics row */}
        {interview.analysis && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {interview.analysis?.themes?.length || 0} Themes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {interview.analysis?.quotes?.length || 0} Quotes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {interview.analysis?.timelinePoints?.length || 0} Events
            </Typography>
          </Box>
        )}

        {/* Transcript preview */}
        {interview.transcript?.rawText && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {interview.transcript.rawText}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title="Review">
          <IconButton color="primary" onClick={handleReview}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        {interview.status !== 'pending' && (
          <Tooltip title="Download JSON">
            <IconButton color="info" onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => onDelete(interview.interviewId)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
