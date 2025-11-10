import { useState } from 'react';
import { Interview } from '../types/interview';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (interview: Interview) => void;
}

const EXAMPLE_JSON = `{
  "interviewId": "osu-2024-003",
  "intervieweeName": "John Doe",
  "interviewDate": "2024-03-15T10:00:00Z",
  "interviewFormat": "Prerecorded Zoom",
  "interviewerName": "Dr. Smith",
  "demographics": {
    "age": "21",
    "gender": "Male",
    "major": "Computer Science",
    "year": "Junior",
    "other": ""
  },
  "transcript": {
    "fileName": "interview-003.txt",
    "fileType": "text/plain",
    "rawText": "Your transcript here...",
    "wordCount": 450,
    "validation": {
      "minimumLengthCheck": {
        "passed": true,
        "warningIssued": false,
        "overrideApprovedBy": ""
      }
    }
  },
  "analysis": {
    "model": {
      "provider": "OpenAI",
      "modelName": "gpt-4",
      "temperature": 0.7,
      "promptVersion": "1.0"
    },
    "summaries": [],
    "timelinePoints": [],
    "themes": [],
    "quotes": [],
    "areasForImprovement": []
  },
  "status": "pending"
}`;

export default function AddInterviewModal({ isOpen, onClose, onAdd }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [jsonInput, setJsonInput] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    try {
      const parsed = JSON.parse(jsonInput);

      // Validate required fields for OSU schema
      if (!parsed.interviewId || !parsed.intervieweeName || !parsed.demographics || !parsed.analysis) {
        setError('Invalid interview data structure. Please ensure the JSON matches the OSU interview schema.');
        return;
      }

      // If transcript text is provided, inject it into the parsed JSON
      if (transcriptText.trim()) {
        const wordCount = transcriptText.trim().split(/\s+/).length;
        parsed.transcript = {
          ...parsed.transcript,
          rawText: transcriptText.trim(),
          wordCount: wordCount,
          validation: {
            minimumLengthCheck: {
              passed: wordCount >= 100,
              warningIssued: wordCount < 100,
              overrideApprovedBy: ""
            }
          }
        };
      }

      // Ensure status and metadata are set
      const interview: Interview = {
        ...parsed,
        status: parsed.status || 'pending',
        metadata: {
          ...parsed.metadata,
          createdAt: parsed.metadata?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: parsed.metadata?.version || '1.0',
          source: parsed.metadata?.source || 'manual-upload',
          validatedBy: parsed.metadata?.validatedBy || '',
        },
      };

      onAdd(interview);
      setJsonInput('');
      setTranscriptText('');
      setError('');
      setActiveTab(0);
    } catch {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setTranscriptText('');
    setError('');
    setActiveTab(0);
    onClose();
  };

  const loadExample = () => {
    setJsonInput(EXAMPLE_JSON);
    setError('');
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Interview</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="JSON Input" />
            <Tab label="Transcript" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button size="small" onClick={loadExample} variant="outlined">
                Load Example JSON
              </Button>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Interview JSON Data"
              multiline
              rows={18}
              fullWidth
              variant="outlined"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={EXAMPLE_JSON}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <TextField
              margin="dense"
              label="Transcript Text"
              multiline
              rows={20}
              fullWidth
              variant="outlined"
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste transcript text here... (This will override the transcript.rawText in your JSON)"
              helperText="Optional: Add or replace the transcript text. Word count will be calculated automatically."
            />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Interview
        </Button>
      </DialogActions>
    </Dialog>
  );
}
