var opUserId, opUserCode, opUserRole, xCustId, xCustMobNo, JointCustIdFlag;
window.onload = function () {
    opUserId = null, opUserCode = null, opUserRole = null, xCustId = null, xCustMobNo = null;
    opUserId = sessionStorage.getItem("sesParamOpUserId");
    opUserCode = sessionStorage.getItem("sesParamOpUserCode");
    opUserRole = sessionStorage.getItem("sesParamOpUserRole");
    xCustId = sessionStorage.getItem("sesParamSelectedAuthCustId");
    xCustMobNo = sessionStorage.getItem("sesParamSelectedAuthCustMobNo");
    if (opUserId === null || opUserId === '' || opUserCode === null || opUserCode === '' || opUserRole === null || opUserRole === '') {
        window.location.href = './index.html';
    }
    else if (xCustId === null || xCustId === '' || xCustMobNo === null || xCustMobNo === '') {
        window.location.href = './AuthorizerDashboard.html';
    }
    else {
        // document.getElementById('upperUsername').innerHTML = opUserId;
        boolInit = true;
        boolInitSwal = true;
        swal({
            title: "Loading...",
            text: "Please Wait",
            // type: "info",
            // icon: "info",
            imageUrl: "../images/Loader-Ellipsis-244px.gif",
            // imageUrl: "../images/incommingCall.gif",
            buttons: false,
            // showConfirmButton: false,
            // showCancelButton: false,
            // closeOnConfirm: false,
            // showLoaderOnConfirm: false,
            allowOutsideClick: false
        });
        GetPendingAuthCustData(opUserCode, opUserId, xCustId);
    }
}


var anchors = $("#menuTabs li a").click(function () {
    //savesubcat()
    $(this).addClass("active")
    anchors.not(this).removeClass("active")
})


function InitAuth(type) {
    if (type === '1') {
        initAuthorizeAjax("A_ACCEPT", 'NA');
    }
    else if (type === '2') {
        alertify.prompt('Reason For REJECTION', ''
            , function (evt, value) {
                if (value.trim() === '') {
                    return false;
                    // alertify.error('Oops! Reason cannot Be Blank!')
                }
                else {
                    initAuthorizeAjax("A_REJECT", value.trim());
                }
            }
            , function () {
                alertify.error('Please Enter Reason/Remark!')
            });
    }
    else if (type === '3') {
        alertify.prompt('Reason For HOLD', ''
            , function (evt, value) {
                if (value.trim() === '') {
                    return false;
                    // alertify.error('Oops! Reason cannot Be Blank!')
                }
                else {
                    initAuthorizeAjax("A_HOLD", value.trim());
                }
            }
            , function () {
                alertify.error('Please Enter Reason/Remark!')
            });
    }
}

function initAuthorizeAjax(actionType, Reason) {
    var Data = {
        UserCode: opUserCode,
        UserId: opUserId,
        UserRole: opUserRole,
        CustId: xCustId,
        CustMobNo: xCustMobNo,
        ActionType: actionType,
        CreatedByIP: '',
        Remark: Reason
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/AuthorizerAuthAHR",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                swal({
                    title: "Success!",
                    text: "Operation Completed Successfully",
                    type: "success"
                }, function () {
                    window.location.href = './AuthorizerDashboard.html';
                });
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
            }
        },
        error: function (err) {
            swal('Alert!', err, 'error');
        }
    });
}

