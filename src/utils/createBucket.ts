
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a storage bucket if it doesn't exist
 * @param bucketId The ID of the bucket to create
 * @returns A promise that resolves when the bucket is created or already exists
 */
export const createBucketIfNotExists = async (bucketId: string): Promise<void> => {
  try {
    // First check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }
    
    // Check if our bucket is in the list
    const bucketExists = buckets.some(bucket => bucket.id === bucketId);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketId}`);
      
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket(bucketId, {
        public: true, // Make files publicly accessible
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketId}:`, createError);
        throw createError;
      }
      
      console.log(`Bucket ${bucketId} created successfully`);
    } else {
      console.log(`Bucket ${bucketId} already exists`);
    }
  } catch (error) {
    console.error('Error in createBucketIfNotExists:', error);
    throw error;
  }
};
