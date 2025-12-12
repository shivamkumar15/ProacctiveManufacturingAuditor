import React, { useRef, useState } from 'react';
import { Upload, X, FileVideo, FileImage, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  icon: 'video' | 'image';
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, accept, icon, file, setFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const IconComponent = icon === 'video' ? FileVideo : FileImage;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[140px]
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'}
          ${file ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {file ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
             <div className="bg-green-100 p-3 rounded-full mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
             </div>
            <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className={`p-3 rounded-full mb-3 ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
               <IconComponent className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-slate-500'}`} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1 uppercase">{accept.replace(/\./g, '').split(',').join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
