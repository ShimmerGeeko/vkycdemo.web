window.onload = function () {
    // var sesCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    var sesApplType = sessionStorage.getItem('sesParamApplType');
    if (sesApplType === null || sesApplType === '') {
        window.location.href = './index.html';
    }
}