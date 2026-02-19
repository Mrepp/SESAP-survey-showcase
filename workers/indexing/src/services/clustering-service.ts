import { cosineSimilarity } from '@sesap/shared';
import type {
  VectorIndices,
  VectorIndexEntry,
  ClusterResult,
  ClusterAssignment,
} from '@sesap/types';

interface ClusterCenter {
  clusterId: number;
  center: number[];
}

function initializeCentersPlusPlus(
  entries: VectorIndexEntry[],
  k: number
): ClusterCenter[] {
  if (entries.length === 0) {
    return [];
  }

  const centers: ClusterCenter[] = [];
  const distances = new Array(entries.length).fill(Infinity);

  // Choose first center randomly
  const firstIdx = Math.floor(Math.random() * entries.length);
  centers.push({
    clusterId: 0,
    center: [...entries[firstIdx].embedding],
  });

  // Choose remaining centers using k-means++ probability distribution
  for (let i = 1; i < k; i++) {
    // Update distances to nearest center
    for (let j = 0; j < entries.length; j++) {
      const similarity = cosineSimilarity(
        entries[j].embedding,
        centers[i - 1].center
      );
      const distance = 1 - similarity; // Convert similarity to distance
      distances[j] = Math.min(distances[j], distance);
    }

    // Select next center with probability proportional to distance squared
    const distanceSquared = distances.map((d) => d * d);
    const sum = distanceSquared.reduce((acc, d) => acc + d, 0);
    const probabilities = distanceSquared.map((d) => d / sum);

    let rand = Math.random();
    let selectedIdx = 0;
    for (let j = 0; j < probabilities.length; j++) {
      rand -= probabilities[j];
      if (rand <= 0) {
        selectedIdx = j;
        break;
      }
    }

    centers.push({
      clusterId: i,
      center: [...entries[selectedIdx].embedding],
    });
  }

  return centers;
}

function assignToClusters(
  entries: VectorIndexEntry[],
  centers: ClusterCenter[]
): Map<number, ClusterAssignment[]> {
  const assignments = new Map<number, ClusterAssignment[]>();

  for (const center of centers) {
    assignments.set(center.clusterId, []);
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    let bestCluster = 0;
    let bestSimilarity = -Infinity;

    for (const center of centers) {
      const similarity = cosineSimilarity(entry.embedding, center.center);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestCluster = center.clusterId;
      }
    }

    const distance = 1 - bestSimilarity;
    assignments.get(bestCluster)!.push({
      interviewIndex: entry.index,
      interviewId: entry.id,
      clusterId: bestCluster,
      distance,
    });
  }

  return assignments;
}

function updateCenters(
  entries: VectorIndexEntry[],
  assignments: Map<number, ClusterAssignment[]>
): ClusterCenter[] {
  const newCenters: ClusterCenter[] = [];

  for (const [clusterId, members] of assignments.entries()) {
    if (members.length === 0) {
      // Keep the old center if cluster is empty
      newCenters.push({
        clusterId,
        center: new Array(entries[0].embedding.length).fill(0),
      });
      continue;
    }

    // Calculate mean of all members
    const dimension = entries[0].embedding.length;
    const sum = new Array(dimension).fill(0);

    for (const member of members) {
      const entry = entries.find((e) => e.id === member.interviewId)!;
      for (let i = 0; i < dimension; i++) {
        sum[i] += entry.embedding[i];
      }
    }

    const center = sum.map((val) => val / members.length);
    newCenters.push({ clusterId, center });
  }

  return newCenters;
}

function calculateCohesion(
  members: ClusterAssignment[],
  center: number[],
  entries: VectorIndexEntry[]
): number {
  if (members.length === 0) return 0;

  let totalSimilarity = 0;
  for (const member of members) {
    const entry = entries.find((e) => e.id === member.interviewId)!;
    totalSimilarity += cosineSimilarity(entry.embedding, center);
  }

  return totalSimilarity / members.length;
}

function hasConverged(
  oldCenters: ClusterCenter[],
  newCenters: ClusterCenter[],
  threshold = 0.001
): boolean {
  for (let i = 0; i < oldCenters.length; i++) {
    const similarity = cosineSimilarity(
      oldCenters[i].center,
      newCenters[i].center
    );
    if (1 - similarity > threshold) {
      return false;
    }
  }
  return true;
}

function kMeansClustering(
  entries: VectorIndexEntry[],
  k: number,
  maxIterations = 20
): ClusterResult[] {
  if (entries.length === 0) {
    return [];
  }

  // Initialize centers using k-means++
  let centers = initializeCentersPlusPlus(entries, k);

  let iterations = 0;
  while (iterations < maxIterations) {
    // Assign points to clusters
    const assignments = assignToClusters(entries, centers);

    // Update centers
    const newCenters = updateCenters(entries, assignments);

    // Check for convergence
    if (hasConverged(centers, newCenters)) {
      centers = newCenters;
      break;
    }

    centers = newCenters;
    iterations++;
  }

  // Final assignment
  const finalAssignments = assignToClusters(entries, centers);

  // Build results with cohesion scores
  const results: ClusterResult[] = [];
  for (const center of centers) {
    const members = finalAssignments.get(center.clusterId) || [];
    const cohesion = calculateCohesion(members, center.center, entries);

    results.push({
      clusterId: center.clusterId,
      center: center.center,
      members,
      cohesion,
    });
  }

  return results;
}

export function clusterByCategory(
  indices: VectorIndices
): Record<string, ClusterResult[]> {
  const clusters: Record<string, ClusterResult[]> = {};

  // Cluster main categories (k=3)
  const mainCategories = ['summary', 'themes', 'collegeExperience'] as const;
  for (const category of mainCategories) {
    const entries = indices[category];
    if (entries.length > 0) {
      const k = Math.min(3, entries.length);
      clusters[category] = kMeansClustering(entries, k);
    } else {
      clusters[category] = [];
    }
  }

  // Cluster quotes (k=3)
  if (indices.quotes.length > 0) {
    const k = Math.min(3, indices.quotes.length);
    clusters.quotes = kMeansClustering(indices.quotes, k);
  } else {
    clusters.quotes = [];
  }

  // Cluster tags (k=min(2, ceil(n/2)))
  for (const [tag, entries] of Object.entries(indices.tags)) {
    if (entries.length > 0) {
      const k = Math.min(2, Math.ceil(entries.length / 2));
      clusters[`tag:${tag}`] = kMeansClustering(entries, k);
    } else {
      clusters[`tag:${tag}`] = [];
    }
  }

  return clusters;
}
