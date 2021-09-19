$('#btnNext').on('click', function () {
    $('form').validate().settings.ignore = ".pan-field";

    if ($("form").valid()) {
        $('form').validate().settings.ignore = "none";
        document.getElementById('rowBasicInfo').style.display = 'none';
        document.getElementById('divNext').style.display = 'none';
        document.getElementById('rowPan').style.display = 'block';
        document.getElementById('divPrev').style.display = 'block';
        document.getElementById('divSubmit').style.display = 'block';
    }
});

function previous() {
    document.getElementById('rowPan').style.display = 'none';
    document.getElementById('divPrev').style.display = 'none';
    document.getElementById('divSubmit').style.display = 'none';
    document.getElementById('divNext').style.display = 'block';
    document.getElementById('rowBasicInfo').style.display = 'block';
}

$(document).ready(function () {
    $("form").submit(function () {
        if ($("form")[0].checkValidity()) {
            InitAjax();
        }
        //else {alert('Fields Are Required!')}
    });
});

$(".ValNumeric").on("input", function (event) {
    debugger;
    this.value = this.value.replace(/[^0-9]/g, "");
});
$(".ValAlpha").on("input", function (event) {
    this.value = this.value.replace(/[^A-Za-z ]/g, "");
});
$(".ValAlphaNumeric").on("input", function (event) {
    this.value = this.value.replace(/[^a-z0-9 ]/gi, "");
});
$(".ValNoSpace").on("input", function (event) {
    this.value = this.value.replace(/\s/g, "");
});

var xApplType = null;
var xCustMobNo = null;
var StateList;
var StateCityList;

window.onload = function () {
    xApplType = sessionStorage.getItem("sesParamApplType");
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    if (xCustMobNo === null || xCustMobNo === '' || xApplType === null || xApplType === '') {
        window.location.href = './index.html';
    }
    else {
        loadStateCity();
    }
};

var ddlState = document.getElementById('ddlState');

ddlState.addEventListener('change', function () {
    setCityList(StateCityList);
});

function loadStateCity() {
    var defNumber = 'NA';
    if (xCustMobNo != null && xCustMobNo != '') {
        defNumber = xCustMobNo;
    }
    var Data = {
        customerMobileNumber: defNumber
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/GetStateCityData",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                StateList = responseJSON.StateList;
                StateCityList = responseJSON.StateCityList;

                $('#ddlState').empty();
                var optSelectText = 'Select State';
                var optSelectValue = '';
                var el = document.createElement("option");
                el.textContent = optSelectText;
                el.value = optSelectValue;
                el.style.color = '#aaa';
                ddlState.appendChild(el);

                for (var i = 0; i < StateList.length; i++) {
                    var optText = StateList[i].StateName;
                    var optValue = StateList[i].StateCode;
                    var el = document.createElement("option");
                    el.textContent = optText;
                    el.value = optValue;
                    ddlState.appendChild(el);
                }
                $('#ddlState').selectpicker('refresh');
                // setCityList(StateCityList);

            } else {
                swal("Alert", "Response: " + responseJSON.ResponseMessage, "error");
            }
        },
        error: function () {}
    });
}

function setCityList(cityList) {
    debugger;
    var filteredCity = cityList.filter((x) => {
        return x.StateCode === ddlState.options[ddlState.selectedIndex].value;
    });

    var ddlCity = document.getElementById('ddlCity');
    $('#ddlCity').empty();
    var optSelectText = 'Select City';
    var optSelectValue = '';
    var el = document.createElement("option");
    el.textContent = optSelectText;
    el.value = optSelectValue;
    ddlCity.appendChild(el);
    for (var i = 0; i < filteredCity.length; i++) {
        var optText = filteredCity[i].CityName;
        var optValue = filteredCity[i].CityCode;
        var el = document.createElement("option");
        el.textContent = optText;
        el.value = optValue;
        ddlCity.appendChild(el);
    }
    $('#ddlCity').selectpicker('refresh');
}

function InitAjax() {
    swal({
        title: "Processing...",
        text: "Please Wait",
        // type: "info",
        // icon: "info",
        imageUrl: "../images/Loader-Ellipsis-244px.gif",
        buttons: false,
        // showConfirmButton: true,
        // showCancelButton: false,
        // closeOnConfirm: false,
        // showLoaderOnConfirm: false,
        allowOutsideClick: false
    });
    loadFile();
}