function GetPendingAuthCustData(opUserCode, opUserId, xCustId) {
    var Data = {
        UserCode: opUserCode,
        UserId: opUserId,
        CustId: xCustId
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/PendingAuthCustomerData",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {

            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                var rBasicInfo = responseJSON.CustomerBasicInfo;
                var rAadhaar = responseJSON.Uiddata;
                var rPAN = responseJSON.PanModelData;
                var rMedia = responseJSON.MediaData;
                var ApplType = responseJSON.ApplType;
                var CCData = responseJSON.CreditCardData;
                debugger;

                var ExistingCC = ''

                if(CCData.ExistingCC === "Y"){
                    ExistingCC = 'Yes'
                }
                else{
                    ExistingCC = 'No'
                }


                var ApplicationType = ''
                if(ApplType === 1){
                    ApplicationType = "BASIC VKYC"
                }
                else if(ApplType === 2){
                    ApplicationType = "ACCOUNT OPENING"
                }
                else if(ApplType === 3){
                    ApplicationType = "CREDIT CARD"
                }
                else if(ApplType === 4){
                    ApplicationType = "RE KYC"
                }
                else if(ApplType === 5){
                    ApplicationType = "LOAN APPLICATION"
                }

                if (responseJSON.JoinRefIds.length > 0 && ApplType === 2) {
                    toggleSideTabs(rBasicInfo.CustId, rBasicInfo.CustMobNo, responseJSON.JoinRefIds)
                    document.getElementById('leftBlock').style.display = "block";
                    $("#rightBlock").addClass('col-lg-10 col-md-10 col-sm-10 col-xs-10 card');
                    // document.getElementById('rightBlock').addClassName = "col-lg-10 col-md-10 col-sm-10 col-xs-10 card";
                }
                else {
                    $("#rightBlock").addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12 card');
                    document.getElementById('leftBlock').style.display = "none";
                    // document.getElementById('rightBlock').addClassName = "col-lg-12 col-md-12 col-sm-12 col-xs-12 card";
                }

                var headerInfo = document.getElementById('headerInfo');
                var headerInfoAcc = document.getElementById('headerInfoAcc');
                var divBasicInfo = document.getElementById('divBasicInfo');
                var divBasicInfoAcc = document.getElementById('divBasicInfoAcc');
                var withMinor1 = document.getElementById('withMinor1');
                var withMinor2 = document.getElementById('withMinor2');
                var withoutMinor1 = document.getElementById('withoutMinor1');
                var withoutMinor2 = document.getElementById('withoutMinor2');
                var withoutMinor3 = document.getElementById('withoutMinor3');

                var ModeOfOperation = '';
                var AccountType = '';
                if (ApplType === 2) {
                    LoadDatatable(responseJSON.NomineeDatas);
                    headerInfo.style.display = 'none';
                    divBasicInfo.style.display = 'none';
                    headerInfoAcc.style.display = 'block';
                    divBasicInfoAcc.style.display = 'block';
                    JointCustIdFlag = "False"

                    if (responseJSON.ModeOfOperation === 1) {
                        ModeOfOperation = "SELF"
                    }
                    else if (responseJSON.ModeOfOperation === 2) {
                        ModeOfOperation = "JOINT"
                    }
                    else if (responseJSON.ModeOfOperation === 3) {
                        ModeOfOperation = "ANYONE"
                    }
                    else if (responseJSON.ModeOfOperation === 4) {
                        ModeOfOperation = "EITHER OR SURVIVOR"
                    }
                    else if (responseJSON.ModeOfOperation === 5) {
                        ModeOfOperation = "FATHER GUARDIAN"
                    }
                    else if (responseJSON.ModeOfOperation === 6) {
                        ModeOfOperation = "MOTHER GUARDIAN"
                    }
                    else if (responseJSON.ModeOfOperation === 7) {
                        ModeOfOperation = "LEGAL GUARDIAN"
                    }


                    if (responseJSON.AccountType === 1) {
                        AccountType = 'NORMAL'
                    }
                    else if (responseJSON.AccountType === 2) {
                        AccountType = 'SENIOR CITIZEN'
                    }
                    else if (responseJSON.AccountType === 3) {
                        AccountType = 'MINOR'
                    }
                }
                else {
                    headerInfo.style.display = 'block';
                    divBasicInfo.style.display = 'block';
                    headerInfoAcc.style.display = 'none';
                    divBasicInfoAcc.style.display = 'none';
                    JointCustIdFlag = "True"



                    if(ApplType === 3) {
                        //Diplay CC Fileds
                        // document.getElementById('bCreditCard').style.display = 'block';
                        document.getElementById('bCreditCard').value = ExistingCC;
                        document.getElementById('bBankName').value = CCData.ExBankName;
                        document.getElementById('bCardLimit').value = CCData.ExCCLimit;
                        document.getElementById('bSalaryAcc').value = CCData.SalaryAccBankName;
                        document.getElementById('bCompanyName').value = CCData.CompanyName;
                    }
                    else {
                        //Hide CC Fileds
                        document.getElementById('divCreditCard').style.display = 'none';
                        document.getElementById('divBankName').style.display = 'none';
                        document.getElementById('divCardLimit').style.display = 'none';
                        document.getElementById('divSalaryAcc').style.display = 'none';
                        document.getElementById('divCompanyName').style.display = 'none';
                    }
    
                }



                if (responseJSON.AccountType === 3 && ApplType === 2) {
                    withMinor1.style.display = 'block';
                    withMinor2.style.display = 'block';
                    withoutMinor1.style.display = 'none';
                    withoutMinor2.style.display = 'none';
                    withoutMinor3.style.display = 'none';
                }
                else {
                    withMinor1.style.display = 'none';
                    withMinor2.style.display = 'none';
                    withoutMinor1.style.display = 'block';
                    withoutMinor2.style.display = 'block';
                    withoutMinor3.style.display = 'block';
                }

                //Header Info

                

                document.getElementById('CustId').value = rBasicInfo.CustId;
                document.getElementById('hTitle').value = responseJSON.Title;;
                document.getElementById('hName').value = rBasicInfo.Name;
                document.getElementById('hMobile').value = rBasicInfo.CustMobNo;
                // document.getElementById('hVeriCode').value = responseJSON.VerificationCode;
                document.getElementById('hApplType').value = ApplicationType;
                document.getElementById('hPAN').value = rPAN.pan;
                document.getElementById('hGender').value = rBasicInfo.Gender;
                document.getElementById('hDOB').value = rBasicInfo.DOB;
                // document.getElementById('hIndOthers').value = "Individual Account";
                // document.getElementById('hProductType').value = responseJSON.ProductType;
                // document.getElementById('hAccountType').value = AccountType;
                // document.getElementById('hModeOfOpertion').value = ModeOfOperation;
                // document.getElementById('hAadhaar').value = rBasicInfo.aadharNumberonDetail;



                // Header Info Account
                document.getElementById('aCustId').value = rBasicInfo.CustId;
                document.getElementById('aTitle').value = responseJSON.Title;;
                document.getElementById('aName').value = rBasicInfo.Name;
                document.getElementById('aMobile').value = rBasicInfo.CustMobNo;
                // document.getElementById('aVeriCode').value = responseJSON.VerificationCode;
                document.getElementById('aPAN').value = rPAN.pan;
                // document.getElementById('aGender').value = rBasicInfo.Gender;
                // document.getElementById('aDOB').value = rBasicInfo.DOB;
                document.getElementById('aIndOthers').value = "Individual Account";
                document.getElementById('aProductType').value = responseJSON.ProductType;
                document.getElementById('aAccountType').value = AccountType;
                document.getElementById('aModeOfOpertion').value = ModeOfOperation;



                //Basic Info
                document.getElementById('bFatherName').value = rBasicInfo.FatherName;
                document.getElementById('bMotherName').value = rBasicInfo.MotherName;
                document.getElementById('bMarStatus').value = rBasicInfo.MaritalStatus;
                document.getElementById('bEmail').value = rBasicInfo.Email;
                document.getElementById('bOcc').value = rBasicInfo.Occupation;
                document.getElementById('bIncome').value = rBasicInfo.AnnualIncome;
                document.getElementById('bPol').value = rBasicInfo.PolitcallyExpYN;
                // document.getElementById('bAdd').value = "HOUSE: " + rBasicInfo.house + " LOCALITY: "
                //     + rBasicInfo.locality + " LANDMARK: " + rBasicInfo.landmark + " CITY: " + rBasicInfo.city + " " + " DISTRICT: " + rBasicInfo.district + " STATE: " + rBasicInfo.state;
                document.getElementById('bAdd').value = "HOUSE: " + rBasicInfo.House + ". LOCALITY: " + rBasicInfo.Locality
                    + ". LANDMARK: " + rBasicInfo.Landmark + ". CITY: " + rBasicInfo.City + ". PIN: " + rBasicInfo.PinCode
                    + ". DISTRICT: " + rBasicInfo.District + ". STATE: " + rBasicInfo.State;

                if(responseJSON.ApplType === 4){
                    debugger;
                    loadCityData(rBasicInfo);
                }
            

                // Besic Info Account
                var TDSYN = ''
                if (responseJSON.TDSYN === "Y") {
                    TDSYN = "YES"
                }
                else {
                    TDSYN = "NO"
                }

                var ChequeBookYN = ''
                if (responseJSON.ChequeBookYN === "Y") {
                    ChequeBookYN = "YES"
                }
                else {
                    ChequeBookYN = "NO"
                }

                var ATMCardYN = ''
                if (responseJSON.ATMCardYN === "Y") {
                    ATMCardYN = "YES"
                }
                else {
                    ATMCardYN = "NO"
                }

                var INETBankingYN = ''
                if (responseJSON.INETBankingYN === "Y") {
                    INETBankingYN = "YES"
                }
                else {
                    INETBankingYN = "NO"
                }

                var NomineeYN = ''
                if (responseJSON.NomineeYN === "Y") {
                    NomineeYN = "YES"
                }
                else {
                    NomineeYN = "NO"
                }
                document.getElementById('cFatherName').value = rBasicInfo.FatherName;
                document.getElementById('cMotherName').value = rBasicInfo.MotherName;
                document.getElementById('cMarStatus').value = rBasicInfo.MaritalStatus;
                document.getElementById('cEmail').value = rBasicInfo.Email;
                document.getElementById('cOcc').value = rBasicInfo.Occupation;
                document.getElementById('cIncome').value = rBasicInfo.AnnualIncome;
                document.getElementById('cPol').value = rBasicInfo.PolitcallyExpYN;
                document.getElementById('cGuardianName').value = rBasicInfo.GuardianName;
                document.getElementById('cGuardianDOB').value = rBasicInfo.GuardianDOB;
                document.getElementById('cTDSYN').value = TDSYN;
                document.getElementById('cChequeBookYN').value = ChequeBookYN;
                document.getElementById('cATMCardYN').value = ATMCardYN;
                document.getElementById('cINETBankingYN').value = INETBankingYN;
                document.getElementById('cNomineeYN').value = NomineeYN;
                document.getElementById('cAdd').value = "HOUSE: " + rBasicInfo.House + ". LOCALITY: " + rBasicInfo.Locality
                    + ". LANDMARK: " + rBasicInfo.Landmark + ". CITY: " + rBasicInfo.City + ". PIN: " + rBasicInfo.PinCode
                    + ". DISTRICT: " + rBasicInfo.District + ". STATE: " + rBasicInfo.State;
                    
                    
                //Aadhaar Info
                // document.getElementById('aAadhaar').value = rBasicInfo.aadharNumberonDetail;
                document.getElementById('aCareOf').value = rAadhaar.Poa._careof;
                document.getElementById('adName').value = rAadhaar.Poi._name;
                document.getElementById('aGender').value = rAadhaar.Poi._gender;
                document.getElementById('aDOB').value = rAadhaar.Poi._dob;
                // document.getElementById('aAddr').value = "HOUSE: " + rAadhaar.houseonAadhaar + " LOCALITY: "
                //     + rAadhaar.loconAadhaar + " LANDMARK: " + rAadhaar.landmarkonAadhaar + " CITY: " + rAadhaar.vtconAadhaar + " " + " DISTRICT: " + rAadhaar.distonAadhaar + " STATE: " + rAadhaar.stateonAadhaar;
                document.getElementById('aAddr').value = "HOUSE: " + rAadhaar.Poa._house + ". LOCALITY: " + rAadhaar.Poa._loc
                    + ". PO: " + rAadhaar.Poa._po + ". STREET: " + rAadhaar.Poa._street
                    + ". LANDMARK: " + rAadhaar.Poa._landmark + ". CITY: " + rAadhaar.Poa._vtc + ". PIN: " + rAadhaar.Poa._pc
                    + ". DISTRICT: " + rAadhaar.Poa._dist + ". STATE: " + rAadhaar.Poa._state;

                var xDocPhoto = document.getElementById('aImg');
                xDocPhoto.src = "data:image/png;base64, " + rAadhaar.Pht;


                //PAN Info
                document.getElementById('pFname').value = rPAN.first_name;
                document.getElementById('pMname').value = rPAN.middle_name;
                document.getElementById('pLname').value = rPAN.last_name;
                document.getElementById('pFullName').value = rPAN.full_name;
                document.getElementById('pStatus').value = rPAN.status;
                document.getElementById('pCat').value = rPAN.category;
                document.getElementById('pLupd').value = rPAN.last_updated;

                //LatLong
                document.getElementById('mLat').value = responseJSON.Latitude;
                document.getElementById('mLong').value = responseJSON.Longitude;
                document.getElementById('mVeriCode').value = responseJSON.VerificationCode;

                //Media
                document.getElementById('mCustImg').src = rMedia.ImgCustomer;
                document.getElementById('anchormCustImg').href = rMedia.ImgCustomer;

                document.getElementById('mDocImg').src = rMedia.ImgDocument;
                document.getElementById('anchormDocImg').href = rMedia.ImgDocument;

                document.getElementById('mSignImg').src = rMedia.ImgSignature;
                document.getElementById('anchormSignImg').href = rMedia.ImgSignature;
                fetch('data:video/webm;base64,' + rMedia.VideoSession)
                    .then(res => res.blob())
                    .then(function (resBlob) {
                        document.getElementById('mSessionVideo').src = window.URL.createObjectURL(resBlob);
                    });

                // document.getElementById('mSessionVideo').src = rMedia.videotest;
                // document.getElementById('mSessionVideo').src = "data:video/webm;base64," + rMedia.videotest;
                if (rMedia.ImgPOA != 'NA' && rMedia.ImgPOA != null && rMedia.ImgPOA != '') {
                    document.getElementById('divAddrImg').style.display = 'block';
                    document.getElementById('mAddrImg').src = rMedia.ImgPOA;
                    document.getElementById('anchormAddrImg').href = rMedia.ImgPOA;
                }
                else {
                    document.getElementById('divAddrImg').style.display = 'none';
                }
                swal.close();

                var ancNominee = document.getElementById('ancNominee');
                if (responseJSON.NomineeDatas.length === 0) {
                    ancNominee.style.display = 'none';
                }
                else {
                    ancNominee.style.display = 'block';
                }
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function LoadDatatable(data) {
    var table = $('#tblLiveNominee').DataTable({
        "aaData": data,
        "columns": [{
            "data": "NomineeNo"
        }, {
            "data": "NomineeTitle"
        }, {
            "data": "NomineeName"
        }, {
            "data": "NomineeRltn"
        }, {
            "data": "NomineeDob"
        }, {
            "data": "NomineeAdd1"
        }, {
            "data": "NomineeAdd2"
        }, {
            "data": "NomineeAdd3"
        }]

    });
}

function toggleDiv(index) {
    // var tab0 = document.getElementById('ancBasic');
    // var tab1 = document.getElementById('ancAadhaar');
    // var tab2 = document.getElementById('ancPan');
    // var tab3 = document.getElementById('ancRec');
    // var tab4 = document.getElementById('ancNominee');

    var divBasicInfo = document.getElementById('divBasicInfo');
    var divBasicInfoAcc = document.getElementById('divBasicInfoAcc');
    var divAadhaar = document.getElementById('divAadhaar');
    var divPAN = document.getElementById('divPAN');
    var divMedia = document.getElementById('divMedia');
    var divNominee = document.getElementById('divNominee');

    if (JointCustIdFlag === "True") {
        if (index === '0') {
            divBasicInfo.style.display = 'block';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'none';
            divMedia.style.display = 'none';
            divNominee.style.display = 'none';
        }
        else if (index === '1') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'block';
            divPAN.style.display = 'none';
            divMedia.style.display = 'none';
            divNominee.style.display = 'none';
        }
        else if (index === '2') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'block';
            divMedia.style.display = 'none';
            divNominee.style.display = 'none';
        }
        else if (index === '3') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'none';
            divMedia.style.display = 'block';
            divNominee.style.display = 'none';
        }
        else if (index === '4') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'none';
            divMedia.style.display = 'none';
            divNominee.style.display = 'block';
        }
    }
    else {
        if (index === '0') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'block';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'none';
            divMedia.style.display = 'none';
            divNominee.style.display = 'none';
        }
        else if (index === '1') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'block';
            divPAN.style.display = 'none';
            divMedia.style.display = 'none';
            divNominee.style.display = 'none';
        }
        else if (index === '2') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'block';
            divMedia.style.display = 'none';
            divNominee.style.display = 'none';
        }
        else if (index === '3') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'none';
            divMedia.style.display = 'block';
            divNominee.style.display = 'none';
        }
        else if (index === '4') {
            divBasicInfo.style.display = 'none';
            divBasicInfoAcc.style.display = 'none';
            divAadhaar.style.display = 'none';
            divPAN.style.display = 'none';
            divMedia.style.display = 'none';
            divNominee.style.display = 'block';
        }
    }


}



