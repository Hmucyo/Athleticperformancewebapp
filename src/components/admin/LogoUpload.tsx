import { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface LogoUploadProps {
  accessToken: string;
  onUploadComplete?: () => void;
}

export function LogoUpload({ accessToken, onUploadComplete }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/upload-logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setError(null);
      
      if (onUploadComplete) {
        onUploadComplete();
      }

      // Reload page after 1.5 seconds to show new logo
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">App Logo</h3>
      
      <div className="space-y-4">
        {preview && (
          <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
            <img 
              src={preview} 
              alt="Logo preview" 
              className="max-h-32 object-contain"
            />
          </div>
        )}

        <label className="block">
          <div className={`
            flex items-center justify-center gap-2 px-4 py-3 
            border-2 border-dashed rounded-lg cursor-pointer
            transition-colors
            ${uploading ? 'border-gray-600 bg-gray-800 cursor-not-allowed' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'}
          `}>
            {uploading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-white rounded-full"></div>
                <span className="text-gray-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">Choose Logo Image</span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400">
            <Check className="h-5 w-5" />
            <span>Logo uploaded successfully! Refreshing...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-sm text-gray-400">
          Upload your AFSP logo. Recommended size: 400x200px or similar aspect ratio.
          The logo will appear in the navigation bar.
        </p>
      </div>
    </div>
  );
}
