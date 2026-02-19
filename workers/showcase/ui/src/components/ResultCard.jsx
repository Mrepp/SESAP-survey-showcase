import { Box, Flex, Text, Badge, Link } from '@chakra-ui/react';

function getScoreColor(score, isSemantic) {
  if (isSemantic) {
    if (score >= 0.6) return { bg: 'score.highBg', color: 'score.high' };
    if (score >= 0.4) return { bg: 'score.medBg', color: 'score.med' };
    return { bg: 'score.lowBg', color: 'score.low' };
  }
  if (score >= 5) return { bg: 'score.highBg', color: 'score.high' };
  if (score >= 2) return { bg: 'score.medBg', color: 'score.med' };
  return { bg: 'score.lowBg', color: 'score.low' };
}

function formatScore(score, isSemantic) {
  if (isSemantic) return (score * 100).toFixed(1) + '%';
  return score.toFixed(2);
}

export function ResultCard({ result, document, interview, clusterId, isSemantic }) {
  const title = document?.title || interview?.title || result.id;
  const excerpt = document?.content
    ? document.content.substring(0, 200) + (document.content.length > 200 ? '...' : '')
    : '';
  const category = result.category || document?.category || '';
  const scoreStyle = getScoreColor(result.score, isSemantic);

  const demographics = interview?.demographics;
  const demoParts = demographics
    ? [demographics.college, demographics.graduationYear, demographics.major].filter(Boolean)
    : [];

  return (
    <Box
      bg="surface.card"
      border="1px solid"
      borderColor="surface.border"
      borderRadius="md"
      p={5}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Text fontWeight="600">{title}</Text>
        <Box
          bg={scoreStyle.bg}
          color={scoreStyle.color}
          fontSize="xs"
          fontWeight="600"
          px={2.5}
          py={0.5}
          borderRadius="full"
          whiteSpace="nowrap"
          ml={2}
          flexShrink={0}
        >
          {formatScore(result.score, isSemantic)}
        </Box>
      </Flex>

      {excerpt && (
        <Text fontSize="sm" color="fg.muted" mb={3} lineHeight="1.5">
          {excerpt}
        </Text>
      )}

      <Flex wrap="wrap" gap={2} align="center" fontSize="xs">
        {category && (
          <Badge colorPalette="blue" variant="subtle" size="sm">
            {category}
          </Badge>
        )}
        {document?.tags?.slice(0, 5).map((tag) => (
          <Badge key={tag} colorPalette="blue" variant="outline" size="sm">
            {tag}
          </Badge>
        ))}
        {demoParts.length > 0 && (
          <Text color="fg.muted">{demoParts.join(' | ')}</Text>
        )}
        {interview?.metadata?.interviewURL && (
          <Link
            href={interview.metadata.interviewURL}
            target="_blank"
            rel="noopener noreferrer"
            color="brand.500"
            fontWeight="500"
          >
            View Video
          </Link>
        )}
        {clusterId !== undefined && (
          <Badge colorPalette="green" variant="subtle" size="sm">
            Cluster {clusterId}
          </Badge>
        )}
      </Flex>
    </Box>
  );
}
