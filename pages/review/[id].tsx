import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Interview, Summary, TimelinePoint, Theme, Quote, AreaForImprovement } from '../../types/interview';
import { storage } from '../../utils/storage';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type EditItemType = 'summary' | 'timeline' | 'theme' | 'quote' | 'improvement';

interface EditState {
  type: EditItemType;
  index: number;
  item: Summary | TimelinePoint | Theme | Quote | AreaForImprovement;
}

export default function ReviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [interview, setInterview] = useState<Interview | null>(null);
  const [originalInterview, setOriginalInterview] = useState<Interview | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editedContent, setEditedContent] = useState<Summary | TimelinePoint | Theme | Quote | AreaForImprovement | Record<string, unknown>>({});
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(7);
  const [alignmentScore, setAlignmentScore] = useState(7);

  useEffect(() => {
    if (id) {
      const loadInterview = () => {
        const interviews = storage.getInterviews();
        const found = interviews.find(i => i.interviewId === id);
        if (found) {
          setInterview(found);
          // Store original for diff calculation (only on first load)
          setOriginalInterview(prev => {
            if (!prev) {
              return JSON.parse(JSON.stringify(found));
            }
            return prev;
          });
        }
      };

      loadInterview();
    }
  }, [id]);

  if (!interview) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const handleBack = () => {
    router.push('/');
  };

  const handleEdit = (type: EditItemType, index: number, item: Summary | TimelinePoint | Theme | Quote | AreaForImprovement) => {
    setEditState({ type, index, item });
    setEditedContent(JSON.parse(JSON.stringify(item)));
  };

  const handleSaveEdit = () => {
    if (!editState || !interview) return;

    const updatedInterview = { ...interview };
    
    switch (editState.type) {
      case 'summary':
        updatedInterview.analysis.summaries[editState.index] = editedContent as Summary;
        break;
      case 'timeline':
        updatedInterview.analysis.timelinePoints[editState.index] = editedContent as TimelinePoint;
        break;
      case 'theme':
        updatedInterview.analysis.themes[editState.index] = editedContent as Theme;
        break;
      case 'quote':
        updatedInterview.analysis.quotes[editState.index] = editedContent as Quote;
        break;
      case 'improvement':
        updatedInterview.analysis.areasForImprovement[editState.index] = editedContent as AreaForImprovement;
        break;
    }

    storage.updateInterview(interview.interviewId, updatedInterview);
    setInterview(updatedInterview);
    setEditState(null);
    setEditedContent({});
  };

  const calculateEditDiffScore = (): number => {
    if (!originalInterview || !interview) return 0;

    const originalStr = JSON.stringify(originalInterview.analysis);
    const currentStr = JSON.stringify(interview.analysis);

    const totalChars = Math.max(originalStr.length, currentStr.length);
    const changedChars = Math.abs(currentStr.length - originalStr.length);

    // Calculate simple character difference percentage
    const diffPercentage = (changedChars / totalChars) * 100;
    return Math.round(diffPercentage * 100) / 100; // Round to 2 decimals
  };

  const handleComplete = () => {
    if (!interview) return;

    setCompleteModalOpen(false);

    const editDiff = calculateEditDiffScore();

    // Mark as in-progress immediately (will change to completed when embeddings done)
    const inProgressInterview = {
      ...interview,
      status: 'in-progress' as const,
      metadata: {
        ...interview.metadata,
        accuracyScore: accuracyScore,
        sesapAlignmentScore: alignmentScore,
        editDiffScore: editDiff,
        updatedAt: new Date().toISOString(),
      }
    };

    storage.updateInterview(interview.interviewId, inProgressInterview);

    // Navigate back to home immediately
    router.push('/');

    // Start web worker for embeddings (runs on separate thread - truly non-blocking)
    const worker = new Worker('/embedding-worker.js', { type: 'module' });

    worker.postMessage({
      type: 'GENERATE_EMBEDDINGS',
      data: { analysis: interview.analysis }
    });

    worker.onmessage = (e) => {
      if (e.data.type === 'SUCCESS') {
        const completedInterview = {
          ...inProgressInterview,
          status: 'completed' as const,
          analysis: e.data.data,
          metadata: {
            ...inProgressInterview.metadata,
            updatedAt: new Date().toISOString(),
          }
        };
        storage.updateInterview(interview.interviewId, completedInterview);
        worker.terminate();
      } else if (e.data.type === 'ERROR') {
        console.error('Embedding generation error:', e.data.error);
        // Still mark as completed even if embeddings fail
        const completedInterview = {
          ...inProgressInterview,
          status: 'completed' as const,
          metadata: {
            ...inProgressInterview.metadata,
            updatedAt: new Date().toISOString(),
          }
        };
        storage.updateInterview(interview.interviewId, completedInterview);
        worker.terminate();
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      // Mark as completed anyway
      const completedInterview = {
        ...inProgressInterview,
        status: 'completed' as const,
        metadata: {
          ...inProgressInterview.metadata,
          updatedAt: new Date().toISOString(),
        }
      };
      storage.updateInterview(interview.interviewId, completedInterview);
      worker.terminate();
    };
  };

  const getSentimentColor = (sentiment: string): "success" | "error" | "grey" | "primary" => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'grey';
      default: return 'primary';
    }
  };

  const getPriorityColor = (priority: string): "error" | "warning" | "success" | "default" => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            {interview.intervieweeName} - Interview Review
          </Typography>
          {interview.status !== 'completed' && (
            <Button color="inherit" onClick={() => setCompleteModalOpen(true)}>
              Mark Complete
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left side - Interview Details */}
          <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
            {/* Demographics Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Demographics</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {interview.demographics?.major && (
                    <Chip label={`Major: ${interview.demographics.major}`} color="primary" variant="outlined" />
                  )}
                  {interview.demographics?.year && (
                    <Chip label={`Year: ${interview.demographics.year}`} color="secondary" variant="outlined" />
                  )}
                  {interview.demographics?.age && (
                    <Chip label={`Age: ${interview.demographics.age}`} variant="outlined" />
                  )}
                  {interview.demographics?.gender && (
                    <Chip label={`Gender: ${interview.demographics.gender}`} variant="outlined" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Interview Date: {new Date(interview.interviewDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Interviewer: {interview.interviewerName}
                </Typography>
                {interview.demographics?.other && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Other: {interview.demographics.other}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Validation Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Validation</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Word Count: ${interview.transcript?.validation?.minimumLengthCheck?.passed ? 'Passed' : 'Failed'}`}
                    color={interview.transcript?.validation?.minimumLengthCheck?.passed ? 'success' : 'error'}
                  />
                  <Chip 
                    label={`Schema Validated: ${interview.interviewId && interview.demographics && interview.analysis ? 'Yes' : 'No'}`}
                    color={interview.interviewId && interview.demographics && interview.analysis ? 'success' : 'error'}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Analysis Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="Summaries" />
                <Tab label="Timeline" />
                <Tab label="Themes" />
                <Tab label="Quotes" />
                <Tab label="Improvements" />
                <Tab label="JSON" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            {activeTab === 0 && (
              <Box>
                {interview.analysis?.summaries?.map((summary, idx) => (
                  <Card key={idx} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{summary.title}</Typography>
                      <Chip label={summary.category} size="small" sx={{ mb: 2 }} />
                      <Typography variant="body2">{summary.summaryText}</Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleEdit('summary', idx, summary)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {activeTab === 1 && (
              <Timeline>
                {interview.analysis?.timelinePoints?.map((point, idx) => (
                  <TimelineItem key={idx}>
                    <TimelineSeparator>
                      <TimelineDot color={getSentimentColor(point.sentiment)} />
                      {idx < (interview.analysis?.timelinePoints?.length || 0) - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip label={point.timeframeType} size="small" color="primary" variant="outlined" />
                            <Chip label={point.category} size="small" variant="outlined" />
                            <Chip
                              label={point.sentiment}
                              size="small"
                              color={getSentimentColor(point.sentiment) === 'grey' ? 'default' : getSentimentColor(point.sentiment) as "success" | "error" | "primary"}
                            />
                          </Box>
                          <Typography variant="body2">{point.eventDescription}</Typography>
                        </CardContent>
                        <CardActions>
                          <IconButton size="small" onClick={() => handleEdit('timeline', idx, point)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}

            {activeTab === 2 && (
              <Box>
                {interview.analysis?.themes?.map((theme, idx) => (
                  <Card key={theme.themeId} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{theme.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip label={theme.category} size="small" color="primary" variant="outlined" />
                        <Chip label={`Frequency: ${theme.frequency}`} size="small" variant="outlined" />
                        <Chip label={`Impact: ${theme.impactScore}/10`} size="small" variant="outlined" />
                        {theme.actionable && <Chip label="Actionable" size="small" color="success" />}
                      </Box>
                      <Typography variant="body2">{theme.description}</Typography>
                      {theme.relatedQuoteIds?.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Related Quotes: {theme.relatedQuoteIds.length}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleEdit('theme', idx, theme)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                {interview.analysis?.quotes?.map((quote, idx) => (
                  <Card key={quote.quoteId} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                        &ldquo;{quote.quoteText}&rdquo;
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={quote.sentiment}
                          size="small"
                          color={getSentimentColor(quote.sentiment) === 'grey' ? 'default' : getSentimentColor(quote.sentiment) as "success" | "error" | "primary"}
                        />
                        <Chip label={quote.significanceLevel} size="small" variant="outlined" />
                        {quote.tags?.map((tag, i) => (
                          <Chip key={i} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Context: {quote.context}
                      </Typography>
                      {quote.relatedThemeIds?.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Related Themes: {quote.relatedThemeIds.length}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleEdit('quote', idx, quote)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                {interview.analysis?.areasForImprovement?.map((area, idx) => (
                  <Accordion key={area.areaId}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1 }}>{area.title}</Typography>
                        <Chip label={area.priority} size="small" color={getPriorityColor(area.priority)} />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2 }}>{area.description}</Typography>
                      
                      {area.stakeholders?.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Stakeholders:</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {area.stakeholders.map((stakeholder, i) => (
                              <Chip key={i} label={stakeholder} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {area.actionItems?.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>Action Items:</Typography>
                          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                            {area.actionItems.map((item, i) => (
                              <Typography key={i} component="li" variant="body2">{item}</Typography>
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 2 }}>
                        <IconButton size="small" onClick={() => handleEdit('improvement', idx, area)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            {activeTab === 5 && (
              <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <pre style={{
                  margin: 0,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(interview, (key, value) => {
                    // Truncate embedding arrays to first 3 elements
                    if (key === 'embedding' && Array.isArray(value)) {
                      return value.length > 3 ? [...value.slice(0, 3), `... ${value.length - 3} more`] : value;
                    }
                    return value;
                  }, 2)}
                </pre>
              </Paper>
            )}
          </Box>

          {/* Right side - Transcript */}
          <Box sx={{ flex: '0 0 500px', minWidth: 0 }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 16, maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>Transcript</Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Word Count: {interview.transcript?.wordCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
                {interview.transcript?.rawText || 'No transcript available'}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={!!editState} onClose={() => setEditState(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit {editState?.type}</DialogTitle>
        <DialogContent>
          {editState?.type === 'summary' && (
            <>
              <TextField
                label="Category"
                fullWidth
                margin="normal"
                value={'category' in editedContent ? editedContent.category || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
              />
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={'title' in editedContent ? editedContent.title || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
              />
              <TextField
                label="Summary Text"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={'summaryText' in editedContent ? editedContent.summaryText || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, summaryText: e.target.value })}
              />
            </>
          )}

          {editState?.type === 'timeline' && (
            <>
              <TextField
                label="Event Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={'eventDescription' in editedContent ? editedContent.eventDescription || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, eventDescription: e.target.value })}
              />
              <TextField
                label="Timeframe Type"
                fullWidth
                margin="normal"
                value={'timeframeType' in editedContent ? editedContent.timeframeType || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, timeframeType: e.target.value })}
              />
              <TextField
                label="Category"
                fullWidth
                margin="normal"
                value={'category' in editedContent ? editedContent.category || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
              />
              <TextField
                label="Sentiment"
                fullWidth
                margin="normal"
                value={'sentiment' in editedContent ? editedContent.sentiment || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, sentiment: e.target.value })}
              />
            </>
          )}

          {editState?.type === 'theme' && (
            <>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={'title' in editedContent ? editedContent.title || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={'description' in editedContent ? editedContent.description || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
              />
              <TextField
                label="Category"
                fullWidth
                margin="normal"
                value={'category' in editedContent ? editedContent.category || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
              />
              <TextField
                label="Frequency"
                fullWidth
                margin="normal"
                type="number"
                value={'frequency' in editedContent ? editedContent.frequency || 0 : 0}
                onChange={(e) => setEditedContent({ ...editedContent, frequency: parseInt(e.target.value) })}
              />
              <TextField
                label="Impact Score (1-10)"
                fullWidth
                margin="normal"
                type="number"
                value={'impactScore' in editedContent ? editedContent.impactScore || 0 : 0}
                onChange={(e) => setEditedContent({ ...editedContent, impactScore: parseInt(e.target.value) })}
              />
            </>
          )}

          {editState?.type === 'quote' && (
            <>
              <TextField
                label="Quote Text"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={'quoteText' in editedContent ? editedContent.quoteText || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, quoteText: e.target.value })}
              />
              <TextField
                label="Context"
                fullWidth
                margin="normal"
                multiline
                rows={2}
                value={'context' in editedContent ? editedContent.context || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, context: e.target.value })}
              />
              <TextField
                label="Sentiment"
                fullWidth
                margin="normal"
                value={'sentiment' in editedContent ? editedContent.sentiment || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, sentiment: e.target.value })}
              />
              <TextField
                label="Significance Level"
                fullWidth
                margin="normal"
                value={'significanceLevel' in editedContent ? editedContent.significanceLevel || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, significanceLevel: e.target.value })}
              />
              <TextField
                label="Tags (comma separated)"
                fullWidth
                margin="normal"
                value={'tags' in editedContent ? (editedContent as Quote).tags?.join(', ') || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, tags: e.target.value.split(',').map((t) => t.trim()) })}
              />
            </>
          )}

          {editState?.type === 'improvement' && (
            <>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={'title' in editedContent ? editedContent.title || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={'description' in editedContent ? editedContent.description || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
              />
              <TextField
                label="Priority"
                fullWidth
                margin="normal"
                value={'priority' in editedContent ? editedContent.priority || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, priority: e.target.value })}
              />
              <TextField
                label="Stakeholders (comma separated)"
                fullWidth
                margin="normal"
                value={'stakeholders' in editedContent ? (editedContent as AreaForImprovement).stakeholders?.join(', ') || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, stakeholders: e.target.value.split(',').map((s) => s.trim()) })}
              />
              <TextField
                label="Action Items (comma separated)"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={'actionItems' in editedContent ? (editedContent as AreaForImprovement).actionItems?.join(', ') || '' : ''}
                onChange={(e) => setEditedContent({ ...editedContent, actionItems: e.target.value.split(',').map((a) => a.trim()) })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditState(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Complete Modal */}
      <Dialog open={completeModalOpen} onClose={() => setCompleteModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Interview Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Accuracy Score</Typography>
            <Slider
              value={accuracyScore}
              onChange={(e, v) => setAccuracyScore(v as number)}
              min={1}
              max={10}
              marks
              valueLabelDisplay="on"
            />
          </Box>
          <Box sx={{ mt: 4 }}>
            <Typography gutterBottom>Alignment to SESAP Mission</Typography>
            <Slider
              value={alignmentScore}
              onChange={(e, v) => setAlignmentScore(v as number)}
              min={1}
              max={10}
              marks
              valueLabelDisplay="on"
            />
          </Box>
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Edit Diff Score: {calculateEditDiffScore()}% characters changed
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteModalOpen(false)}>Cancel</Button>
          <Button onClick={handleComplete} variant="contained" color="primary" startIcon={<CheckCircleIcon />}>
            Complete Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
