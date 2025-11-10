import { useState, useEffect } from 'react';
import { Interview } from '../types/interview';
import { storage } from '../utils/storage';
import AddInterviewModal from '../components/AddInterviewModal';
import InterviewQueue from '../components/InterviewQueue';
import Head from 'next/head';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';

export default function Home() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    // Listen for storage changes (fires when localStorage is updated)
    const handleStorageChange = () => {
      setInterviews(storage.getInterviews());
    };

    // Initialize on mount
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event for same-page updates
    window.addEventListener('interviewsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('interviewsUpdated', handleStorageChange);
    };
  }, []);

  const pendingInterviews = interviews.filter(
    i => i.status === 'pending' || i.status === 'in-progress'
  );

  const completedInterviews = interviews.filter(
    i => i.status === 'completed'
  );

  const handleAddInterview = (interviewData: Interview) => {
    storage.addInterview(interviewData);
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

  const handleDownloadCompleted = () => {
    const dataStr = JSON.stringify(completedInterviews, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `completed-interviews-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>SESAP OSU Interview Review System</title>
        <meta name="description" content="SESAP Human review system for OSU student interview analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              SESAP OSU Interview Review System
            </Typography>
            <Button
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadCompleted}
              disabled={completedInterviews.length === 0}
              sx={{ mr: 2 }}
            >
              Download Completed
            </Button>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Interview
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 500px', minWidth: 0 }}>
              <InterviewQueue
                title="Pending Review"
                interviews={pendingInterviews}
                onDelete={handleDeleteInterview}
                onRefresh={refreshInterviews}
                type="pending"
              />
            </Box>

            <Box sx={{ flex: '1 1 500px', minWidth: 0 }}>
              <InterviewQueue
                title="Completed & Verified"
                interviews={completedInterviews}
                onDelete={handleDeleteInterview}
                onRefresh={refreshInterviews}
                type="completed"
              />
            </Box>
          </Box>
        </Container>

        <AddInterviewModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddInterview}
        />
      </Box>
    </>
  );
}
