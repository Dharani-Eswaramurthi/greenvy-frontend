const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
      image.src = url;
    });
  

    export default async function getCroppedImg(imageSrc, pixelCrop) {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
    
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );
    
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const croppedImageURL = URL.createObjectURL(blob);
                    resolve(croppedImageURL);
                } else {
                    reject(new Error('Canvas is empty'));
                }
            }, 'image/jpeg');
        });
    }
    