function loadFile() {
    var file = document.getElementById("bFile").files[0];
    // var file = document.querySelector('#files > input[type="file"]').files[0];
    InitFileParse(file);
}

function InitFileParse(file) {
    var base64String = null;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        //console.log(reader.result);
        base64String = reader.result;
        base64String = base64String.split(',');

        xPanNumber = document.getElementById('bPAN').value.toUpperCase();
        var filePasscode = document.getElementById('bFileCode').value;

        if (base64String[1] != null && base64String[1] != '') {
            saveCustData(base64String[1], filePasscode, xPanNumber)
        } else {
            swal("Alert", 'Invalid Aadhaar File!', "error");
            return;
        }
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
        base64String = 'File Read Error!';
        swal("Alert", 'Invalid Aadhaar File!', "error");
        return base64String;
    };
}

function saveCustData(fileData, filePasscode, xPanNumber) {
    try {
        var xTitle = document.getElementById('selTitle').value;
        var xName = document.getElementById('bName').value;
        var xDOB = document.getElementById('bDOB').value;
        var xGender = document.getElementById('selGender').value;
        var bFatherName = document.getElementById('bFName').value;
        var bMotherName = document.getElementById('bMName').value;
        var ddlMarStatus = document.getElementById('selMarital').value;
        var bEmail = document.getElementById('bEmail').value;
        var bOcc = document.getElementById('bOcc').value;
        var bIncome = document.getElementById('bIncome').value;
        var ddlPol = document.getElementById('selPolYN').value;

        var txtHouse = document.getElementById('bHouse').value;
        var txtLocality = document.getElementById('bLocality').value;
        var txtLandmark = document.getElementById('bLandmark').value;
        var txtPIN = document.getElementById('bPinCode').value;


        var txtDistrict = document.getElementById('bDistrict').value;
        // var txtState = ddlState.options[ddlState.selectedIndex].text;
        var txtState = document.getElementById('ddlState').value;
        
        // var ddlCity = document.getElementById('ddlCity');
        // var txtCity = ddlCity.options[ddlCity.selectedIndex].text;
        var txtCity = document.getElementById('ddlCity').value;
        // var xAddress = 'HOUSE: ' + txtHouse + ', LOCALITY: ' + txtLocality + ', LANDMARK: ' + txtLandmark + ', PIN: ' + txtPIN;
        var selLang = sessionStorage.getItem("selLanguage");
   
        var Data = {
            ApplType: parseInt(xApplType),
            Title: xTitle,
            CustMobNo: xCustMobNo,
            // aadhaarNo: "",
            PanNumber: xPanNumber,
            AadhaarZipInfo: {
                ZipFile: fileData,
                FilePassword: filePasscode
            },
            custBasicInfo: {
                CustId: "",
                CustMobNo: "",
                Name: xName,
                FatherName: bFatherName,
                MotherName: bMotherName,
                DOB: xDOB,
                Gender: xGender,
                MaritalStatus: ddlMarStatus,
                Email: bEmail,
                Occupation: bOcc,
                AnnualIncome: bIncome,
                PolitcallyExpYN: ddlPol,
                House: txtHouse,
                Locality: txtLocality,
                Landmark: txtLandmark,
                District: txtDistrict,
                State: txtState,
                City: txtCity,
                PinCode: txtPIN,
                // AadhaarRefId: "",
                // PanNumber: "",
            },
        };
        $.ajax({
            type: "POST",
            url: serviceURL + "/api/MainService/SaveCustomerData/",
            dataType: "JSON",
            data: JSON.stringify(Data),
            contentType: "application/json; charset=utf-8",
            success: function (responseData) {
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                if (responseJSON.ResponseCode === "000") {
                    var respCustId = responseJSON.ResponseCustId;
                    sessionStorage.setItem("sesParamCustId", respCustId);
                    swal({
                        title: "Success!",
                        text: "Details Submitted Successfully!",
                        type: "success"
                    }, function () {
                        if(selLang === "MR"){
                            window.location.href = './CustInfoReview_mr.html';
                        }
                        else{
                            window.location.href = './CustInfoReview.html';
                        }
                        
                    });
                }
                else {
                    swal("Alert", responseJSON.ResponseMessage, "error");
                }
            },
            error: function () {}
        });
    } catch (err) {
        swal("Alert", "Something Went Wrong: " + err, "error");
    }
}

$(function () {
    $('.show-tick').selectpicker().change(function () {
        if (this.selectedIndex > 0) {
            $(this).valid()
        }
    });
});