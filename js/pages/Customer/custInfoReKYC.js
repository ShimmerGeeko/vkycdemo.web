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
var xCBSCustNo = null;
var StateList;
var CityList;
var DistrictList;

window.onload = function () {
    xApplType = sessionStorage.getItem("sesParamApplType");
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    xCBSCustNo = sessionStorage.getItem("sesParamCBSCustNo");
    if (xCustMobNo === null || xCustMobNo === '' || xApplType === null || xApplType === '') {
        window.location.href = './index.html';
    }
    else {
        InitCBSLoad();
    }
};

async function InitCBSLoad() {
    debugger;
    loadState();
}

function getCBSCustData(xCBSCustNo) {
    var OperationDate = new Date();
    var Data = {
        CustNo: parseInt(xCBSCustNo),
        inParam: {
            mplLBrCode: 0,
            // mplOprnDate: "2021-01-18",
            mplOprnDate: OperationDate.toISOString(),
            mplUserCd1: "string",
            mplUserCd2: 0,
            mplStnNo: 0,
            ProgMode: 8,
            mplPrgParam: "string",
            mplHomeCurCd: "string",
            mplGrpCd: 0
        }
    };
    $.ajax({
        type: "POST",
        url: CBSURL + "/api/MainService/GetAllCustomerMasterNew",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData, httpStatus, xhr) {
            if (xhr.status === 200) {
                
                debugger;
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                var cbsDOB = new Date(responseJSON.individual.Dob);

                var year = cbsDOB.getFullYear();
                var bDOB = document.getElementById('bDOB');
                if (year != 1900) {
                    var month = cbsDOB.getMonth() + 1;
                    var day = cbsDOB.getDate();
                    if (month.toString().length < 2) {
                        month = '0' +  month;
                    }
                    if (day.toString().length < 2) {
                        day = '0' + day;
                    }
                    bDOB.value = year + '-' + month + '-' + day;
                    bDOB.disabled = true;
                }
                else {
                    bDOB.disabled = false;
                }

                var key = responseJSON.key
                var individual = responseJSON.individual
                if (key != null) {
                    
                    document.getElementById('bTitle').value = key.NameTitle;
                    document.getElementById('bName').value = key.Longname;
                    document.getElementById('bEmail').value = key.EmailId;
                    document.getElementById('bHouse').value = key.Add1;
                    document.getElementById('bLocality').value = key.Add2;
                    document.getElementById('bLandmark').value = key.Add3;
                    document.getElementById('ddlCity').value = key.CityCd.toUpperCase();
                    document.getElementById('bPinCode').value = key.PinCode;
                    document.getElementById('bPAN').value = key.PanNoDesc;
                    document.getElementById('ddlCity').value = key.CityCd;
                    $('#ddlCity').selectpicker('refresh');
                    setStateDistrictList(CityList);
                    
                    if (individual != null) {
                        if (individual.Fathername != null) {
                            document.getElementById('bFName').value = individual.Fathername;
                        }
                        if (individual.Mothername != null) {
                            document.getElementById('bMName').value = individual.Mothername;
                        }
                        document.getElementById('selGender').value = individual.SexCode;
                        $('#selGender').selectpicker('refresh');
                        if (individual.MaritalStatus === 1) {
                            document.getElementById('selMarital').value = 'S';
                        }
                        else if (individual.MaritalStatus === 2) {
                            document.getElementById('selMarital').value = 'M';
                        }
                        else if (individual.MaritalStatus === 3) {
                            document.getElementById('selMarital').value = 'D';
                        }
                        else if (individual.MaritalStatus === 4) {
                            document.getElementById('selMarital').value = 'W';
                        }
                        $('#selMarital').selectpicker('refresh');
                    }
                }
                
                else {
                    swal("Alert", "No Record Found!", "error");
                }
            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
            $(function () {
                $.AdminBSB.select.activate();
                $.AdminBSB.input.activate();
            });
        },
        error: function (err) {
            swal("Alert!", err, 'error');
        }
    });
}

var ddlCity = document.getElementById('ddlCity');

ddlCity.addEventListener('change', function () {
    debugger;
    setStateDistrictList(CityList);
});

