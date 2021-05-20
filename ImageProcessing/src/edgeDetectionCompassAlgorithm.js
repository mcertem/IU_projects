let bwCompassImage;

$(document).ready(function () {

    $('#compass_btn').click(() => onCompassButtonClicked());
    $('#clearCompass_btn').click(() => clearCompassFileAndDrawings());

});

function clearCompassFileAndDrawings() {
    if (bwCompassImage) bwCompassImage = null;

    $('#compassFile').val('');
    $('#compassFileSelection_container').css('display', 'inline-block');

    $('#compass_img_btn_container').css('display', 'none');

    $('#original_compass_image_container').css('display', 'none');
    $('#compass_img_container').css('display', 'none');
}

function onRandomTemplateCompassFileSelected() {
    const randomFileId = Math.ceil(Math.random() * 4);

    const xhr = new XMLHttpRequest(); 
    xhr.open("GET", '../assets/img/odev2_ornekresim_' + randomFileId.toString() + '.jpg'); 
    xhr.responseType = "blob";
    xhr.onload = function() 
    {
        const blob = xhr.response;//xhr.response is now a blob object
        const file = new File([blob], 'ornek.jpg', {type: 'image/jpg', lastModified: Date.now()});
        onCompassFileSelected({ files: [file]});
    }
    xhr.send()
}

function onCompassFileSelected(input) {
    if (input.files && input.files[0]) {

        var reader = new FileReader();
        reader.onload = function (e) {
            bwCompassImage = e.target.result;
            showImageInTemplate(bwCompassImage, 'bwCompass_img');
            
        };
        reader.readAsDataURL(input.files[0]);
        

        $('#compassFileSelection_container').css('display', 'none');
        $('#original_compass_image_container').css('display', 'inline-block');

        $('#compass_img_btn_container').css('display', 'inline-block');
    }
}

function onCompassButtonClicked() {
    if (bwCompassImage) {
        const imageData = getImageDataFromImageSource(bwCompassImage);
        const pixelArr = imageData.data;
        const width = imageData.width;      
        imageData.data = applyCompassAlgorithm(pixelArr, width);


        const canvas = generateImgSrcFromImageData(imageData); 
        $('#compass_img_btn_container').css('display', 'none');
        $('#compass_img_container').css('display', 'inline-block');
        showImageInTemplate(canvas, 'compass_img');        
    }
}

function applyCompassAlgorithm(pixelArray, imgWidth) {  
    let compassArray = [];

    // gri tonlarını bulup bir arrayde saklama
    const grayScale = [];
    for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
        grayScale[j] = (pixelArray[i] + pixelArray[i+1] + pixelArray[i+2]) / 3
    }

    // 8 yön için filtre katsayılarının tanımlanması:
    // array içindeki katsayıları sırsaıyla NE, N, NW, E, center, W, SE, S, SW
	const g0   = {'ne':-1, 'n':-1, 'nw':-1, 'e': 1, 'c':-2, 'w': 1, 'se': 1, 's': 1, 'sw': 1};
    const g45  = {'ne':-1, 'n':-1, 'nw': 1, 'e':-1, 'c':-2, 'w': 1, 'se': 1, 's': 1, 'sw': 1};
    const g90  = {'ne':-1, 'n': 1, 'nw': 1, 'e':-1, 'c':-2, 'w': 1, 'se':-1, 's': 1, 'sw': 1};
    const g135 = {'ne': 1, 'n': 1, 'nw': 1, 'e':-1, 'c':-2, 'w': 1, 'se':-1, 's':-1, 'sw': 1};
    const g180 = {'ne': 1, 'n': 1, 'nw': 1, 'e': 1, 'c':-2, 'w': 1, 'se':-1, 's':-1, 'sw':-1};
    const g225 = {'ne': 1, 'n': 1, 'nw': 1, 'e': 1, 'c':-2, 'w':-1, 'se': 1, 's':-1, 'sw':-1};
    const g315 = {'ne': 1, 'n':-1, 'nw':-1, 'e': 1, 'c':-2, 'w':-1, 'se': 1, 's': 1, 'sw': 1};
    const g270 = {'ne': 1, 'n': 1, 'nw':-1, 'e': 1, 'c':-2, 'w':-1, 'se': 1, 's': 1, 'sw':-1};
    const gCoefficientsSet = new Set([g0, g45, g90, g135, g180, g225, g225, g270, g315]);

    // her pixele compass algoritması uygulanması
    let northEastIndex, northIndex, northWestIndex, eastIndex, westIndex, southEastIndex, southIndex,  southWestIndex;
    let tmpCompassFilterForPixel;
    
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

        for (let g of gCoefficientsSet) {
            tmpCompassFilterForPixel = g.ne * grayScale[northEastIndex] +
                                        g.n * grayScale[northIndex] +
                                        g.nw * grayScale[northWestIndex] +
                                        g.e * grayScale[eastIndex] +
                                        g.c * grayScale[i] +
                                        g.w * grayScale[westIndex] +
                                        g.se * grayScale[southEastIndex] +
                                        g.s * grayScale[southIndex] +
                                        g.sw * grayScale[southWestIndex];

            if (!compassArray[i] || compassArray[i] < tmpCompassFilterForPixel) {
                compassArray[i] = tmpCompassFilterForPixel;
            }
        }
    }

    // gri tonları dizisini orjinal pixel dizisine (rgba) dönüştürme
    for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
        pixelArray[i] = compassArray[j];
        pixelArray[i+1] = compassArray[j];
        pixelArray[i+2] = compassArray[j];
    }

    return pixelArray;
}