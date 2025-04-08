import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

const UploadDocumentPage = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Files uploaded:", acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Document</h1>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-10 text-center ${
          isDragActive ? "bg-secondary/30 border-primary" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag & drop some files here, or click to select</p>
        )}
      </div>
    </div>
  );
};

export default UploadDocumentPage;