function loadState() {
    var Data = {
        "TableName": "D500025",
        "PicklistName": "pick1",
        "ParamArr": "",
        "TBVal": "",
        "Pagen": 0,
        "Tot": 100
    }
    $.ajax({
        type: "POST",
        url: CBSURL + "/api/CustomControls/ListGetInitPicklist",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData, httpStatus, xhr) {
            if (xhr.status === 200) {
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                StateList = responseJSON.PickDt
                if (StateList.length > 0) {
                    /// Your Code Here....
                    $('#ddlState').empty();
                    var optSelectText = 'Select State';
                    var optSelectValue = '';
                    var el = document.createElement("option");
                    el.textContent = optSelectText;
                    el.value = optSelectValue;
                    el.style.color = '#aaa';
                    ddlState.appendChild(el);

                    for (var i = 0; i < StateList.length; i++) {
                        var optText = StateList[i].StateDesc;
                        var optValue = StateList[i].StateCd;
                        var el = document.createElement("option");
                        el.textContent = optText;
                        el.value = optValue;
                        ddlState.appendChild(el);
                    }
                    $('#ddlState').selectpicker('refresh');

                    $(function () {
                        $.AdminBSB.select.activate();
                        $.AdminBSB.input.activate();
                    });
                    loadDistrict();
                }
                else {
                    swal("Alert", "No Record Found!", "error");
                }
            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
        },
        error: function () { }
    });
}

function loadDistrict() {
    var Data = {
        "OrgId": 0,
        "LookupCode": 101023,
        "LkTableName": "lkdRec"
    }
    $.ajax({
        type: "POST",
        url: CBSURL + "/api/CustomControls/ListGetInitLookup",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData, httpStatus, xhr) {
            if (xhr.status === 200) {
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                DistrictList = responseJSON
                if (DistrictList.length > 0) {
                    /// Your Code Here....
                    $('#bDistrict').empty();
                    var optSelectText = 'Select District';
                    var optSelectValue = '';
                    var el = document.createElement("option");
                    el.textContent = optSelectText;
                    el.value = optSelectValue;
                    el.style.color = '#aaa';
                    bDistrict.appendChild(el);

                    for (var i = 0; i < DistrictList.length; i++) {
                        var optText = DistrictList[i].LookupDescriprionDb;
                        var optValue = DistrictList[i].LookupIDDb;
                        var el = document.createElement("option");
                        el.textContent = optText;
                        el.value = optValue;
                        bDistrict.appendChild(el);
                    }
                    $('#bDistrict').selectpicker('refresh');

                    $(function () {
                        $.AdminBSB.select.activate();
                        $.AdminBSB.input.activate();
                    });
                    loadCity();
                }
                else {
                    swal("Alert", "No Record Found!", "error");
                }
            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
        },
        error: function () { }
    });
}

function loadCity() {
    var Data = {
        "TableName": "D500028",
        "PicklistName": "pick2",
        "ParamArr": "",
        "TBVal": "",
        "Pagen": 0,
        "Tot": 100
    }
    $.ajax({
        type: "POST",
        url: CBSURL + "/api/CustomControls/ListGetInitPicklist",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData, httpStatus, xhr) {
            if (xhr.status === 200) {
                var responseJSON = JSON.parse(JSON.stringify(responseData));

                CityList = responseJSON.PickDt
                CityList = CityList.filter((x) => {
                    return x.CntryCd === "IN";
                });

                if (CityList.length > 0) {
                    /// Your Code Here....
                    $('#ddlCity').empty();
                    var optSelectText = 'Select City';
                    var optSelectValue = '';
                    var el = document.createElement("option");
                    el.textContent = optSelectText;
                    el.value = optSelectValue;
                    el.style.color = '#aaa';
                    ddlCity.appendChild(el);

                    for (var i = 0; i < CityList.length; i++) {
                        var optText = CityList[i].PlaceCdDesc;
                        var optValue = CityList[i].PlaceCd;
                        var el = document.createElement("option");
                        el.textContent = optText;
                        el.value = optValue;
                        ddlCity.appendChild(el);
                    }
                    $('#ddlCity').selectpicker('refresh');
                    getCBSCustData(xCBSCustNo);
                    $(function () {
                        $.AdminBSB.select.activate();
                        $.AdminBSB.input.activate();
                    });
                }
                else {
                    swal("Alert", "No Record Found!", "error");
                }
            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
        },
        error: function () { }
    });
}