function toggleSideTabs(primaryCustId, primaryCustMobNo, RefIdsList) {

    $("#nav-tabs-wrapper").append("<li class=\"active\"><a class=\"jointAnc\" data-refId=\"" + primaryCustId + "\">" + primaryCustMobNo + "  <small>(Primary)</small>" + "</a></li>");
    for (var i = 0; i < RefIdsList.length; i++) {
        $("#nav-tabs-wrapper").append("<li><a class=\"jointAnc\" data-refId=\"" + RefIdsList[i].CustId + "\">" + RefIdsList[i].CustMobNo + "</a></li>");
    }
}

$(document).on('click', '.jointAnc', function () {
    debugger;
    var JointCustId = $(this).attr('data-refId');
    $('#nav-tabs-wrapper > li').removeClass();
    $(this).parent().addClass('active');
    GetPendingAuthJointCustIdData(opUserCode, opUserId, JointCustId)
    // your function here
});


function GetPendingAuthJointCustIdData(opUserCode, opUserId, xCustId) {
    swal({
        title: "Loading...",
        text: "Please Wait",
        // type: "info",
        // icon: "info",
        imageUrl: "../images/Loader-Ellipsis-244px.gif",
        // imageUrl: "../images/incommingCall.gif",
        buttons: false,
        // showConfirmButton: false,
        // showCancelButton: false,
        // closeOnConfirm: false,
        // showLoaderOnConfirm: false,
        allowOutsideClick: false
    });
    var Data = {
        UserCode: opUserCode,
        UserId: opUserId,
        CustId: xCustId
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/PendingAuthCustomerData",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            $('#menuTabs li a').removeClass("active");
            $('#ancBasic').addClass('active');

            var responseJSON = JSON.parse(JSON.stringify(responseData));
            console.log("ApplType",responseJSON)
            if (responseJSON.ResponseCode === "000") {
                swal.close()
                var rBasicInfo = responseJSON.CustomerBasicInfo;
                var rAadhaar = responseJSON.Uiddata;
                var rPAN = responseJSON.PanModelData;
                var rMedia = responseJSON.MediaData;

                // if (responseJSON.JoinRefIds.length > 0) {
                //     toggleSideTabs(rBasicInfo.CustId, rBasicInfo.CustMobNo, responseJSON.JoinRefIds)
                //     document.getElementById('leftBlock').style.display = "block";
                //     $("#rightBlock").addClass('col-lg-10 col-md-10 col-sm-10 col-xs-10 card');
                //     // document.getElementById('rightBlock').addClassName = "col-lg-10 col-md-10 col-sm-10 col-xs-10 card";
                // }
                // else {
                //     $("#rightBlock").addClass('col-lg-12 col-md-12 col-sm-12 col-xs-12 card');
                //     document.getElementById('leftBlock').style.display = "none";
                //     // document.getElementById('rightBlock').addClassName = "col-lg-12 col-md-12 col-sm-12 col-xs-12 card";
                // }

                var headerInfo = document.getElementById('headerInfo');
                var headerInfoAcc = document.getElementById('headerInfoAcc');
                var divBasicInfo = document.getElementById('divBasicInfo');
                var divBasicInfoAcc = document.getElementById('divBasicInfoAcc');
                var withMinor1 = document.getElementById('withMinor1');
                var withMinor2 = document.getElementById('withMinor2');
                var withoutMinor1 = document.getElementById('withoutMinor1');
                var withoutMinor2 = document.getElementById('withoutMinor2');
                var withoutMinor3 = document.getElementById('withoutMinor3');
                var divAadhaar = document.getElementById('divAadhaar');
                var divPAN = document.getElementById('divPAN');
                var divMedia = document.getElementById('divMedia');
                var divNominee = document.getElementById('divNominee');

                // LoadDatatable(responseJSON.NomineeDatas);

                if (responseJSON.AccountType === 3) {
                    withMinor1.style.display = 'block';
                    withMinor2.style.display = 'block';
                    withoutMinor1.style.display = 'none';
                    withoutMinor2.style.display = 'none';
                    withoutMinor3.style.display = 'none';
                }
                else {
                    withMinor1.style.display = 'none';
                    withMinor2.style.display = 'none';
                    withoutMinor1.style.display = 'block';
                    withoutMinor2.style.display = 'block';
                    withoutMinor3.style.display = 'block';
                }

                if (responseJSON.IndOthers === 0 && responseJSON.ProductType === 'NA') {
                    debugger;
                    headerInfo.style.display = 'block';
                    divBasicInfo.style.display = 'block';
                    headerInfoAcc.style.display = 'none';
                    divBasicInfoAcc.style.display = 'none';
                    divAadhaar.style.display = 'none';
                    divPAN.style.display = 'none';
                    divMedia.style.display = 'none';
                    divNominee.style.display = 'none';
                    
                }
                else {
                    debugger;
                    headerInfo.style.display = 'none';
                    divBasicInfo.style.display = 'none';
                    headerInfoAcc.style.display = 'block';
                    divBasicInfoAcc.style.display = 'block';
                    divAadhaar.style.display = 'none';
                    divPAN.style.display = 'none';
                    divMedia.style.display = 'none';
                    divNominee.style.display = 'none';
                }


                var ModeOfOperation = '';
                if (responseJSON.ModeOfOperation === 1) {
                    ModeOfOperation = "SELF"
                }
                else if (responseJSON.ModeOfOperation === 2) {
                    ModeOfOperation = "JOINT"
                }
                else if (responseJSON.ModeOfOperation === 3) {
                    ModeOfOperation = "ANYONE"
                }
                else if (responseJSON.ModeOfOperation === 4) {
                    ModeOfOperation = "EITHER OR SURVIVOR"
                }
                else if (responseJSON.ModeOfOperation === 5) {
                    ModeOfOperation = "FATHER GUARDIAN"
                }
                else if (responseJSON.ModeOfOperation === 6) {
                    ModeOfOperation = "MOTHER GUARDIAN"
                }
                else if (responseJSON.ModeOfOperation === 7) {
                    ModeOfOperation = "LEGAL GUARDIAN"
                }

                var AccountType = '';
                if (responseJSON.AccountType === 1) {
                    AccountType = 'NORMAL'
                }
                else if (responseJSON.AccountType === 2) {
                    AccountType = 'SENIOR CITIZEN'
                }
                else if (responseJSON.AccountType === 3) {
                    AccountType = 'MINOR'
                }

                //Header Info


                document.getElementById('CustId').value = rBasicInfo.CustId;
                document.getElementById('hTitle').value = responseJSON.Title;;
                document.getElementById('hName').value = rBasicInfo.Name;
                document.getElementById('hMobile').value = rBasicInfo.CustMobNo;
                // document.getElementById('hVeriCode').value = responseJSON.VerificationCode;
                // document.getElementById('hApplType').value = ApplicationType;
                document.getElementById('hPAN').value = rPAN.pan;
                document.getElementById('hGender').value = rBasicInfo.Gender;
                document.getElementById('hDOB').value = rBasicInfo.DOB;
                // document.getElementById('hIndOthers').value = "Individual Account";
                // document.getElementById('hProductType').value = responseJSON.ProductType;
                // document.getElementById('hAccountType').value = AccountType;
                // document.getElementById('hModeOfOpertion').value = ModeOfOperation;


                // document.getElementById('hAadhaar').value = rBasicInfo.aadharNumberonDetail;



                // Header Info Account
                document.getElementById('aCustId').value = rBasicInfo.CustId;
                document.getElementById('aTitle').value = responseJSON.Title;;
                document.getElementById('aName').value = rBasicInfo.Name;
                document.getElementById('aMobile').value = rBasicInfo.CustMobNo;
                // document.getElementById('aVeriCode').value = responseJSON.VerificationCode;
                document.getElementById('aPAN').value = rPAN.pan;
                // document.getElementById('aGender').value = rBasicInfo.Gender;
                // document.getElementById('aDOB').value = rBasicInfo.DOB;
                document.getElementById('aIndOthers').value = "Individual Account";
                document.getElementById('aProductType').value = responseJSON.ProductType;
                document.getElementById('aAccountType').value = AccountType;
                document.getElementById('aModeOfOpertion').value = ModeOfOperation;



                //Basic Info
                document.getElementById('bFatherName').value = rBasicInfo.FatherName;
                document.getElementById('bMotherName').value = rBasicInfo.MotherName;
                document.getElementById('bMarStatus').value = rBasicInfo.MaritalStatus;
                document.getElementById('bEmail').value = rBasicInfo.Email;
                document.getElementById('bOcc').value = rBasicInfo.Occupation;
                document.getElementById('bIncome').value = rBasicInfo.AnnualIncome;
                document.getElementById('bPol').value = rBasicInfo.PolitcallyExpYN;
                // document.getElementById('bAdd').value = "HOUSE: " + rBasicInfo.house + " LOCALITY: "
                //     + rBasicInfo.locality + " LANDMARK: " + rBasicInfo.landmark + " CITY: " + rBasicInfo.city + " " + " DISTRICT: " + rBasicInfo.district + " STATE: " + rBasicInfo.state;
                document.getElementById('bAdd').value = "HOUSE: " + rBasicInfo.House + ". LOCALITY: " + rBasicInfo.Locality
                    + ". LANDMARK: " + rBasicInfo.Landmark + ". CITY: " + rBasicInfo.City + ". PIN: " + rBasicInfo.PinCode
                    + ". DISTRICT: " + rBasicInfo.District + ". STATE: " + rBasicInfo.State;

                // if(responseJSON.ApplType === 4){
                //     debugger;
                //     loadCityData(rBasicInfo);
                // }

                // Besic Info Account
                var TDSYN = ''
                if (responseJSON.TDSYN === "Y") {
                    TDSYN = "YES"
                }
                else {
                    TDSYN = "NO"
                }

                var ChequeBookYN = ''
                if (responseJSON.ChequeBookYN === "Y") {
                    ChequeBookYN = "YES"
                }
                else {
                    ChequeBookYN = "NO"
                }

                var ATMCardYN = ''
                if (responseJSON.ATMCardYN === "Y") {
                    ATMCardYN = "YES"
                }
                else {
                    ATMCardYN = "NO"
                }

                var INETBankingYN = ''
                if (responseJSON.INETBankingYN === "Y") {
                    INETBankingYN = "YES"
                }
                else {
                    INETBankingYN = "NO"
                }

                var NomineeYN = ''
                if (responseJSON.NomineeYN === "Y") {
                    NomineeYN = "YES"
                }
                else {
                    NomineeYN = "NO"
                }
                document.getElementById('cFatherName').value = rBasicInfo.FatherName;
                document.getElementById('cMotherName').value = rBasicInfo.MotherName;
                document.getElementById('cMarStatus').value = rBasicInfo.MaritalStatus;
                document.getElementById('cEmail').value = rBasicInfo.Email;
                document.getElementById('cOcc').value = rBasicInfo.Occupation;
                document.getElementById('cIncome').value = rBasicInfo.AnnualIncome;
                document.getElementById('cPol').value = rBasicInfo.PolitcallyExpYN;
                document.getElementById('cGuardianName').value = rBasicInfo.GuardianName;
                document.getElementById('cGuardianDOB').value = rBasicInfo.GuardianDOB;
                document.getElementById('cTDSYN').value = TDSYN;
                document.getElementById('cChequeBookYN').value = ChequeBookYN;
                document.getElementById('cATMCardYN').value = ATMCardYN;
                document.getElementById('cINETBankingYN').value = INETBankingYN;
                document.getElementById('cNomineeYN').value = NomineeYN;
                document.getElementById('cAdd').value = "HOUSE: " + rBasicInfo.House + ". LOCALITY: " + rBasicInfo.Locality
                    + ". LANDMARK: " + rBasicInfo.Landmark + ". CITY: " + rBasicInfo.City + ". PIN: " + rBasicInfo.PinCode
                    + ". DISTRICT: " + rBasicInfo.District + ". STATE: " + rBasicInfo.State;

                //Aadhaar Info
                // document.getElementById('aAadhaar').value = rBasicInfo.aadharNumberonDetail;
                document.getElementById('aCareOf').value = rAadhaar.Poa._careof;
                document.getElementById('aName').value = rAadhaar.Poi._name;
                document.getElementById('aGender').value = rAadhaar.Poi._gender;
                document.getElementById('aDOB').value = rAadhaar.Poi._dob;
                // document.getElementById('aAddr').value = "HOUSE: " + rAadhaar.houseonAadhaar + " LOCALITY: "
                //     + rAadhaar.loconAadhaar + " LANDMARK: " + rAadhaar.landmarkonAadhaar + " CITY: " + rAadhaar.vtconAadhaar + " " + " DISTRICT: " + rAadhaar.distonAadhaar + " STATE: " + rAadhaar.stateonAadhaar;
                document.getElementById('aAddr').value = "HOUSE: " + rAadhaar.Poa._house + ". LOCALITY: " + rAadhaar.Poa._loc
                    + ". PO: " + rAadhaar.Poa._po + ". STREET: " + rAadhaar.Poa._street
                    + ". LANDMARK: " + rAadhaar.Poa._landmark + ". CITY: " + rAadhaar.Poa._vtc + ". PIN: " + rAadhaar.Poa._pc
                    + ". DISTRICT: " + rAadhaar.Poa._dist + ". STATE: " + rAadhaar.Poa._state;

                var xDocPhoto = document.getElementById('aImg');
                xDocPhoto.src = "data:image/png;base64, " + rAadhaar.Pht;


                //PAN Info
                document.getElementById('pFname').value = rPAN.first_name;
                document.getElementById('pMname').value = rPAN.middle_name;
                document.getElementById('pLname').value = rPAN.last_name;
                document.getElementById('pFullName').value = rPAN.full_name;
                document.getElementById('pStatus').value = rPAN.status;
                document.getElementById('pCat').value = rPAN.category;
                document.getElementById('pLupd').value = rPAN.last_updated;

                //LatLong
                document.getElementById('mLat').value = responseJSON.Latitude;
                document.getElementById('mLong').value = responseJSON.Longitude;
                document.getElementById('mVeriCode').value = responseJSON.VerificationCode;

                //Media
                document.getElementById('mCustImg').src = rMedia.ImgCustomer;
                document.getElementById('anchormCustImg').href = rMedia.ImgCustomer;

                document.getElementById('mDocImg').src = rMedia.ImgDocument;
                document.getElementById('anchormDocImg').href = rMedia.ImgDocument;

                document.getElementById('mSignImg').src = rMedia.ImgSignature;
                document.getElementById('anchormSignImg').href = rMedia.ImgSignature;
                fetch('data:video/webm;base64,' + rMedia.VideoSession)
                    .then(res => res.blob())
                    .then(function (resBlob) {
                        document.getElementById('mSessionVideo').src = window.URL.createObjectURL(resBlob);
                    });

                // document.getElementById('mSessionVideo').src = rMedia.videotest;
                // document.getElementById('mSessionVideo').src = "data:video/webm;base64," + rMedia.videotest;
                if (rMedia.ImgPOA != 'NA' && rMedia.ImgPOA != null && rMedia.ImgPOA != '') {
                    document.getElementById('divAddrImg').style.display = 'block';
                    document.getElementById('mAddrImg').src = rMedia.ImgPOA;
                    document.getElementById('anchormAddrImg').href = rMedia.ImgPOA;
                }
                else {
                    document.getElementById('divAddrImg').style.display = 'none';
                }
                swal.close();

                var ancNominee = document.getElementById('ancNominee');
                if (responseJSON.NomineeDatas.length === 0) {
                    ancNominee.style.display = 'none';
                }
                else {
                    ancNominee.style.display = 'block';
                }
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });

}

