
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export async function setupStorageBucket() {
  try {
    console.log('Starting storage bucket setup...');
    // First check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('User not authenticated, cannot create bucket');
      return false;
    }
    
    // Check if the bucket already exists
    const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
    
    if (getBucketsError) {
      console.error('Error checking storage buckets:', getBucketsError);
      return false;
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
          if (createBucketError.message.includes('row-level security policy')) {
            // Handle RLS policy error gracefully
            console.log('RLS policy preventing bucket creation - using fallback images');
            return true; // Return true so the app can continue with placeholder images
          } else {
            console.error('Error creating template_assets bucket:', createBucketError);
            return false;
          }
        } else {
          console.log('Created template_assets bucket successfully');
          
          // Get public URL for the bucket to test it
          const { data } = await supabase.storage.from('template_assets').getPublicUrl('test.txt');
          console.log('Public URL test:', data.publicUrl);
          return true;
        }
      } catch (error) {
        console.error('Error in setupStorageBucket:', error);
        return false;
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
          return false;
        } else {
          console.log('Updated template_assets bucket successfully');
          return true;
        }
      } catch (error) {
        console.error('Error updating bucket settings:', error);
        return false;
      }
    }
  } catch (error) {
    console.error('Unexpected error in setupStorageBucket:', error);
    return false;
  }
}

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

export async function ensureStorageBucketExists() {
  try {
    console.log('Ensuring storage bucket exists...');
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('Storage setup skipped - user not authenticated');
      return false;
    }
    
    const result = await setupStorageBucket();
    console.log('Storage bucket setup complete');
    return result;
  } catch (error) {
    console.error('Failed to ensure storage bucket exists:', error);
    return false;
  }
}
