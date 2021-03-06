var xCustMobNo = null, ApplType = null;
window.onload = function () {
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    ApplType = sessionStorage.getItem('sesParamApplType');
    if (xCustMobNo === null || xCustMobNo === '' || ApplType === null || ApplType === '' || ApplType != '2') {
        window.location.href = './index.html';
    }
}

var btnIndAcc = document.getElementById('btnIndAcc');
var btnOrgAcc = document.getElementById('btnOrgAcc');

btnIndAcc.addEventListener('click', () => {
    sessionStorage.setItem('sesParamAccType', 'IND');
    var selLang = sessionStorage.getItem("selLanguage");
    if(selLang === "MR"){
        window.location.href = './CustAccIndForm_mr.html';
    }
    else{
        window.location.href = './CustAccIndForm.html';
    }
});

btnOrgAcc.addEventListener('click', () => {
    swal('Coming Soon...', '', 'info');
    /*
    sessionStorage.setItem('sesParamAccType', 'ORG');
    window.location.href = './CustAccOrgForm.html';
    */
});