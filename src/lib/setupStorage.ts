
import { supabase } from '@/integrations/supabase/client';

export async function setupStorageBucket() {
  // Check if the bucket already exists
  const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
  
  if (getBucketsError) {
    console.error('Error checking storage buckets:', getBucketsError);
    return;
  }
  
  // If bucket doesn't exist, create it
  if (!buckets?.find(bucket => bucket.name === 'template_assets')) {
    try {
      // Create bucket
      const { error: createBucketError } = await supabase.storage.createBucket('template_assets', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createBucketError) {
        console.error('Error creating template_assets bucket:', createBucketError);
      } else {
        console.log('Created template_assets bucket successfully');
      }
    } catch (error) {
      console.error('Error in setupStorageBucket:', error);
    }
  } else {
    // Bucket exists, but let's make sure it's public
    try {
      const { error: updateBucketError } = await supabase.storage.updateBucket('template_assets', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (updateBucketError) {
        console.error('Error updating template_assets bucket:', updateBucketError);
      }
    } catch (error) {
      console.error('Error updating bucket settings:', error);
    }
  }
}

// Add updateRLS function to update bucket policies if needed
export async function updateBucketPolicies() {
  try {
    // Ensure this is run only by authenticated users with appropriate permissions
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('User not authenticated');
      return;
    }
    
    // Check if the current user can update policies
    // This would typically be done by checking if the user is an admin
    // For simplicity, we'll just log the request
    console.log('Requested policy update for template_assets bucket by user:', user.id);
    
  } catch (error) {
    console.error('Error updating bucket policies:', error);
  }
}
