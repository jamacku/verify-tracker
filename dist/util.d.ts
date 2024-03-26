import { Octokit } from '@octokit/core';
export declare function updateStatusCheck(octokit: Octokit, checkID: number, status: undefined, conclusion: 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'success' | 'skipped' | 'stale' | 'timed_out' | undefined, message: string): Promise<void>;
export declare function getFailedMessage(error: string[]): string;
export declare function getSuccessMessage(message: string[]): string;
export declare function setLabels(octokit: Octokit, issueNumber: number, labels: string[]): Promise<void>;
export declare function removeLabel(octokit: Octokit, issueNumber: number, label: string): Promise<void>;
export declare function raise(error: string): never;
export declare function getTitle(octokit: Octokit, issueNumber: number): Promise<string>;
export declare function isTrackerInTitle(title: string, tracker: string): boolean;
export declare function getCurrentTitle(title: string): string;
export declare function setTitle(octokit: Octokit, issueNumber: number, tracker: string, trackerType: 'bugzilla' | 'jira'): Promise<string>;
