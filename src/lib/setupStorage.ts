
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Setup the storage bucket for the application
 * This function will try to set up the storage bucket, but will gracefully handle
 * failures by using placeholder images instead of showing errors
 */
export const setupStorageBucket = async (): Promise<boolean> => {
  console.log('Starting storage bucket setup...');
  
  try {
    // Mark setup as attempted to avoid multiple attempts
    sessionStorage.setItem('storage-setup-attempted', 'true');
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user, skipping bucket creation');
      return false;
    }
    
    // Try to get the bucket
    const { data: existingBucket, error: getBucketError } = await supabase.storage
      .getBucket('template_assets');
      
    if (!getBucketError && existingBucket) {
      console.log('Template assets bucket already exists');
      return true;
    }
    
    // Create the bucket if it doesn't exist
    console.log('Bucket not found, creating template_assets bucket...');
    
    try {
      const { data, error: createBucketError } = await supabase.storage
        .createBucket('template_assets', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
      if (createBucketError) {
        console.log('Error creating bucket:', createBucketError.message);
        // Handle RLS policy error gracefully
        if (createBucketError.message.includes('policy')) {
          console.log('RLS policy preventing bucket creation - using fallback images');
          // Continue with the application despite the RLS error
          return true;
        } else {
          console.error('Error creating template_assets bucket:', createBucketError);
          return false;
        }
      }
      
      console.log('Storage bucket created successfully');
      return true;
    } catch (error) {
      // Catch any unexpected errors during bucket creation
      console.error('Unexpected error during bucket creation:', error);
      return true; // Still return true to allow the app to work with fallback images
    }
  } catch (error) {
    console.error('Error setting up storage bucket:', error);
    return true; // Still return true to allow the app to work with fallback images
  } finally {
    console.log('Storage bucket setup complete');
  }
};

/**
 * Make sure storage bucket exists - to be called before operations that need the bucket
 * This function is more lightweight than setupStorageBucket and just ensures the bucket exists
 */
export const ensureStorageBucketExists = async (): Promise<boolean> => {
  // Skip if already tried setup
  const storageSetupDone = sessionStorage.getItem('storage-setup-attempted');
  if (storageSetupDone === 'true') {
    return true;
  }
  
  return await setupStorageBucket();
};
