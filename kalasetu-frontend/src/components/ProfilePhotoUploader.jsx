import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ProfilePhotoUploader = ({ value, onUpload, onDelete, uploading }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    await onUpload(file);
    setPreview(null);
  };

  return (
    <div className="flex items-center gap-4">
      <img src={preview || value} alt="Profile" loading="lazy" className="w-24 h-24 rounded-full object-cover border" />
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Change Photo'}
        </button>
        <button
          type="button"
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
          onClick={onDelete}
          disabled={uploading}
        >
          Remove Photo
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
};

export default ProfilePhotoUploader;

ProfilePhotoUploader.propTypes = {
  value: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  uploading: PropTypes.bool,
};

