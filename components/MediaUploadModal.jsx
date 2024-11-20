import React, { useState } from 'react';
import { useUploadMediaMutation } from '../redux/api/mediaSlice';

const MediaUploadModal = ({ onClose, onUploadComplete }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMedia] = useUploadMediaMutation();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setError(null);

    // Start uploading immediately after file selection
    handleUpload(files);
  };

  const handleUpload = async (files) => {
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('media', file);
      try {
        const uploaded = await uploadMedia(formData).unwrap();
        return uploaded; // Return uploaded media
      } catch (err) {
        console.error('Upload failed:', err);
        setError('Failed to upload media.');
        return null;
      }
    });

    const uploadedMedia = await Promise.all(uploadPromises);
    onUploadComplete(uploadedMedia.filter(Boolean)); // Notify parent with successful uploads
    setUploading(false);
    
    // Close the modal after upload is complete
    onClose();
  };

  return (
    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-white text-lg font-bold">Upload Media</h2>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange} 
          className="mt-2 mb-4 p-2 border border-gray-600 rounded"
        />
        {error && <div className="text-red-500">{error}</div>}
        <div className="uploaded-media flex flex-wrap">
          {mediaFiles.map((file, index) => (
            <div key={index} className="media-item relative m-2">
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 rounded">
                  <span className="text-yellow-300">Uploading...</span>
                </div>
              ) : null}
              <div className="media-preview overflow-hidden w-32 h-32">
                <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default MediaUploadModal;