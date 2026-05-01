import cloneDeep from 'lodash-es/cloneDeep';

import { removeVisitedNode, replaceVisitedNode } from '@/utils/app/graph/common';

export type NavigationHistory = string[];

function isLegacyVisitedRecord(value: unknown): value is Record<string, string> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function recordToLinearHistory(
  visitedRecord: Record<string, string>,
  focusNodeId: string,
): NavigationHistory {
  if (!focusNodeId) {
    return [];
  }

  const suffix: string[] = [];
  let current: string | undefined = focusNodeId;
  const seen = new Set<string>();

  while (current && !seen.has(current)) {
    seen.add(current);
    suffix.push(current);
    const prev: string | undefined = visitedRecord[current];
    if (prev === undefined || prev === current) {
      break;
    }
    current = prev;
  }

  return suffix.reverse();
}

export function linearHistoryToMap(history: NavigationHistory): Record<string, string> {
  const map: Record<string, string> = {};
  if (history.length === 0) {
    return map;
  }
  map[history[0]] = history[0];
  for (let i = 1; i < history.length; i++) {
    map[history[i]] = history[i - 1];
  }
  return map;
}

export function normalizeNavigationHistory(raw: unknown, focusNodeId: string): NavigationHistory {
  if (!focusNodeId) {
    return [];
  }

  if (Array.isArray(raw) && raw.every(id => typeof id === 'string')) {
    const list = raw as string[];
    if (list.length === 0) {
      return [focusNodeId];
    }
    if (list[list.length - 1] !== focusNodeId) {
      const idx = list.lastIndexOf(focusNodeId);
      if (idx >= 0) {
        return list.slice(0, idx + 1);
      }
      return [...list, focusNodeId];
    }
    return [...list];
  }

  if (isLegacyVisitedRecord(raw) && Object.keys(raw).length > 0) {
    return recordToLinearHistory(raw, focusNodeId);
  }

  return [focusNodeId];
}

export function getPreviousNodeIdFromHistory(
  history: NavigationHistory,
  focusNodeId: string,
): string | undefined {
  const idx = history.lastIndexOf(focusNodeId);
  if (idx <= 0) {
    return undefined;
  }
  return history[idx - 1];
}

export function getRecordedPreviousFromPlaybackSnapshot(visited: unknown, focusNodeId: string): string | undefined {
  if (!focusNodeId) {
    return undefined;
  }
  const hist = normalizeNavigationHistory(visited, focusNodeId);
  return getPreviousNodeIdFromHistory(hist, focusNodeId);
}

export function visitedHistoryContainsNode(history: NavigationHistory, nodeId: string): boolean {
  return history.includes(nodeId);
}

export function computeNextNavigationHistory(
  history: NavigationHistory,
  focusNodeId: string,
  clickedNodeId: string,
): NavigationHistory {
  const normalized = normalizeNavigationHistory(history, focusNodeId);

  if (clickedNodeId === focusNodeId) {
    return normalized;
  }

  const isBack =
    normalized.length >= 2 && normalized[normalized.length - 2] === clickedNodeId && normalized.at(-1) === focusNodeId;

  if (isBack) {
    return normalized.slice(0, -1);
  }

  return [...normalized, clickedNodeId];
}

export function replaceVisitedNodeInNavigationHistory(
  history: NavigationHistory,
  focusNodeId: string,
  customNodeId: string,
): NavigationHistory {
  const map = cloneDeep(linearHistoryToMap(normalizeNavigationHistory(history, focusNodeId)));
  replaceVisitedNode(map, focusNodeId, customNodeId);
  return recordToLinearHistory(map, customNodeId);
}

export function navigationHistoryAfterFailedNode(
  history: NavigationHistory,
  focusNodeId: string,
  failedNodeId: string,
  nextFocusNodeId: string,
): NavigationHistory {
  const map = cloneDeep(linearHistoryToMap(normalizeNavigationHistory(history, focusNodeId)));
  removeVisitedNode(map, failedNodeId);
  return recordToLinearHistory(map, nextFocusNodeId);
}

export function uniqueVisitedNodeIds(history: NavigationHistory): string[] {
  return [...new Set(history)];
}
