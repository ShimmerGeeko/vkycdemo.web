function onNext() {
    window.location.href = "./ScheduleNow.html";
}

window.onload = function () {
    var xCustMobNo = null, xCustId = null;
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    xCustId = sessionStorage.getItem("sesParamCustId");
    if (xCustMobNo === null || xCustMobNo === '' || xCustId === null || xCustId === '') {
        window.location.href = './index.html';
    }
    else {
        swal({
            title: "Loading...",
            text: "Please Wait",
            // type: "info",
            // icon: "info",
            imageUrl: "../images/Loader-Ellipsis-244px.gif",
            buttons: false,
            // showConfirmButton: true,
            // showCancelButton: false,
            // closeOnConfirm: false,
            // showLoaderOnConfirm: false,
            allowOutsideClick: false,
        });
        getCustReviewData(xCustMobNo, xCustId);
    }
}

function getCustReviewData(xCustMobNo, xCustId) {
    var Data = {
        CustId: xCustId,
        CustMobNo: xCustMobNo
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/GetCustomerReviewData",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            swal.close();
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                var rBasicInfo = responseJSON.CustBasicInfo;
                var rAadhaar = responseJSON.CustAadhaarPoa;

                //Header Info
                document.getElementById('bName').value = rBasicInfo.Name;
                document.getElementById('hGender').value = rBasicInfo.Gender === 'M' ? 'Male' : 'Female';
                document.getElementById('hDOB').value = rBasicInfo.DOB;

                //Basic Info
                document.getElementById('bFName').value = rBasicInfo.FatherName;
                document.getElementById('bMName').value = rBasicInfo.MotherName;
                document.getElementById('bMarStatus').value = rBasicInfo.MaritalStatus === 'S' ? 'Single' : 'Married';
                document.getElementById('bEmail').value = rBasicInfo.Email;
                document.getElementById('bOcc').value = rBasicInfo.Occupation;
                document.getElementById('bIncome').value = rBasicInfo.AnnualIncome;
                document.getElementById('bPol').value = rBasicInfo.PolitcallyExpYN;
                // document.getElementById('txtHouse').value = rBasicInfo.house;
                // document.getElementById('txtLocality').value = rBasicInfo.locality;
                // document.getElementById('txtLandmark').value = rBasicInfo.landmark;
                // document.getElementById('txtCity').value = rBasicInfo.city;
                // document.getElementById('txtPIN').value = rBasicInfo.pincode;
                // document.getElementById('txtDistrict').value = rBasicInfo.district;
                // document.getElementById('txtState').value = rBasicInfo.state;
                document.getElementById('txtCommAddress').value = "HOUSE: " + rBasicInfo.House + ". LOCALITY: " + rBasicInfo.Locality
                    + ". LANDMARK: " + rBasicInfo.Landmark + ". CITY: " + rBasicInfo.City + ". PIN: " + rBasicInfo.PinCode
                    + ". DISTRICT: " + rBasicInfo.District + ". STATE: " + rBasicInfo.State;

                //Aadhaar Info
                document.getElementById('aAddr').value = "HOUSE: " + rAadhaar._house + ". LOCALITY: " + rAadhaar._loc
                    + ". PO: " + rAadhaar._po + ". STREET: " + rAadhaar._street
                    + ". LANDMARK: " + rAadhaar._landmark + ". CITY: " + rAadhaar._vtc + ". PIN: " + rAadhaar._pc
                    + ". DISTRICT: " + rAadhaar._dist + ". STATE: " + rAadhaar._state;
                // + ". SUB-DISTRICT: " + rAadhaar.subdistonAadhaar + ". DISTRICT: " + rAadhaar.distonAadhaar + ". STATE: " + rAadhaar.stateonAadhaar;
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
            }
        },
        error: function () {
        }
    });
}