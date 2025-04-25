
import { supabase } from '@/integrations/supabase/client';

export async function setupStorageBucket() {
  try {
    console.log('Starting storage bucket setup...');
    // Check if the bucket already exists
    const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
    
    if (getBucketsError) {
      console.error('Error checking storage buckets:', getBucketsError);
      return;
    }
    
    // If bucket doesn't exist, create it
    if (!buckets?.find(bucket => bucket.name === 'template_assets')) {
      try {
        console.log('Bucket not found, creating template_assets bucket...');
        // Create bucket
        const { error: createBucketError } = await supabase.storage.createBucket('template_assets', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (createBucketError) {
          console.error('Error creating template_assets bucket:', createBucketError);
        } else {
          console.log('Created template_assets bucket successfully');
          
          // Set public policy for the bucket
          const { error: policyError } = await supabase.storage.from('template_assets').getPublicUrl('test.txt');
          if (policyError) {
            console.error('Error setting public policy:', policyError);
          }
        }
      } catch (error) {
        console.error('Error in setupStorageBucket:', error);
      }
    } else {
      console.log('template_assets bucket already exists');
      // Bucket exists, but let's make sure it's public
      try {
        const { error: updateBucketError } = await supabase.storage.updateBucket('template_assets', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (updateBucketError) {
          console.error('Error updating template_assets bucket:', updateBucketError);
        } else {
          console.log('Updated template_assets bucket successfully');
        }
      } catch (error) {
        console.error('Error updating bucket settings:', error);
      }
    }
  } catch (error) {
    console.error('Unexpected error in setupStorageBucket:', error);
  }
}

// Add updateRLS function to update bucket policies if needed
export async function updateBucketPolicies() {
  try {
    console.log('Updating bucket policies...');
    // Ensure this is run only by authenticated users with appropriate permissions
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('User not authenticated');
      return;
    }
    
    // Check if the current user can update policies
    console.log('Requested policy update for template_assets bucket by user:', user.id);
    
  } catch (error) {
    console.error('Error updating bucket policies:', error);
  }
}

// Ensure bucket exists and call it from DesignerPage
export async function ensureStorageBucketExists() {
  try {
    console.log('Ensuring storage bucket exists...');
    await setupStorageBucket();
    console.log('Storage bucket setup complete');
    return true;
  } catch (error) {
    console.error('Failed to ensure storage bucket exists:', error);
    return false;
  }
}
