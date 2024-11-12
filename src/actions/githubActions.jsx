// src/lib/github/types.ts
export const GitHubConfig = {
  apiKey: '',
  baseUrl: undefined,
  version: undefined
};

export const GitHubRepository = {
  owner: '',
  repo: '',
  branch: undefined
};

export const GitHubFile = {
  path: '',
  content: '',
  sha: undefined
};

export const GitHubIssue = {
  title: '',
  body: '',
  labels: undefined,
  assignees: undefined
};

export const GitHubPullRequest = {
  title: '',
  body: '',
  head: '',
  base: '',
  draft: undefined
};

export const GitHubWorkflow = {
  name: '',
  content: ''
};

export const GitHubRelease = {
  tag_name: '',
  name: '',
  body: '',
  draft: undefined,
  prerelease: undefined
};

// src/lib/github/client.ts
import axios from 'axios';
import { GitHubConfig } from './types';

export class GitHubClient {
  constructor(config) {
    this.config = config;
    this.baseURL = config.baseUrl || 'https://api.github.com';
    this.headers = {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async request(method, endpoint, data) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.headers,
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GitHub API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}

// src/lib/github/actions.ts
import { GitHubClient } from './client';
import {
  GitHubRepository,
  GitHubFile,
  GitHubIssue,
  GitHubPullRequest,
  GitHubWorkflow,
  GitHubRelease,
} from './types';

export class GitHubActions {
  constructor(client) {
    this.client = client;
  }

  // Repository Operations
  async getRepository(repo) {
    return this.client.request('GET', `/repos/${repo.owner}/${repo.repo}`);
  }

  async createRepository(name, isPrivate = false) {
    return this.client.request('POST', '/user/repos', {
      name,
      private: isPrivate,
    });
  }

  // File Operations
  async getFile(repo, path) {
    return this.client.request(
      'GET',
      `/repos/${repo.owner}/${repo.repo}/contents/${path}`
    );
  }

  async createOrUpdateFile(repo, file) {
    const endpoint = `/repos/${repo.owner}/${repo.repo}/contents/${file.path}`;
    const content = Buffer.from(file.content).toString('base64');
    
    const data = {
      message: `Update ${file.path}`,
      content,
      branch: repo.branch || 'main',
    };

    if (file.sha) {
      data.sha = file.sha;
    }

    return this.client.request('PUT', endpoint, data);
  }

  // Issue Operations
  async createIssue(repo, issue) {
    return this.client.request(
      'POST',
      `/repos/${repo.owner}/${repo.repo}/issues`,
      issue
    );
  }

  async getIssues(repo) {
    return this.client.request(
      'GET',
      `/repos/${repo.owner}/${repo.repo}/issues`
    );
  }

  // Pull Request Operations
  async createPullRequest(repo, pr) {
    return this.client.request(
      'POST',
      `/repos/${repo.owner}/${repo.repo}/pulls`,
      pr
    );
  }

  async getPullRequests(repo) {
    return this.client.request(
      'GET',
      `/repos/${repo.owner}/${repo.repo}/pulls`
    );
  }

  // Workflow Operations
  async createWorkflow(repo, workflow) {
    const file = {
      path: `.github/workflows/${workflow.name}.yml`,
      content: workflow.content,
    };
    return this.createOrUpdateFile(repo, file);
  }

  async getWorkflows(repo) {
    return this.client.request(
      'GET',
      `/repos/${repo.owner}/${repo.repo}/actions/workflows`
    );
  }

  // Release Operations
  async createRelease(repo, release) {
    return this.client.request(
      'POST',
      `/repos/${repo.owner}/${repo.repo}/releases`,
      release
    );
  }

  async getReleases(repo) {
    return this.client.request(
      'GET',
      `/repos/${repo.owner}/${repo.repo}/releases`
    );
  }

  // Branch Operations
  async createBranch(repo, name, sha) {
    return this.client.request(
      'POST',
      `/repos/${repo.owner}/${repo.repo}/git/refs`,
      {
        ref: `refs/heads/${name}`,
        sha,
      }
    );
  }

  async getBranches(repo) {
    return this.client.request(
      'GET',
      `/repos/${repo.owner}/${repo.repo}/branches`
    );
  }

  // Commit Operations
  async getCommits(repo) {
    return this.client.request(
      'GET',
      `/repos/${repo.owner}/${repo.repo}/commits`
    );
  }

  async createCommit(repo, message, tree, parent) {
    return this.client.request(
      'POST',
      `/repos/${repo.owner}/${repo.repo}/git/commits`,
      {
        message,
        tree,
        parents: [parent],
      }
    );
  }
}

// src/lib/github/index.ts
export * from './types';
export * from './client';
export * from './actions';

// src/config/github.config.ts
export const githubConfig = {
  baseUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
  version: process.env.GITHUB_API_VERSION || 'v3',
  auth: {
    apiKey: process.env.GITHUB_API_KEY || '',
  },
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  },
  rateLimit: {
    enabled: true,
    maxRequests: 5000,
    perSeconds: 3600,
  },
  retries: {
    enabled: true,
    maxAttempts: 3,
    backoff: {
      type: 'exponential',
      initialDelay: 1000,
    },
  },
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    maxSize: 100,
  },
};

// src/config/github.envs.ts
export const githubEnvs = {
  required: [
    'GITHUB_API_KEY',
  ],
  optional: [
    'GITHUB_API_URL',
    'GITHUB_API_VERSION',
  ],
  validate() {
    for (const env of this.required) {
      if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
      }
    }
  },
};

// src/lib/github/utils/rate-limiter.ts
export class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.requests = 0;
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.resetTime = Date.now() + timeWindow;
  }

  async checkLimit() {
    const now = Date.now();

    if (now >= this.resetTime) {
      this.requests = 0;
      this.resetTime = now + this.timeWindow;
    }

    if (this.requests >= this.maxRequests) {
      return false;
    }

    this.requests++;
    return true;
  }
}

// src/lib/github/utils/retry.ts
export async function withRetry(fn, options) {
  let attempts = 0;
  let lastError;

  while (attempts < options.maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempts++;

      if (attempts === options.maxAttempts) {
        throw error;
      }

      const delay = options.backoffType === 'exponential'
        ? options.initialDelay * Math.pow(2, attempts - 1)
        : options.initialDelay * attempts;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// src/lib/github/utils/cache.ts
export class Cache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value, ttl) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// src/lib/github/utils/validators.ts
export function validateRepository(owner, repo) {
  if (!owner || typeof owner !== 'string') {
    throw new Error('Invalid repository owner');
  }
  if (!repo || typeof repo !== 'string') {
    throw new Error('Invalid repository name');
  }
}

export function validateBranch(branch) {
  if (!branch || typeof branch !== 'string') {
    throw new Error('Invalid branch name');
  }
  if (!/^[a-zA-Z0-9-_/.]+$/.test(branch)) {
    throw new Error('Invalid branch name format');
  }
}

export function validateFilePath(path) {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid file path');
  }
  if (path.startsWith('/') || path.includes('..')) {
    throw new Error('Invalid file path format');
  }
}

// src/lib/github/utils/error-handler.ts
export class GitHubError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'GitHubError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export function handleGitHubError(error) {
  if (error.response) {
    const { status, data } = error.response;
    throw new GitHubError(
      data.message || 'GitHub API Error',
      status,
      data
    );
  }
  throw new GitHubError(error.message || 'Network Error');
}