let bwEdgeImage;

$(document).ready(function () {

    $('#prewitEdge_btn').click(() => onPrewitButtonClicked());
    $('#robertEdge_btn').click(() => onRobertButtonClicked());
    $('#clearEdge_btn').click(() => clearEdgeFileAndDrawings());


});

function clearEdgeFileAndDrawings() {
    if (bwEdgeImage) bwEdgeImage = null;

    $('#edgeFile').val('');
    $('#edgeFileSelection_container').css('display', 'inline-block');

    $('#prewitEdge_img_btn_container').css('display', 'none');
    $('#robertEdge_img_btn_container').css('display', 'none');

    $('#original_edge_image_container').css('display', 'none');
    $('#robertEdge_img_container').css('display', 'none');
    $('#prewitEdge_img_container').css('display', 'none');
}

function onRandomTemplateEdgeFileSelected() {
    const randomFileId = Math.ceil(Math.random() * 4);

    const xhr = new XMLHttpRequest(); 
    xhr.open("GET", '../assets/img/odev2_ornekresim_' + randomFileId.toString() + '.jpg'); 
    xhr.responseType = "blob";
    xhr.onload = function() 
    {
        const blob = xhr.response;//xhr.response is now a blob object
        const file = new File([blob], 'ornek.jpg', {type: 'image/jpg', lastModified: Date.now()});
        onEdgeFileSelected({ files: [file]});
    }
    xhr.send()
}

function onEdgeFileSelected(input) {
    if (input.files && input.files[0]) {

        var reader = new FileReader();
        reader.onload = function (e) {
            bwEdgeImage = e.target.result;
            showImageInTemplate(bwEdgeImage, 'bwEdge_img');
            
        };
        reader.readAsDataURL(input.files[0]);
        

        $('#edgeFileSelection_container').css('display', 'none');
        $('#original_edge_image_container').css('display', 'inline-block');

        $('#prewitEdge_img_btn_container').css('display', 'inline-block');
        $('#robertEdge_img_btn_container').css('display', 'inline-block');
    }
}

function onPrewitButtonClicked() {
    if (bwEdgeImage) {
        const imageData = getImageDataFromImageSource(bwEdgeImage);
        const pixelArr = imageData.data;
        const width = imageData.width;      
        imageData.data = detectEdgeByPrewit(pixelArr, width);


        const canvas = generateImgSrcFromImageData(imageData); 
        $('#prewitEdge_img_btn_container').css('display', 'none');
        $('#prewitEdge_img_container').css('display', 'inline-block');
        showImageInTemplate(canvas, 'prewitEdge_img');        
    }
}

function onRobertButtonClicked() {
    if (bwEdgeImage) {
        const imageData = this.getImageDataFromImageSource(bwEdgeImage);
        const pixelArr = imageData.data;
        const width = imageData.width;
        imageData.data = detectEdgeByRobert(pixelArr, width);

        const canvas = generateImgSrcFromImageData(imageData);
        $('#robertEdge_img_btn_container').css('display', 'none');
        $('#robertEdge_img_container').css('display', 'inline-block');
        showImageInTemplate(canvas, 'robertEdge_img');
    }
}

function detectEdgeByPrewit(pixelArray, imgWidth) {  
    let prewittArray = [];

    // gri tonlarını bulup bir arrayde saklama
    const grayScale = [];
    for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
        grayScale[j] = (pixelArray[i] + pixelArray[i+1] + pixelArray[i+2]) / 3
    }

    // her pixele prewitt filtreleri uygulanması
    let northEastIndex, northIndex, northWestIndex, eastIndex, westIndex, southEastIndex, southIndex,  southWestIndex;
    let gX, gY; 
    for (let i = 0; i < grayScale.length; i++) {

        // pixel üst kenarda mı kontrolü
        if (i < imgWidth) {
            continue; 
        }

        // pixel alt kenarda mı kontrolü
        if (i > (pixelArray.length - imgWidth) ) {
            continue; 
        }

        // pixel  sol kenarda mı kontrolü
        if (i % imgWidth === 1) {
            continue; 
        }

        // pixel sağ kenarda mı kontrolü
        if (i % imgWidth === 1 ) {
            continue; 
        }

        northEastIndex = i - imgWidth - 1;
        northIndex = i - imgWidth;
        northWestIndex = i - imgWidth + 1;
        eastIndex = i - 1;
        westIndex = i + 1;
        southEastIndex = i + imgWidth - 1;
        southIndex = i + imgWidth;
        southWestIndex = i + imgWidth + 1;
        
        /*  Gx maskesi:
            [ -1  0 -1 ]
            [ -1  0 -1 ]
            [ -1  0 -1 ]
        */
        gX = Math.abs( grayScale[northWestIndex] + grayScale[westIndex] + grayScale[southWestIndex] 
                     - grayScale[northEastIndex] - grayScale[eastIndex] - grayScale[southEastIndex]);

        /*  Gy maskesi:
            [ 1  1  1 ]
            [ 0  0  0 ]
            [-1 -1 -1 ]
        */
        gY = Math.abs( grayScale[northEastIndex] + grayScale[northIndex] + grayScale[northWestIndex] 
                     - grayScale[southEastIndex] - grayScale[southIndex] - grayScale[southWestIndex]);
        
        prewittArray[i] = Math.sqrt(Math.pow(gX, 2) + Math.pow(gY, 2));
    }

    // gri tonları dizisini orjinal pixel dizisine (rgba) dönüştürme
    for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
        pixelArray[i] = prewittArray[j];
        pixelArray[i+1] = prewittArray[j];
        pixelArray[i+2] = prewittArray[j];
    }

    return pixelArray;
}

function detectEdgeByRobert(pixelArray, imgWidth) {
    let robertArray = [];

    // gri tonlarını bulup bir arrayde saklama
    const grayScale = [];
    for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
        grayScale[j] = (pixelArray[i] + pixelArray[i+1] + pixelArray[i+2]) / 3
    }

    // her pixele robert  filtreleri uygulanmsı
    let southPixelIndex,  southWestPixelIndex, westPixelIndex;
    let gX, gY; 
    for (let i = 0; i < grayScale.length; i++) {

        // pixel üst kenarda mı kontrolü
        if (i < imgWidth) {
            continue; 
        }

        // pixel alt kenarda mı kontrolü
        if (i > (pixelArray.length - imgWidth) ) {
            continue; 
        }

        // pixel  sol kenarda mı kontrolü
        if (i % imgWidth === 1) {
            continue; 
        }

        // pixel sağ kenarda mı kontrolü
        if (i % imgWidth === 1 ) {
            continue; 
        }
        
        /*  Gx maskesi:
            [ 1  0 ]
            [ 0 -1 ]
        */
        southWestPixelIndex = i + imgWidth + 1;
        gX = Math.abs( grayScale[i] - grayScale[southWestPixelIndex] );

        /*  Gy maskesi:
            [ 0 -1 ]
            [ 1  0 ]
        */
        westPixelIndex = i + 1; 
        southPixelIndex = i + imgWidth;
        gY = Math.abs( grayScale[westPixelIndex] - grayScale[southPixelIndex] );
        

        robertArray[i] = Math.sqrt(Math.pow(gX, 2) + Math.pow(gY, 2));
    }

    // gri tonları dizisini orjinal pixel dizisine (rgba) dönüştürme
    for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
        pixelArray[i] = robertArray[j];
        pixelArray[i+1] = robertArray[j];
        pixelArray[i+2] = robertArray[j];
    }

    return pixelArray;
}