function setStateDistrictList(cityList) {
    var ddlCity = document.getElementById('ddlCity');
    var selectedCityParam = cityList.filter((c) => {
        return c.PlaceCd.trim() === ddlCity.options[ddlCity.selectedIndex].value;
    });
    debugger;
    var ddlState = document.getElementById('ddlState');
    $('#ddlState').empty();
    var filteredState = StateList.filter((s) => {
        return s.StateCd.trim() === selectedCityParam[0].StateCd.trim();
    });

    var optSelectText = 'Select State';
    var optSelectValue = '';
    var el = document.createElement("option");
    el.textContent = optSelectText;
    el.value = optSelectValue;
    ddlState.appendChild(el);
    for (var i = 0; i < filteredState.length; i++) {
        var optText = filteredState[i].StateDesc;
        var optValue = filteredState[i].StateCd;
        var el = document.createElement("option");
        el.textContent = optText;
        el.value = optValue;
        ddlState.appendChild(el);
    }
    ddlState.selectedIndex = 1;
    $('#ddlState').selectpicker('refresh');

    //Selected District
    var bDistrict = document.getElementById('bDistrict');
    $('#bDistrict').empty();
    var filteredDistrict = DistrictList.filter((d) => {
        return d.LookupIDDb.trim() === selectedCityParam[0].District.toString();
    });

    var optSelectText = 'Select State';
    var optSelectValue = '';
    var el = document.createElement("option");
    el.textContent = optSelectText;
    el.value = optSelectValue;
    bDistrict.appendChild(el);
    for (var i = 0; i < filteredDistrict.length; i++) {
        var optText = filteredDistrict[i].LookupDescriprionDb;
        var optValue = filteredDistrict[i].LookupIDDb;
        var el = document.createElement("option");
        el.textContent = optText;
        el.value = optValue;
        bDistrict.appendChild(el);
    }
    bDistrict.selectedIndex = 1;
    $('#bDistrict').selectpicker('refresh');

    $(function () {
        $.AdminBSB.select.activate();
        $.AdminBSB.input.activate();
    });
}

var ckModifyAddr = document.getElementById('ckModifyAddr');

ckModifyAddr.addEventListener('change', function () {
    var ckvalue = this.checked;
    if (ckvalue) {
        //disabled = false;
        document.getElementById("bHouse").disabled = false;
        document.getElementById("bLocality").disabled = false;
        document.getElementById("bLandmark").disabled = false;
        document.getElementById("ddlCity").disabled = false;
        document.getElementById("ddlState").disabled = false;
        document.getElementById("bDistrict").disabled = false;
        document.getElementById("bPinCode").disabled = false;
        $('#ddlCity').selectpicker('refresh');
        $('#ddlState').selectpicker('refresh');
        $('#bDistrict').selectpicker('refresh');
    }
    else {
        //disabled = true;
        document.getElementById("bHouse").disabled = true;
        document.getElementById("bLocality").disabled = true;
        document.getElementById("bLandmark").disabled = true;
        document.getElementById("ddlCity").disabled = true;
        document.getElementById("ddlState").disabled = true;
        document.getElementById("bDistrict").disabled = true;
        document.getElementById("bPinCode").disabled = true;
        $('#ddlCity').selectpicker('refresh');
        $('#ddlState').selectpicker('refresh');
        $('#bDistrict').selectpicker('refresh');

    }
})

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
    loadDocFile();
    // loadFile();
}

function loadDocFile() {
    var file = document.getElementById("bFileDoc").files[0];
    var base64StringFile1 = null;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        //console.log(reader.result);
        base64StringFile1 = reader.result;
        base64StringFile1 = base64StringFile1.split(',');

        loadFile(base64StringFile1[1]);
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
        base64StringFile1 = 'File Read Error!';
        swal("Alert", 'Invalid Document File!', "error");
        return base64StringFile1;
    };
}

function loadFile(DocFile) {
    var file = document.getElementById("bFile").files[0];
    // var file = document.querySelector('#files > input[type="file"]').files[0];
    InitFileParse(DocFile, file);
}

function InitFileParse(DocFile, file) {
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
            saveCustData(base64String[1], DocFile, filePasscode, xPanNumber)
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

function saveCustData(fileData, DocFile, filePasscode, xPanNumber) {
    try {

        var selDocType = document.getElementById('selDocType').value;
        var xTitle = document.getElementById('bTitle').value;
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
            DocumentProofData: {
                DocProofType: parseInt(selDocType),
                ImgDocProof: DocFile
            }
        };
        $.ajax({
            type: "POST",
            url: serviceURL + "/api/MainService/SaveCustomerData/",
            dataType: "JSON",
            data: JSON.stringify(Data),
            contentType: "application/json; charset=utf-8",
            success: function (responseData) {
                debugger;
                var responseJSON = JSON.parse(JSON.stringify(responseData));
                if (responseJSON.ResponseCode === "000") {
                    var respCustId = responseJSON.ResponseCustId;
                    sessionStorage.setItem("sesParamCustId", respCustId);
                    swal({
                        title: "Success!",
                        text: "Details Submitted Successfully!",
                        type: "success"
                    }, function () {
                        var selLang = sessionStorage.getItem("selLanguage");
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

