
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  active: boolean;
  createdAt: string;
}

interface JobsResponse {
  jobs: Job[];
}

const API_BASE = '/api';

// Fetch all active jobs
export const useJobs = () => {
  return useQuery<JobsResponse>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/get-jobs.php`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });
};

// Fetch single job by ID
export const useJob = (jobId: string) => {
  return useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/get-job.php?id=${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }
      return response.json();
    },
    enabled: !!jobId,
  });
};

// Management hooks for admin
export const useAllJobs = () => {
  return useQuery<JobsResponse>({
    queryKey: ['allJobs'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/manage-jobs.php`);
      if (!response.ok) {
        throw new Error('Failed to fetch all jobs');
      }
      return response.json();
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'active' | 'createdAt'>) => {
      const response = await fetch(`${API_BASE}/manage-jobs.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobData: Job) => {
      const response = await fetch(`${API_BASE}/manage-jobs.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update job');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`${API_BASE}/manage-jobs.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: jobId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
    },
  });
};
