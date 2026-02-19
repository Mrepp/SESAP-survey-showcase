import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Button, Input, Textarea } from '@chakra-ui/react';
import { api } from '../api/interviews';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box mb={4}>
      <Text fontSize="sm" fontWeight="500" color="gray.600" mb={1.5}>
        {label} {required && <Text as="span" color="red.500">*</Text>}
      </Text>
      {children}
    </Box>
  );
}

export function Upload() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const fd = new FormData(form);
    const transcriptFile = fd.get('transcript') as File;

    if (!transcriptFile || !transcriptFile.name) {
      setError('Please select a transcript file');
      setSubmitting(false);
      return;
    }

    const metadata = {
      title: fd.get('title'),
      demographics: {
        college: fd.get('college'),
        graduationYear: fd.get('graduationYear'),
        major: fd.get('major'),
        ...(fd.get('gender') ? { gender: fd.get('gender') } : {}),
        ...(fd.get('ethnicity') ? { ethnicity: fd.get('ethnicity') } : {}),
      },
      metadata: {
        interviewDate: fd.get('interviewDate'),
        interviewer: fd.get('interviewer'),
        ...(fd.get('interviewURL') ? { interviewURL: fd.get('interviewURL') } : {}),
        ...(fd.get('notes') ? { notes: fd.get('notes') } : {}),
      },
    };

    try {
      await api.uploadInterview(metadata, transcriptFile);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyles = {
    bg: 'surface.input',
    border: '1px solid',
    borderColor: 'gray.200',
    _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="gray.800" mb={6}>
        Upload New Interview
      </Text>

      {error && (
        <Box bg="red.50" color="red.700" p={3} borderRadius="md" fontSize="sm" mb={4}>
          {error}
        </Box>
      )}

      <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" p={6}>
        <form onSubmit={handleSubmit}>
          <Field label="Interview Title" required>
            <Input name="title" required placeholder="e.g., John Doe - CS 2024" {...inputStyles} />
          </Field>

          <Flex gap={4}>
            <Box flex={1}>
              <Field label="Interview Date" required>
                <Input name="interviewDate" type="date" required {...inputStyles} />
              </Field>
            </Box>
            <Box flex={1}>
              <Field label="Interviewer" required>
                <Input name="interviewer" required placeholder="e.g., Dr. Smith" {...inputStyles} />
              </Field>
            </Box>
          </Flex>

          <Field label="Video URL">
            <Input name="interviewURL" type="url" placeholder="https://youtube.com/..." {...inputStyles} />
          </Field>

          <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700" mt={6} mb={3}>
            Demographics
          </Text>

          <Flex gap={4}>
            <Box flex={1}>
              <Field label="College/Institution" required>
                <Input name="college" required defaultValue="Oregon State University" {...inputStyles} />
              </Field>
            </Box>
            <Box flex={1}>
              <Field label="Graduation Year" required>
                <Input name="graduationYear" required placeholder="2024" {...inputStyles} />
              </Field>
            </Box>
          </Flex>

          <Flex gap={4}>
            <Box flex={1}>
              <Field label="Major" required>
                <Input name="major" required placeholder="Computer Science" {...inputStyles} />
              </Field>
            </Box>
            <Box flex={1}>
              <Field label="Gender">
                <Input name="gender" placeholder="Optional" {...inputStyles} />
              </Field>
            </Box>
          </Flex>

          <Field label="Ethnicity">
            <Input name="ethnicity" placeholder="Optional" {...inputStyles} />
          </Field>

          <Field label="Transcript File" required>
            <Input name="transcript" type="file" accept=".txt,.md" required pt={1.5} {...inputStyles} />
            <Text fontSize="xs" color="gray.500" mt={1}>Accepts .txt, .md</Text>
          </Field>

          <Field label="Notes">
            <Textarea name="notes" placeholder="Additional notes..." rows={3} {...inputStyles} />
          </Field>

          <Flex gap={3} mt={2}>
            <Button type="submit" colorPalette="blue" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload Interview'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
