var opUserId, opUserCode, opUserRole, xCustId, xCustMobNo;
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
        document.getElementById('upperUsername').innerHTML = opUserId;
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
        , function(evt, value) {
            if(value.trim() === '') {
                return false;
                // alertify.error('Oops! Reason cannot Be Blank!')
            }
            else {
                initAuthorizeAjax("A_REJECT", value.trim());
            }
        }
        , function() {
            alertify.error('Please Enter Reason/Remark!')
        });
    }
    else if (type === '3') {
        alertify.prompt('Reason For HOLD', ''
        , function(evt, value) {
            if(value.trim() === '') {
                return false;
                // alertify.error('Oops! Reason cannot Be Blank!')
            }
            else {
                initAuthorizeAjax("A_HOLD", value.trim());
            }
        }
        , function() {
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
                }, function() {
                    window.location.href = './AuthorizerDashboard.html';
                });
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
                console.log(responseJSON.ResponseCode)
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
    /*
    $.ajax({
        url: serviceURL_DEV + "/api/MainService/PendingAuthCustomerDataTestFile",
        method: 'GET',
        dataType: 'binary',
        // data: JSON.stringify(Data),
        processData: 'false',
        responseType: 'arraybuffer',
        // headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }).then(function () {
        var data = new Uint8Array(responseText);
        //do something with the data
        return data;
    }, function (error) {
        console.log(error.responseText);
        document.getElementById('mSessionVideo').src = error.responseText;
        alertify.error('There was an error! Error:' + error.name + ':' + error.status)
    });
    */
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

                //Header Info
                document.getElementById('CustId').value = rBasicInfo.CustId;
                document.getElementById('hName').value = rBasicInfo.Name;;
                document.getElementById('hMobile').value = rBasicInfo.CustMobNo;
                document.getElementById('hPAN').value = rPAN.pan;
                // document.getElementById('hAadhaar').value = rBasicInfo.aadharNumberonDetail;
                document.getElementById('hGender').value = rBasicInfo.Gender;
                document.getElementById('hDOB').value = rBasicInfo.DOB;
                document.getElementById('hVeriCode').value = responseJSON.VerificationCode;

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
                    console.log
                });

                // document.getElementById('mSessionVideo').src = rMedia.videotest;
                // document.getElementById('mSessionVideo').src = "data:video/webm;base64," + rMedia.videotest;
                if(rMedia.ImgPOA != 'NA' && rMedia.ImgPOA != null && rMedia.ImgPOA != '') {
                    document.getElementById('divAddrImg').style.display = 'block';
                    document.getElementById('mAddrImg').src = rMedia.ImgPOA;
                    document.getElementById('anchormAddrImg').href = rMedia.ImgPOA;
                }
                else {
                    document.getElementById('divAddrImg').style.display = 'none';
                }
                swal.close();
            }
            else {
                console.log(responseJSON.ResponseCode);
                swal('Alert!', responseJSON.ResponseMessage, 'error');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    
}

function toggleDiv(index) {
    var tab0 = document.getElementById('ancBasic');
    var tab1 = document.getElementById('ancAadhaar');
    var tab2 = document.getElementById('ancPan');
    var tab3 = document.getElementById('ancRec');

    var divBasicInfo = document.getElementById('divBasicInfo');
    var divAadhaar = document.getElementById('divAadhaar');
    var divPAN = document.getElementById('divPAN');
    var divMedia = document.getElementById('divMedia');

    if (index === '0') {
        divBasicInfo.style.display = 'block';
        divAadhaar.style.display = 'none';
        divPAN.style.display = 'none';
        divMedia.style.display = 'none';
    }
    else if (index === '1') {
        divBasicInfo.style.display = 'none';
        divAadhaar.style.display = 'block';
        divPAN.style.display = 'none';
        divMedia.style.display = 'none';
    }
    else if (index === '2') {
        divBasicInfo.style.display = 'none';
        divAadhaar.style.display = 'none';
        divPAN.style.display = 'block';
        divMedia.style.display = 'none';
    }
    else if (index === '3') {
        divBasicInfo.style.display = 'none';
        divAadhaar.style.display = 'none';
        divPAN.style.display = 'none';
        divMedia.style.display = 'block';
    }
}