import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image } from 'lucide-react';

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void;
  acceptedTypes: string;
  multiple?: boolean;
  type: 'text' | 'image';
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  acceptedTypes,
  multiple = true,
  type
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesUploaded(acceptedFiles);
  }, [onFilesUploaded]);

  // Convert file extensions to MIME types for react-dropzone
  const getMimeTypes = (extensions: string) => {
    const mimeMap: { [key: string]: string[] } = {
      '.txt': ['text/plain'],
      '.doc': ['application/msword'],
      '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      '.pdf': ['application/pdf'],
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.gif': ['image/gif'],
      '.webp': ['image/webp'],
      '.bmp': ['image/bmp']
    };

    const extList = extensions.split(',').map(ext => ext.trim());
    const acceptObject: { [key: string]: string[] } = {};
    
    extList.forEach(ext => {
      if (mimeMap[ext]) {
        mimeMap[ext].forEach(mimeType => {
          acceptObject[mimeType] = acceptObject[mimeType] || [];
        });
      }
    });
    
    return acceptObject;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getMimeTypes(acceptedTypes),
    multiple
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-4">
        {type === 'text' ? (
          <FileText className="w-12 h-12 text-gray-400" />
        ) : (
          <Image className="w-12 h-12 text-gray-400" />
        )}
        <div>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-gray-600 font-medium mb-1">
                Drag & drop {type} files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: {acceptedTypes.replace(/[,.]/g, ', ')}
              </p>
            </>
          )}
        </div>
        <Upload className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );
};

export default FileUploader;