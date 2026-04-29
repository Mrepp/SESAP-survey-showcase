'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Flex,
  Text,
  Button,
  Spinner,
  Link as ChakraLink,
} from '@chakra-ui/react';
import type { InterviewRecord, BuildDirtyState, BuildMetadata } from '@sesap/types';
import { api, type InterviewRecordWithStale } from '../api/interviews';
import { StatusBadge } from '../components/StatusBadge';

export function Dashboard() {
  const pathname = usePathname();
  const [interviews, setInterviews] = useState<InterviewRecordWithStale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [buildStatus, setBuildStatus] = useState<{ dirty: BuildDirtyState | null; manifest: BuildMetadata | null; showcaseUrl: string } | null>(null);
  const [building, setBuilding] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(false);
  const [buildWarning, setBuildWarning] = useState<{
    missing: InterviewRecord[];
    drops: { id: string; reason: string }[];
  } | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [data, status] = await Promise.all([
        api.listInterviews(),
        api.getBuildStatus(),
      ]);
      setInterviews(data);
      setBuildStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleBuild() {
    if (!confirm('Rebuild all indexes? This may take a moment.')) return;
    setBuilding(true);
    setBuildSuccess(false);
    setBuildWarning(null);
    try {
      const result = await api.triggerBuild();
      const [status, fresh] = await Promise.all([
        api.getBuildStatus(),
        api.listInterviews(),
      ]);
      setBuildStatus(status);
      setInterviews(fresh);

      // A publish only counts as fully successful if every currently-approved
      // interview made it into the new manifest. The indexing worker reports
      // its own includedIds + drops, but we cross-check against the live
      // approved list because new approvals can race with a slow build.
      const includedIds = new Set(
        result.includedIds ?? status.manifest?.interviewIds ?? [],
      );
      const missing = fresh.filter(
        (i) => i.approval.status === 'approved' && !includedIds.has(i.id),
      );
      const drops = result.drops ?? [];

      if (missing.length > 0 || drops.length > 0) {
        setBuildWarning({ missing, drops });
      } else {
        setBuildSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Build failed');
    } finally {
      setBuilding(false);
    }
  }

  // Re-fetch on every navigation to this route
  useEffect(() => { load(); }, [pathname]);

  const manifest = buildStatus?.manifest ?? null;
  const manifestInterviewIds = manifest?.interviewIds;
  // We can flag "not published" in two cases:
  //   (a) no manifest exists at all — nothing has ever been published, so every
  //       approved interview is unpublished by definition.
  //   (b) a manifest exists *and* carries an interviewIds list — we trust it
  //       and flag any approved interview whose id isn't in it.
  // The middle case (manifest exists but predates this feature so has no
  // interviewIds field) is treated as unknown — don't false-flag.
  const canEvaluatePublishState =
    manifest === null || Array.isArray(manifestInterviewIds);
  const publishedIds = useMemo(
    () => new Set(manifestInterviewIds ?? []),
    [manifestInterviewIds],
  );

  const filtered = interviews.filter((i) => {
    if (statusFilter !== 'all' && i.processing.status !== statusFilter) return false;
    if (approvalFilter !== 'all' && i.approval.status !== approvalFilter) return false;
    return true;
  });

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="gray.800">
          Interview Review Dashboard
        </Text>
      </Flex>

      {/* Filters */}
      <Flex gap={3} mb={5} wrap="wrap" alignItems="center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            background: 'white',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            background: 'white',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          <option value="all">All Approvals</option>
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <Button variant="outline" size="sm" onClick={load}>
          Refresh
        </Button>
      </Flex>

      {/* Build status banner */}
      {buildStatus?.dirty?.isDirty && (
        <Flex
          alignItems="center"
          gap={3}
          bg="orange.50"
          px={4}
          py={3}
          mb={5}
          borderRadius="md"
          border="1px solid"
          borderColor="orange.200"
        >
          <Box w={2} h={2} borderRadius="full" bg="orange.400" flexShrink={0} />
          <Text fontSize="sm" color="orange.700" flex={1}>
            {buildStatus.dirty.pendingChanges} change{buildStatus.dirty.pendingChanges !== 1 ? 's' : ''} pending
            {' \u2014 '}indexes are out of date
          </Text>
          <Button
            size="sm"
            colorPalette="orange"
            onClick={handleBuild}
            disabled={building}
          >
            {building ? 'Publishing...' : 'Publish Changes'}
          </Button>
        </Flex>
      )}

      {/* Build partial-success / warning banner */}
      {buildWarning && (
        <Flex
          direction="column"
          gap={2}
          bg="red.50"
          px={4}
          py={3}
          mb={5}
          borderRadius="md"
          border="1px solid"
          borderColor="red.200"
        >
          <Flex alignItems="center" gap={3}>
            <Box w={2} h={2} borderRadius="full" bg="red.500" flexShrink={0} />
            <Text fontSize="sm" color="red.700" fontWeight={600} flex={1}>
              Publish completed but {buildWarning.missing.length} approved
              interview{buildWarning.missing.length === 1 ? ' is' : 's are'} not in the showcase.
            </Text>
            <Button size="sm" variant="ghost" onClick={() => setBuildWarning(null)}>
              Dismiss
            </Button>
          </Flex>
          {buildWarning.missing.length > 0 && (
            <Box pl={5} fontSize="xs" color="red.700">
              <Text fontWeight={600} mb={1}>Missing from showcase:</Text>
              {buildWarning.missing.map((i) => {
                const drop = buildWarning.drops.find((d) => d.id === i.id);
                return (
                  <Text key={i.id}>
                    • {i.title} ({i.id})
                    {drop ? ` — ${drop.reason.replace(/_/g, ' ')}` : ''}
                  </Text>
                );
              })}
            </Box>
          )}
        </Flex>
      )}

      {/* Build success banner */}
      {buildSuccess && buildStatus?.showcaseUrl && (
        <Flex
          alignItems="center"
          gap={3}
          bg="green.50"
          px={4}
          py={3}
          mb={5}
          borderRadius="md"
          border="1px solid"
          borderColor="green.200"
        >
          <Box w={2} h={2} borderRadius="full" bg="green.400" flexShrink={0} />
          <Text fontSize="sm" color="green.700" flex={1}>
            Index published successfully.{' '}
            <a
              href={buildStatus.showcaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600, textDecoration: 'underline' }}
            >
              View Showcase
            </a>
          </Text>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setBuildSuccess(false)}
          >
            Dismiss
          </Button>
        </Flex>
      )}

      {/* Content */}
      {loading ? (
        <Flex justify="center" py={12}>
          <Spinner size="lg" color="brand.500" />
        </Flex>
      ) : error ? (
        <Box bg="red.50" color="red.700" p={4} borderRadius="md" fontSize="sm">
          {error}
        </Box>
      ) : filtered.length === 0 ? (
        <Flex justify="center" py={12}>
          <Text color="gray.400" fontSize="lg">No interviews found</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap={3}>
          {filtered.map((interview) => (
            <ChakraLink
              key={interview.id}
              asChild
              _hover={{ textDecoration: 'none' }}
            >
              <Link href={`/interview?id=${interview.id}`}>
                <Flex
                  bg="white"
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="lg"
                  p={4}
                  alignItems="center"
                  justifyContent="space-between"
                  transition="all 0.15s"
                  _hover={{ shadow: 'md', borderColor: 'gray.200' }}
                  cursor="pointer"
                >
                  <Box>
                    <Text fontSize="md" fontWeight="600" color="gray.800" mb={1}>
                      {interview.title}
                    </Text>
                    <Flex gap={3} fontSize="xs" color="gray.500" wrap="wrap">
                      <Text><strong>College:</strong> {interview.demographics.college}</Text>
                      <Text><strong>Major:</strong> {interview.demographics.major}</Text>
                      <Text><strong>Year:</strong> {interview.demographics.graduationYear}</Text>
                    </Flex>
                  </Box>
                  <Flex gap={2} alignItems="center" flexShrink={0} ml={4}>
                    <StatusBadge status={interview.processing.status} />
                    {(interview.processing.status === 'completed' || interview.processing.status === 'failed') && (
                      <StatusBadge status={interview.approval.status} />
                    )}
                    {interview.approval.status === 'approved' && canEvaluatePublishState && !publishedIds.has(interview.id) && (
                      <StatusBadge status="not_published" />
                    )}
                    {interview.stale && (
                      <StatusBadge status="out_of_sync" />
                    )}
                  </Flex>
                </Flex>
              </Link>
            </ChakraLink>
          ))}
        </Flex>
      )}
    </Box>
  );
}