function loadCityData(rBasicInfo) {
    var Data = {
        "TableName": "D500028",
        "PicklistName": "pick2",
        "ParamArr": "",
        "TBVal": rBasicInfo.City,
        "KeyVal": rBasicInfo.City
      }

      $.ajax({
        type: "POST",
        url: CBSURL +  "/api/CustomControls/ListCheckInitPicklist",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData, httpStatus, xhr) {
            if (xhr.status === 200)  {
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                var CityName =responseJSON.DictOne.PlaceCdDesc
                console.log(CityName)
                rBasicInfo.City = CityName
                var StateCd = responseJSON.DictOne.StateCd
                var District = responseJSON.DictOne.District
                loadStateData(rBasicInfo,StateCd,District)

            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
        },
        error: function () { }
    });

}


function loadStateData(rBasicInfo,StateCd,District) {
    var Data = {
        "TableName": "D500025",
        "PicklistName": "pick1",
        "ParamArr": "",
        "TBVal": StateCd,
        "KeyVal": StateCd
      }

      $.ajax({
        type: "POST",
        url: CBSURL +  "/api/CustomControls/ListCheckInitPicklist",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData, httpStatus, xhr) {
            if (xhr.status === 200)  {
                debugger;
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                var StateName =responseJSON.DictOne.StateDesc
                console.log(StateName)
                rBasicInfo.State = StateName

                loadDistrictData(rBasicInfo,District)

            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
        },
        error: function () { }
    });

}

function loadDistrictData(rBasicInfo,District) {
    var Data = {
        "OrgId": 0,
        "LookupCode": 101013,
        "LkTableName": "lkdRec",
        "LookupId": District
      }

      $.ajax({
        type: "POST",
        url: CBSURL +  "/api/CustomControls/ListCheckInitLookup",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData, httpStatus, xhr) {
            if (xhr.status === 200)  {
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                var DistrictName =responseJSON.LookupDescriprionDb
                console.log(DistrictName)
                rBasicInfo.District = DistrictName

                // loadDistrictData(rBasicInfo)
                document.getElementById('bAdd').value = "HOUSE: " + rBasicInfo.House + ". LOCALITY: " + rBasicInfo.Locality
                    + ". LANDMARK: " + rBasicInfo.Landmark + ". CITY: " + rBasicInfo.City + ". PIN: " + rBasicInfo.PinCode
                    + ". DISTRICT: " + rBasicInfo.District + ". STATE: " + rBasicInfo.State;



            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
        },
        error: function () { }
    });

}