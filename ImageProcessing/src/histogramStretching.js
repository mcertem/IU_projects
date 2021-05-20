let bwImage;

$(document).ready(function () {

    $('#histogramScretch_btn').click(() => onScretchImageButtonClicked());
    $('#histogramEqualization_btn').click(() => onEqualizeImageButtonClicked());
    $('#clear_btn').click(() => clearFileAndDrawings1());


});

function clearFileAndDrawings1() {
    if (bwImage) bwImage = null;

    $('#file').val('');
    $('#fileSelection_container').css('display', 'inline-block');

    $('#scretched_img_btn_container').css('display', 'none');
    $('#equalizated_img_btn_container').css('display', 'none');

    $('#original_image_container').css('display', 'none');
    $('#scretched_img_container').css('display', 'none');
    $('#equalizated_img_container').css('display', 'none');

    Plotly.purge(document.getElementById('histogram_main'));
    Plotly.purge(document.getElementById('histogram_scretched'));    
    Plotly.purge(document.getElementById('histogram_equalizated'));

    $('#histogram_main_container').css('display', 'none');
    $('#histogram_scretched_container').css('display', 'none');
    $('#histogram_equalizated_container').css('display', 'none');
}

function onRandomTemplateFileSelected1() {
    const randomFileId = Math.ceil(Math.random() * 3);

    const xhr = new XMLHttpRequest(); 
    xhr.open("GET", '../assets/img/odev1_ornekresim_' + randomFileId.toString() + '.jpg'); 
    xhr.responseType = "blob";
    xhr.onload = function() 
    {
        const blob = xhr.response;//xhr.response is now a blob object
        const file = new File([blob], 'ornek.jpg', {type: 'image/jpg', lastModified: Date.now()});
        onFileSelected1({ files: [file]});
    }
    xhr.send()
}

function onFileSelected1(input) {
    if (input.files && input.files[0]) {

        var reader = new FileReader();
        reader.onload = function (e) {
            bwImage = e.target.result;
            showImageInTemplate(bwImage, 'bw_img');
            setTimeout( () => showGrayScaleHistogram(getImageDataFromImageSource(bwImage).data, 'histogram_main') , 100 );
            
        };
        reader.readAsDataURL(input.files[0]);
        

        $('#fileSelection_container').css('display', 'none');
        $('#original_image_container').css('display', 'inline-block');

        $('#scretched_img_btn_container').css('display', 'inline-block');
        $('#equalizated_img_btn_container').css('display', 'inline-block');
    }
}

function onScretchImageButtonClicked() {
    if (bwImage) {
        const imageData = getImageDataFromImageSource(bwImage);
        const pixelArr = imageData.data;        
        imageData.data = scretchHistogram(pixelArr);


        const scretchedCanvas = generateImgSrcFromImageData(imageData); 
        $('#scretched_img_btn_container').css('display', 'none');
        $('#scretched_img_container').css('display', 'inline-block');
        showImageInTemplate(scretchedCanvas, 'scretched_img');
        setTimeout( () => showGrayScaleHistogram(imageData.data, 'histogram_scretched'), 100 );
        
    }
}

function onEqualizeImageButtonClicked() {
    if (bwImage) {
        const imageData = this.getImageDataFromImageSource(bwImage);
        const pixelArr = imageData.data;
        imageData.data = equalizeHistogram(pixelArr);

        const equalizedCanvas = generateImgSrcFromImageData(imageData);
        $('#equalizated_img_btn_container').css('display', 'none');
        $('#equalizated_img_container').css('display', 'inline-block');
        showImageInTemplate(equalizedCanvas, 'equalizated_img');
        setTimeout( () => showGrayScaleHistogram(imageData.data, 'histogram_equalizated'), 100 );
    }
}

function scretchHistogram(pixelArray, newMinTone = 0, newMaxTone = 255) {  
    const srcLength = pixelArray.length;
    let scretchedArray = pixelArray;

    // gri tonlarını bulup bir arrayde saklama
    const grayScale = [];
    for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
        grayScale[j] = (pixelArray[i] + pixelArray[i+1] + pixelArray[i+2]) / 3
    }

    // Tonların min ve max değerini bulma:
    let oldMinTone = 255;
    let oldMaxTone = 0;
    for (let i = 0; i < grayScale.length; i++) {
        if (grayScale[i] < oldMinTone) {
            oldMinTone = grayScale[i];
        }
        if (grayScale[i] > oldMaxTone) {
            oldMaxTone = grayScale[i];
        }
    }

    // genişletilmiş görsel için piksel verilerini oluşturma
    for (let i = 0; i < srcLength; i++) {
        scretchedArray[i] = ((newMaxTone - newMinTone) / (oldMaxTone - oldMinTone) ) 
                            * (pixelArray[i] - oldMinTone)
                            + newMinTone;
    }

    return scretchedArray;
}

function equalizeHistogram(pixelArray) {
    const srcLength = pixelArray.length;
    let equalizedArray = pixelArray;

    // histogramı ve her ton için toplamları oluşturma:
    const hist = new Float32Array(256);
    let sum = 0;
    for (let i = 0; i < srcLength; i++) {
        ++hist[~~pixelArray[i]];
        ++sum;
    }

    // histogramdaki verileri kümüle veri haline getirme:
    let prev = hist[0];
    for (let i = 1; i < 256; i++) {
        hist[i] += prev;
        prev = hist[i];
    }

    // histogram eşitleme:
    var norm = 255 / sum;
    for (let i = 0; i < srcLength; i++) {
        equalizedArray[i] = hist[~~pixelArray[i]] * norm;
    }

    return equalizedArray;
}

function showGrayScaleHistogram(data, histogramTag) {
    const grayScale = [];
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        grayScale[j] = (data[i] + data[i+1] + data [i+2]) / 3
    }
    showHistogram(grayScale, histogramTag);
}

function showHistogram(data, histogramTag) {
    const hist = new Float32Array(256);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        ++hist[~~data[i]];
        ++sum;
    }
    
    const histogramContainer = document.getElementById(histogramTag);
    $('#' + histogramTag + '_container').css('display', 'initial');
    Plotly.plot( histogramContainer, [{ x: Array.from(hist.keys()), y: hist }], { margin: { t: 0 } } );
}