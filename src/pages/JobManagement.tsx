
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAllJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  active: boolean;
  createdAt: string;
}

const JobManagement = () => {
  const { data: jobsData, isLoading } = useAllJobs();
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: 'Remote',
    type: 'Full-time',
    description: ''
  });

  const jobs = jobsData?.jobs || [];

  const handleCreate = async () => {
    try {
      await createJobMutation.mutateAsync(formData);
      setIsCreating(false);
      setFormData({ title: '', location: 'Remote', type: 'Full-time', description: '' });
      toast({
        title: "Success",
        description: "Job created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (job: Job) => {
    try {
      await updateJobMutation.mutateAsync({
        ...job,
        ...formData
      });
      setEditingId(null);
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJobMutation.mutateAsync(jobId);
        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete job",
          variant: "destructive",
        });
      }
    }
  };

  const startEdit = (job: Job) => {
    setEditingId(job.id);
    setFormData({
      title: job.title,
      location: job.location,
      type: job.type,
      description: job.description
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ title: '', location: 'Remote', type: 'Full-time', description: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Job Management</h1>
            <Button 
              onClick={() => setIsCreating(true)}
              className="rounded-[2rem]"
              disabled={isCreating}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Job
            </Button>
          </div>

          {/* Create Job Form */}
          {isCreating && (
            <Card className="mb-6 rounded-[2rem]" style={{ backgroundColor: '#f5f4f9' }}>
              <CardHeader>
                <CardTitle>Create New Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Job Description</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({...formData, description: value})}
                    placeholder="Enter detailed job description..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={createJobMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    Create Job
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="rounded-[2rem]">
                <CardContent className="p-6">
                  {editingId === job.id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Input
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                          />
                        </div>
                      </div>
                       <div>
                         <Label>Description</Label>
                         <RichTextEditor
                           value={formData.description}
                           onChange={(value) => setFormData({...formData, description: value})}
                         />
                       </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(job)} disabled={updateJobMutation.isPending}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={cancelEdit}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <p className="text-muted-foreground">{job.location}, {job.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(job)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {job.description.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found. Create your first job to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
