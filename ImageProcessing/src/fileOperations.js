function getImageDataFromImageSource(imgSource) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = imgSource;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
    
}


function generateImgSrcFromImageData(imageData) {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0)

    return canvas.toDataURL("image/png");
}

function showImageInTemplate(src, imageTagId) {
    $('#' + imageTagId)
        .attr('src', src)
        .css('display', 'block')
        //.width(150)
        .height(200);
}