/* Cropper Util*/

const initCropperBtn = document.getElementById("initCropperBtn");
const destroyCropperBtn = document.getElementById("destroyCropperBtn");
const cropBtn = document.getElementById("cropBtn");

const initCropperBtnAddr = document.getElementById("initCropperBtnAddr");
const destroyCropperBtnAddr = document.getElementById("destroyCropperBtnAddr");
const cropBtnAddr = document.getElementById("cropBtnAddr");

var docAddrCanvas = document.querySelector('#docAddrCanvas');

var cropper;
var model;
var cropperCanCtx = null;


initCropperBtn.addEventListener("click", () => {
    var ddlDocType = document.getElementById('ddlDocType');
    cropperCanCtx = null;
    var selDocValue = ddlDocType.value;
    var selCanId = 'docphotocanvas' + selDocValue;
    cropperCanCtx = document.getElementById(selCanId);
    // if (ddlDocType.value === '0') {
    //     cropperCanCtx = docSignCanvas;
    // }
    // else {
    //     cropperCanCtx = docphotocanvas;
    // }
    initializeCropper(cropperCanCtx);
    loadModel();
    // cropBtn.disabled = false;
    initCropperBtn.style.display = 'none';
    destroyCropperBtn.style.display = 'block';
    cropBtn.style.display = 'block';
})

cropBtn.addEventListener("click", () => {
    if (cropperCanCtx != null) {
        cropped(cropperCanCtx);
    }
    else {
        swal('Alert!', 'Please Initialize Cropper!', 'error');
    }
})

function initializeCropper(CanvasCtx) {
    if (cropper) {
        cropper.destroy();
    }
    cropper = new Cropper(CanvasCtx);
    if (CanvasCtx.id === 'docAddrCanvas') {
        document.getElementById('anchordocAddrCanvas').removeAttribute('href');
        document.getElementById('anchordocAddrCanvas').removeAttribute('data-lightbox');
    }
    else {
        debugger;
        var selAncId = 'anchor' + CanvasCtx.id;
        document.getElementById(selAncId).removeAttribute('href');
        document.getElementById(selAncId).removeAttribute('data-lightbox');
    }



    // if (CanvasCtx.id === 'docAddrCanvas') {
    //     document.getElementById('anchordocAddrCanvas').removeAttribute('href');
    //     document.getElementById('anchordocAddrCanvas').removeAttribute('data-lightbox');
    // }
    // else if (CanvasCtx.id === 'docSignCanvas') {
    //     document.getElementById('anchordocSignCanvas').removeAttribute('href');
    //     document.getElementById('anchordocSignCanvas').removeAttribute('data-lightbox');
    // }
    // else {
    //     document.getElementById('anchordocphotocanvas').removeAttribute('href');
    //     document.getElementById('anchordocphotocanvas').removeAttribute('data-lightbox');
    // }
}

async function loadModel() {
    model = await mobilenet.load();
}

