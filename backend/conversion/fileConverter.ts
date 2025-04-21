import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import mammoth from 'mammoth';
import htmlPdf from 'html-pdf-node';

// Promisify functions
const unlinkAsync = promisify(fs.unlink);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

// Types
type ServerFileInput = {
  buffer: Buffer;
  name: string;
  type: string;
};

type FileInput = File | ServerFileInput;

// Check if we're dealing with a browser File or server file
const isBrowserFile = (file: FileInput): file is File => {
  return typeof window !== 'undefined' && 'File' in window && file instanceof File;
};

// Convert buffer to file
const bufferToTempFile = async (buffer: Buffer, fileName: string): Promise<string> => {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, fileName);
  
  await writeFileAsync(tempFilePath, buffer);
  return tempFilePath;
};

// Get file buffer regardless of input type
const getFileBuffer = async (file: FileInput): Promise<Buffer> => {
  if (isBrowserFile(file)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(Buffer.from(reader.result));
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  } else {
    return file.buffer;
  }
};

// Get filename regardless of input type
const getFileName = (file: FileInput): string => {
  if (isBrowserFile(file)) {
    return file.name;
  } else {
    return file.name;
  }
};

// Get mime type regardless of input type
const getMimeType = (file: FileInput): string => {
  if (isBrowserFile(file)) {
    return file.type;
  } else {
    return file.type;
  }
};

// Check if file is already a PDF
const isPdf = (file: FileInput): boolean => {
  const mimeType = getMimeType(file);
  return mimeType === 'application/pdf';
};

// Check if file is a text file
const isTextFile = (file: FileInput): boolean => {
  const mimeType = getMimeType(file);
  return mimeType === 'text/plain';
};

// Check if file is a Word document
const isWordDocument = (file: FileInput): boolean => {
  const mimeType = getMimeType(file);
  const name = getFileName(file).toLowerCase();
  return mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
         mimeType.includes('application/msword') ||
         name.endsWith('.docx') || 
         name.endsWith('.doc');
};

// Check if file is a PowerPoint document
const isPowerPointDocument = (file: FileInput): boolean => {
  const mimeType = getMimeType(file);
  const name = getFileName(file).toLowerCase();
  return mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') || 
         mimeType.includes('application/vnd.ms-powerpoint') ||
         name.endsWith('.pptx') || 
         name.endsWith('.ppt');
};

// Convert Word document to PDF using mammoth and html-pdf-node
const convertWordToPdf = async (buffer: Buffer): Promise<Buffer> => {
  try {
    console.log(`[FileConverter] Converting Word document to HTML using mammoth`);
    
    // Convert DOCX to HTML
    const { value: html } = await mammoth.convertToHtml({ buffer });
    
    // Wrap HTML in a proper document with styles
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Converted Document</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            margin: 3cm;
          }
          img {
            max-width: 100%;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
    
    console.log(`[FileConverter] Converting HTML to PDF using html-pdf-node`);
    
    // Convert HTML to PDF
    const options = { format: 'A4' };
    const file = { content: fullHtml };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error converting Word document to PDF:', error);
    throw new Error('Failed to convert Word document to PDF');
  }
};

// Convert PowerPoint to PDF (using a simple HTML representation for now)
const convertPowerPointToPdf = async (buffer: Buffer, fileName: string): Promise<Buffer> => {
  try {
    console.log(`[FileConverter] Converting PowerPoint document to PDF: ${fileName}`);
    
    // Create a simple HTML representation of the PowerPoint
    const fileNameHtml = fileName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PowerPoint Preview</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .slide {
            background: white;
            margin: 2cm auto;
            padding: 2cm;
            width: 720px;
            height: 540px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            position: relative;
            page-break-after: always;
          }
          h1 {
            color: #333;
            text-align: center;
            margin-top: 220px;
          }
          .info {
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="slide">
          <h1>PowerPoint Preview</h1>
          <p class="info">This is a PDF preview of: "${fileNameHtml}"</p>
          <p class="info">The original presentation has been converted to PDF format.</p>
        </div>
      </body>
      </html>
    `;
    
    console.log(`[FileConverter] Converting PowerPoint HTML to PDF using html-pdf-node`);
    
    // Convert HTML to PDF
    const options = { 
      format: 'A4',
      landscape: true,
      printBackground: true
    };
    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error converting PowerPoint to PDF:', error);
    throw new Error('Failed to convert PowerPoint to PDF');
  }
};

// Convert various document types to PDF
const convertToPdf = async (buffer: Buffer, fileName: string): Promise<Buffer> => {
  try {
    const fileExt = path.extname(fileName).toLowerCase();
    console.log(`[FileConverter] Handling file with extension: ${fileExt}`);
    
    // Handle Word documents
    if (fileExt === '.docx' || fileExt === '.doc') {
      console.log(`[FileConverter] Processing Word document: ${fileName}`);
      return await convertWordToPdf(buffer);
    }
    
    // Handle PowerPoint documents
    if (fileExt === '.pptx' || fileExt === '.ppt') {
      console.log(`[FileConverter] Processing PowerPoint document: ${fileName}`);
      return await convertPowerPointToPdf(buffer, fileName);
    }
    
    // For other file types, create a simple PDF with download link
    console.log(`[FileConverter] Unsupported file type: ${fileExt}, creating placeholder PDF`);
    const fileNameHtml = fileName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Document Conversion</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          h1 {
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Document Preview Not Available</h1>
          <p>The file "${fileNameHtml}" cannot be directly previewed.</p>
          <p>Please download the original file to view its contents.</p>
        </div>
      </body>
      </html>
    `;
    
    // Convert HTML to PDF
    const options = { format: 'A4' };
    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error converting document to PDF:', error);
    throw new Error('Failed to convert document to PDF');
  }
};

// Main function to convert any document to PDF
export const convertAndCompressFile = async (file: FileInput): Promise<{
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}> => {
  // Get file details
  const buffer = await getFileBuffer(file);
  const originalName = getFileName(file);
  const mimeType = getMimeType(file);
  
  console.log(`[FileConverter] Processing file: ${originalName}, type: ${mimeType}`);
  
  // Keep PDF, TXT and PowerPoint files as-is (no conversion needed)
  if (isPdf(file)) {
    console.log(`[FileConverter] File is already PDF, no conversion needed`);
    return {
      buffer,
      fileName: originalName,
      mimeType: 'application/pdf',
    };
  }
  
  if (isTextFile(file)) {
    console.log(`[FileConverter] File is a text file, no conversion needed`);
    return {
      buffer,
      fileName: originalName,
      mimeType: 'text/plain',
    };
  }
  
  if (isPowerPointDocument(file)) {
    console.log(`[FileConverter] Keeping PowerPoint file in original format: ${originalName}`);
    return {
      buffer,
      fileName: originalName,
      mimeType: mimeType,
    };
  }
  
  // For all other files, convert to PDF
  try {
    console.log(`[FileConverter] Converting ${originalName} to PDF`);
    
    // Convert to PDF based on file type
    const pdfBuffer = await convertToPdf(buffer, originalName);
    
    console.log(`[FileConverter] Successfully converted to PDF, size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    // Return the PDF
    return {
      buffer: pdfBuffer,
      fileName: `${path.basename(originalName, path.extname(originalName))}.pdf`,
      mimeType: 'application/pdf',
    };
  } catch (error) {
    console.error(`[FileConverter] Error processing file:`, error);
    throw new Error('Failed to convert file to PDF');
  }
}; 