import React, { useState, useRef, DragEvent } from 'react';

interface FileUploadProps {
    onFilesSelect: (files: File[]) => void;
    multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, multiple = true }) => {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (files: FileList | null) => {
        if (files && files.length > 0) {
            const fileArray = [...files];
            onFilesSelect(fileArray);
            const urls = fileArray.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...urls]);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        processFiles(event.dataTransfer.files);
    };

    const handleDragEvents = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === 'dragenter' || event.type === 'dragover') {
            setIsDragging(true);
        } else if (event.type === 'dragleave') {
            setIsDragging(false);
        }
    };
    
    const handleClear = () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        onFilesSelect([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <label 
                htmlFor="file-input" 
                className={`flex flex-col items-center justify-center w-full h-64 border-4 border-dashed rounded-4xl cursor-pointer bg-white transition-colors
                    ${isDragging ? 'border-amber-400 bg-amber-50' : 'border-amber-200 hover:border-amber-300 hover:bg-amber-50/50'}`}
                onDrop={handleDrop}
                onDragEnter={handleDragEvents}
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                     <div className="text-5xl mb-4">🎨</div>
                    <p className="mb-2 text-lg text-soft-text"><span className="font-semibold">点击上传</span> 或 拖拽图片到这里</p>
                    <p className="text-sm text-gray-400">可以一次选择多张图片哦</p>
                </div>
                <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    multiple={multiple}
                    ref={fileInputRef}
                    className="hidden"
                />
            </label>
            {previewUrls.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-4 animate-bounce-in">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                             <img src={url} alt={`preview ${index}`} className="w-28 h-28 object-cover rounded-2xl shadow-soft" />
                        </div>
                    ))}
                     <button 
                        onClick={handleClear} 
                        className="w-12 h-12 bg-sakura-pink text-pink-800 rounded-2xl flex items-center justify-center text-2xl font-bold self-center transition-transform hover:scale-110"
                        title="清除所有图片"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;