function cropped(cropCanvasCtx) {
    if (!cropper) {
        swal('Alert!', 'Please Initialize Cropper!', 'error');
        return;
    }
    const croppedDataURL = cropper.getCroppedCanvas().toDataURL();
    cropper.destroy();
    if (cropCanvasCtx.id === 'docAddrCanvas') {
        initCropperBtnAddr.style.display = 'block';
        destroyCropperBtnAddr.style.display = 'none';
    }
    else {
        initCropperBtn.style.display = 'block';
        destroyCropperBtn.style.display = 'none';
        cropBtn.style.display = 'none';
    }

    reClearPhotoCanvas(cropCanvasCtx);
    var context = cropCanvasCtx.getContext('2d');
    cropCanvasCtx.width = width;
    cropCanvasCtx.height = height;
    var croppedImage = new Image();
    croppedImage.src = croppedDataURL;
    croppedImage.onload = function () {
        context.drawImage(croppedImage, 0, 0, width, height);
        // cropBtn.disabled = true;
        if (cropCanvasCtx.id === 'docAddrCanvas') {
            document.getElementById('anchordocAddrCanvas').setAttribute('href', croppedDataURL);
            document.getElementById('anchordocAddrCanvas').setAttribute('data-lightbox', 'lightImgAddrCanvas');
        }
        else {
            var selAncId = 'anchor' + cropCanvasCtx.id;
            document.getElementById(selAncId).setAttribute('href', croppedDataURL);
            document.getElementById(selAncId).setAttribute('data-lightbox', 'lightImgdocphotoCanvas');
        }

        // if (cropCanvasCtx.id === 'docAddrCanvas') {
        //     document.getElementById('anchordocAddrCanvas').setAttribute('href', croppedDataURL);
        //     document.getElementById('anchordocAddrCanvas').setAttribute('data-lightbox', 'lightImgAddrCanvas');
        // }
        // else if (cropCanvasCtx.id === 'docSignCanvas') {
        //     document.getElementById('anchordocSignCanvas').setAttribute('href', croppedDataURL);
        //     document.getElementById('anchordocSignCanvas').setAttribute('data-lightbox', 'lightImgdocSignCanvas');
        // }
        // else {
        //     document.getElementById('anchordocphotocanvas').setAttribute('href', croppedDataURL);
        //     document.getElementById('anchordocphotocanvas').setAttribute('data-lightbox', 'lightImgdocphotoCanvas');
        // }
    };
}

destroyCropperBtn.addEventListener('click', () => {
    if (!cropper) {
        initCropperBtn.style.display = 'block';
        destroyCropperBtn.style.display = 'none';
        cropBtn.style.display = 'none';
    }
    else {
        cropper.destroy();
        initCropperBtn.style.display = 'block';
        destroyCropperBtn.style.display = 'none';
        cropBtn.style.display = 'none';
    }
    if (cropperCanCtx.id === 'docSignCanvas') {
        document.getElementById('anchordocSignCanvas').setAttribute('href', cropperCanCtx.toDataURL());
        document.getElementById('anchordocSignCanvas').setAttribute('data-lightbox', 'lightImgdocSignCanvas');
    }
    else {
        var selAncId = 'anchor' + cropperCanCtx.id;
        document.getElementById(selAncId).setAttribute('href', cropperCanCtx.toDataURL());
        document.getElementById(selAncId).setAttribute('data-lightbox', 'lightImgdocphotoCanvas');
    }
});

function reClearPhotoCanvas(cropCanvas) {
    var context = cropCanvas.getContext('2d');
    context.fillStyle = "#fff";
    context.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
}




/* Address Cropper */
initCropperBtnAddr.addEventListener("click", () => {
    cropperCanCtx = null;
    cropperCanCtx = docAddrCanvas;
    initializeCropper(cropperCanCtx);
    loadModel();
    cropBtnAddr.disabled = false;
    initCropperBtnAddr.style.display = 'none';
    destroyCropperBtnAddr.style.display = 'block';
})

cropBtnAddr.addEventListener("click", () => {
    if (cropperCanCtx != null) {
        cropped(cropperCanCtx);
    }
    else {
        alertify.error('Please Initialize Cropper!');
    }
})

destroyCropperBtnAddr.addEventListener('click', () => {
    if (!cropper) {
        initCropperBtnAddr.style.display = 'block';
        destroyCropperBtnAddr.style.display = 'none';
        cropBtnAddr.disabled = true;
    }
    else {
        cropper.destroy();
        initCropperBtnAddr.style.display = 'block';
        destroyCropperBtnAddr.style.display = 'none';
        cropBtnAddr.disabled = true;
    }
    document.getElementById('anchordocAddrCanvas').setAttribute('href', docAddrCanvas.toDataURL());
    document.getElementById('anchordocAddrCanvas').setAttribute('data-lightbox', 'lightImgAddrCanvas');
});