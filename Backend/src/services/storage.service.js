import ImageKit from "imagekit";
import config from "../config/config.js";

var imagekit = new ImageKit({
    publicKey : config.IMAGEKIT_PUBLIC_KEY,
    privateKey :config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : config.IMAGEKIT_URL_ENDPOINT
});


export async function uploadFile(file,filename) {
    return new Promise((resolve, reject) => {
        if (!file || !file.buffer) {
            return reject(new Error('File buffer is missing'));
        }
        
        console.log('Uploading file:', filename, 'Size:', file.buffer.length);
        
        imagekit.upload(
            {
            file: file.buffer, // required
            fileName: filename, // required
            folder: "n22-social-application" // optional
        }, 
        function(error, result) {
            if (error) {
                console.error('ImageKit upload error:', error);
                reject(error);
            } else {
                console.log('✓ File uploaded successfully to ImageKit');
                console.log('  URL:', result.url);
                console.log('  FileID:', result.fileId);
                
                // Return structured response with both url and fileId
                resolve({
                    url: result.url,
                    fileId: result.fileId, // ImageKit SDK property
                });
            }
        });
    });
}

export async function deleteFile(fileId) {
    return new Promise((resolve, reject) => {
        if (!fileId) {
            return reject(new Error('File ID is required for deletion'));
        }
        
        console.log('Deleting file from ImageKit:', fileId);
        
        imagekit.deleteFile(fileId, function(error, result) {
            if (error) {
                console.error('ImageKit delete error:', error);
                reject(error);
            } else {
                console.log('File deleted successfully from ImageKit:', fileId);
                resolve(result);
            }
        });
    });
}