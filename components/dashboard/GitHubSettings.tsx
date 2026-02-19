'use client';

import { useState, useEffect } from 'react';
import { Github, RefreshCw, Link as LinkIcon, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GitHubRepo } from '@/lib/types';

export function GitHubSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<{ login: string; avatar_url: string } | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);

  // Check GitHub connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/github/connect');
      const data = await response.json();
      if (data.connected && data.githubUser) {
        setIsConnected(true);
        setGithubUser(data.githubUser);
        // Fetch repos
        fetchRepos();
      }
    } catch (error) {
      console.error('Failed to check GitHub connection:', error);
    }
  };

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/github/repos');
      const data = await response.json();
      if (data.success) {
        setRepos(data.repos);
      }
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // For OAuth flow, redirect to GitHub OAuth
    // For now, we'll use a manual token input (for simplicity)
    const token = prompt('Enter your GitHub personal access token:');
    if (token) {
      connectGitHub(token);
    }
  };

  const connectGitHub = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await response.json();
      if (data.success) {
        setIsConnected(true);
        setGithubUser(data.githubUser);
        fetchRepos();
      } else {
        alert(data.error || 'Failed to connect GitHub');
      }
    } catch (error) {
      alert('Failed to connect GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/github/connect', { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setIsConnected(false);
        setGithubUser(null);
        setRepos([]);
        setSelectedRepo(null);
      } else {
        alert(data.error || 'Failed to disconnect GitHub');
      }
    } catch (error) {
      alert('Failed to disconnect GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedRepo) {
      alert('Please select a repository first');
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    try {
      const [owner, name] = selectedRepo.split('/');
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoOwner: owner, repoName: name }),
      });
      const data = await response.json();
      if (data.success) {
        setSyncResult({
          created: data.created,
          updated: data.updated,
          errors: data.errors || [],
        });
      } else {
        alert(data.error || 'Failed to sync');
      }
    } catch (error) {
      alert('Failed to sync from GitHub');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center">
            <Github className="h-5 w-5 text-white dark:text-gray-900" />
          </div>
          <div>
            <h3 className="font-medium">GitHub Integration</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected ? (
                <>Connected as <span className="font-medium">{githubUser?.login}</span></>
              ) : (
                'Connect your GitHub account to sync issues'
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isConnected ? (
            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={loading}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect GitHub
            </Button>
          )}
        </div>
      </div>

      {/* Repository Selection */}
      {isConnected && (
        <div className="space-y-4">
          <h4 className="font-medium">Select Repository</h4>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading repositories...</div>
          ) : repos.length === 0 ? (
            <div className="text-sm text-muted-foreground">No repositories found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo.full_name)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedRepo === repo.full_name
                      ? 'bg-accent border-accent-foreground'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate">{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs px-1 py-0.5 rounded bg-muted">Private</span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-muted-foreground truncate mt-1">{repo.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sync Actions */}
      {isConnected && selectedRepo && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Issues'}
            </Button>
          </div>

          {/* Sync Results */}
          {syncResult && (
            <div className="p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Sync Complete</span>
              </div>
              <div className="text-sm space-y-1">
                <p>Created: <span className="font-medium">{syncResult.created}</span> tasks</p>
                <p>Updated: <span className="font-medium">{syncResult.updated}</span> tasks</p>
                {syncResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-amber-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Errors:
                    </p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {syncResult.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>To connect GitHub, you need a personal access token with repo scope.</p>
        <p>Create one at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" className="underline">github.com/settings/tokens</a></p>
      </div>
    </div>
  );
}
