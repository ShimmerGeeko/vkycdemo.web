var xApplType = null;
var xCustMobNo = null;
var xJointRefId = null;
var StateList;
var StateCityList;

$(document).ready(function () {
    document.getElementById('divSelMarital').style.display = "block";
    document.getElementById('divSelPolYN').style.display = "block";
    document.getElementById('divbOcc').style.display = "block";
    document.getElementById('divbIncome').style.display = "block";
    document.getElementById('divGuardianDOB').style.display = "none";
    document.getElementById('divGuardianName').style.display = "none";
    document.getElementById('divGuardianRelation').style.display = "none";
    document.getElementById('divAddJointBtn').style.display = "none";

    document.getElementById('NomineeContent2').style.display = "none";
    document.getElementById('NomineeContent3').style.display = "none";
    document.getElementById('NomineeContent4').style.display = "none";
    document.getElementById('NomineeContent5').style.display = "none";

    $("form").submit(function () {
        if ($("form")[0].checkValidity()) {
            InitAjax();
        }
        //else {alert('Fields Are Required!')}
    });
});

//$(".ValNumeric").on("input", function (event) {
$(document).on("input", ".ValNumeric", function (event) {
    this.value = this.value.replace(/[^0-9]/g, "");
});

//$(".ValAlpha").on("input", function (event) {
$(document).on("input", ".ValAlpha", function (event) {
    this.value = this.value.replace(/[^A-Za-z ]/g, "");
});
//$(".ValAlphaNumeric").on("input", function (event) {
$(document).on("input", ".ValAlphaNumeric", function (event) {
    this.value = this.value.replace(/[^a-z0-9 ]/gi, "");
});
//$(".ValNoSpace").on("input", function (event) {
$(document).on("input", ".ValNoSpace", function (event) {
    this.value = this.value.replace(/\s/g, "");
});


$(function () {
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    var yearAdult = year - 18;
    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();

    var maxDate = yearAdult + '-' + month + '-' + day;
    var maxTodayDate = year + '-' + month + '-' + day;
    $('#bDOB').attr('max', maxDate);
    $('.nomDOB').attr('max', maxTodayDate);
});

$(function () {
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    var minyear = year - 18;
    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();

    var minDate = minyear + '-' + month + '-' + day;
    var maxDate = year + '-' + month + '-' + day;
    $('#minorDOB').attr('min', minDate);
    $('#minorDOB').attr('max', maxDate);
});

$(function () {
    $('.show-tick').selectpicker().change(function () {
        if (this.selectedIndex > 0) {
            $(this).valid()
        }
    });
});


var ddlState = document.getElementById('ddlState');

function ddlStateOnChange() {
    setCityList(StateCityList);
}

window.onload = function () {
    xApplType = sessionStorage.getItem("sesParamApplType");
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    xJointRefId = sessionStorage.getItem("sesParamJointRefId")
    if (xJointRefId === null || xJointRefId === '') {
        xJointRefId = 'NA';
    }
    if (xCustMobNo === null || xCustMobNo === '' || xApplType === null || xApplType === '') {
        var selLang = sessionStorage.getItem("selLanguage");
        if (selLang === "MR") {
            window.location.href = './index_mr.html';
        }
        else {
            window.location.href = './index.html';
        }
    }
    else {
        loadStateCity();
        if (xJointRefId != 'NA') {
            getPrimaryCustData4Joint(xJointRefId);
        }
    }
};

function getPrimaryCustData4Joint(CustRefId) {
    var Data = {
        CustRefId: CustRefId
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/PrimaryCustDataForJoint",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                var primaryProductType = responseJSON.ProductType;
                var primaryAccountType = responseJSON.AccountType;
                var primaryModeOfOperation = responseJSON.ModeOfOperation;
                var primaryTDSYN = responseJSON.TDSYN;
                var primaryNomineeYN = responseJSON.NomineeYN;
                var primaryTotalNominee = responseJSON.NomineeDatas.length;

                var selPrdType = document.getElementById('selPrdType');
                selPrdType.value = primaryProductType.toString();
                selPrdType.disabled = true;
                
                var selAccType = document.getElementById('selAccType');
                selAccType.value = primaryAccountType.toString();
                selAccType.disabled = true;
                
                var selTDS = document.getElementById('selTDS');
                selTDS.value = primaryTDSYN;
                selTDS.disabled = true;

                var selNomineYN = document.getElementById('selNomineYN');
                selNomineYN.value = primaryNomineeYN;
                selNomineYN.disabled = true;
                selNomineeYnOnchange('N');

                if (primaryTotalNominee > 0) {
                    document.getElementById('selNomineeNo').value = primaryTotalNominee.toString();
                    document.getElementById('selNomineeNo').disabled = true
                    selNomineeNoChange(primaryTotalNominee.toString());
                    setNomineeDataForJoint(responseJSON.NomineeDatas)
                }
                else {
                    document.getElementById('selNomineeNo').value = "";
                    document.getElementById('selNomineeNo').disabled = true
                }
                
                $('#selPrdType').selectpicker('refresh'); $('#selAccType').selectpicker('refresh'); $('#selTDS').selectpicker('refresh');
                $('#selNomineYN').selectpicker('refresh'); $('#selNomineeNo').selectpicker('refresh');

                selAccTypeChange(primaryAccountType.toString());
                document.getElementById('selMOP').value = primaryModeOfOperation.toString();
                document.getElementById('selMOP').disabled = true
                $('#selMOP').selectpicker('refresh');

            } else {
                swal("Alert", "Response: " + responseJSON.ResponseMessage, "error");
            }
        },
        error: function () { }
    });
}

function setNomineeDataForJoint(nomineeData) {

    var selNomineeTitle = 'selNomineeTitle';
    var nomineeName = 'nomineeName';
    var nomineeRelation = 'nomineeRelation';
    var nomineeDOB = 'nomineeDOB';
    var nomineeAddr = 'nomineeAddr';
    for (var i = 1; i <= nomineeData.length; i++) {
        debugger;
        var j = 1;
        document.getElementById(selNomineeTitle + i).value = nomineeData[i - 1].NomineeTitle;
        document.getElementById(nomineeName + i).value = nomineeData[i - 1].NomineeName;
        document.getElementById(nomineeRelation + i).value = nomineeData[i - 1].NomineeRltn;
        document.getElementById(nomineeDOB + i).value = nomineeData[i - 1].NomineeDob;
        document.getElementById(nomineeAddr + i + '_' + j).value = nomineeData[i - 1].NomineeAdd1;
        j += 1;
        document.getElementById(nomineeAddr + i + '_' + j).value = nomineeData[i - 1].NomineeAdd2;
        j += 1;
        document.getElementById(nomineeAddr + i + '_' + j).value = nomineeData[i - 1].NomineeAdd3;

        $('#' + selNomineeTitle + i).selectpicker('refresh');
    }
    $(function () {
        $.AdminBSB.input.activate();
    });
}

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
                dynamicStateSelect('ddlState', 'Select', StateList);
            } else {
                swal("Alert", "Response: " + responseJSON.ResponseMessage, "error");
            }
        },
        error: function () { }
    });
}

function dynamicStateSelect(elemId, header, options) {
    ddlState = document.getElementById(elemId);

    var jqElemId = '#' + elemId;
    $(jqElemId).empty();

    var optSelectText = header;
    var optSelectValue = '';
    var el = document.createElement("option");
    el.textContent = optSelectText;
    el.value = optSelectValue;
    ddlState.appendChild(el);
    for (var i = 0; i < options.length; i++) {
        var optText = options[i].StateName;
        var optValue = options[i].StateCode;
        var el = document.createElement("option");
        el.textContent = optText;
        el.value = optValue;
        ddlState.appendChild(el);
    }
    $(jqElemId).selectpicker('refresh');
    setCityList(StateCityList);
}

function setCityList(cityList) {
    var filteredCity = cityList.filter((x) => {
        return x.StateCode === ddlState.options[ddlState.selectedIndex].value;
    });

    var ddlCity = document.getElementById('ddlCity');
    $('#ddlCity').empty();
    var optSelectText = 'Select';
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

function selAccTypeChange(value) {
    debugger;
    const MinorMOP = [{ key: '1', value: 'SELF' }, { key: '5', value: 'FATHER GUARDIAN' }, { key: '6', value: 'MOTHER GUARDIAN' }, { key: '7', value: 'LEGAL GUARDIAN' }]

    const OtherMOP = [{ key: '1', value: 'SELF' }, { key: '2', value: 'JOINT' }, { key: '3', value: 'ANYONE' }, { key: '4', value: 'EITHER OR SURVIVOR' }]

    if (value === '3') {
        dynamicSelect('selMOP', 'Mode Of Operation', MinorMOP);

        document.getElementById('divSelMarital').style.display = "none";
        document.getElementById('divSelPolYN').style.display = "none";
        document.getElementById('divbOcc').style.display = "none";
        document.getElementById('divbIncome').style.display = "none";
        document.getElementById('divGuardianDOB').style.display = "block";
        document.getElementById('divGuardianName').style.display = "block";
        document.getElementById('divGuardianRelation').style.display = "block";
        document.getElementById('divAddJointBtn').style.display = "none";
        DestroyAllJointData();

        document.getElementById('divbEmail').className = 'col-lg-4 col-md-4 col-sm-4 col-xs-12'
    }
    else {
        dynamicSelect('selMOP', 'Mode Of Operation', OtherMOP);

        document.getElementById('divSelMarital').style.display = "block";
        document.getElementById('divSelPolYN').style.display = "block";
        document.getElementById('divbOcc').style.display = "block";
        document.getElementById('divbIncome').style.display = "block";
        document.getElementById('divGuardianDOB').style.display = "none";
        document.getElementById('divGuardianName').style.display = "none";
        document.getElementById('divGuardianRelation').style.display = "none";

        // var selMOPval = document.getElementById('selMOP').value;
        // if (selMOPval != 'SELF') {
        //     document.getElementById('divAddJointBtn').style.display = "block";
        // }

        document.getElementById('divbEmail').className = 'col-lg-3 col-md-3 col-sm-3 col-xs-12'
    }
}

function selMopOnchange(value) {
    var selAccTypeVal = document.getElementById('selAccType').value;
    if (value != '1' && selAccTypeVal != '3') {
        document.getElementById('divAddJointBtn').style.display = "block";
        CreateJointDataDiv();
    }
    else {
        document.getElementById('divAddJointBtn').style.display = "none";
        DestroyAllJointData();
    }
}

function dynamicSelect(elemId, header, options) {
    debugger;
    var selectElem = document.getElementById(elemId);
    var jqElemId = '#' + elemId;
    $(jqElemId).empty();

    var optSelectText = header;
    var optSelectValue = '';
    var el = document.createElement("option");
    el.textContent = optSelectText;
    el.value = optSelectValue;
    selectElem.appendChild(el);
    for (var i = 0; i < options.length; i++) {
        try {
            var optText = options[i].value;
            var optValue = options[i].key;
            var el = document.createElement("option");
            el.textContent = optText;
            el.value = optValue;
            selectElem.appendChild(el);
        }
        catch (er) {
            console.log('Err >>>', er);
        }
    }
    $(jqElemId).selectpicker('refresh');
}

function selNomineeNoChange(value) {
    if (value === '2') {
        document.getElementById('NomineeContent2').style.display = "block";
        document.getElementById('NomineeContent3').style.display = "none";
        document.getElementById('NomineeContent4').style.display = "none";
        document.getElementById('NomineeContent5').style.display = "none";
    }
    else if (value === '3') {
        document.getElementById('NomineeContent2').style.display = "block";
        document.getElementById('NomineeContent3').style.display = "block";
        document.getElementById('NomineeContent4').style.display = "none";
        document.getElementById('NomineeContent5').style.display = "none";
    }
    else if (value === '4') {
        document.getElementById('NomineeContent2').style.display = "block";
        document.getElementById('NomineeContent3').style.display = "block";
        document.getElementById('NomineeContent4').style.display = "block";
        document.getElementById('NomineeContent5').style.display = "none";
    }
    else if (value === '5') {
        document.getElementById('NomineeContent2').style.display = "block";
        document.getElementById('NomineeContent3').style.display = "block";
        document.getElementById('NomineeContent4').style.display = "block";
        document.getElementById('NomineeContent5').style.display = "block";
    }
    else {
        document.getElementById('NomineeContent2').style.display = "none";
        document.getElementById('NomineeContent3').style.display = "none";
        document.getElementById('NomineeContent4').style.display = "none";
        document.getElementById('NomineeContent5').style.display = "none";
    }
}

var i = 0, j = 0;
function CreateJointDataDiv() {

    // $("#JointDiv").append("<div class='col-lg-2 col-md-2 col-sm-2 col-xs-12'><div class='form-group form-float'><div class='form-line'><input id=\"jointCustName"+ i +"\" name=\"jointCustName"+ i +"\" type='text' class='form-control ValNumeric' maxlength='10' required><label class='form-label'>Joint Customer Name</label></div></div></div><div class='col-lg-2 col-md-2 col-sm-2 col-xs-12'><div class='form-group form-float'><div class='form-line'><input id=\"jointCustMobNo"+ j +"\" name=\"jointCustMobNo"+ j +"\" type='text' class='form-control ValAlpha' maxlength='100' required><label class='form-label'>Joint Customer Mobile</label></div></div></div>");
    $("#JointDiv").append("<div id=\"JointContent" + i + "\" class='joint-content-data col-lg-12 col-md-12 col-sm-12 col-xs-12' style='padding:0px';><div class='col-lg-4 col-md-4 col-sm-10 col-xs-10'><div class='form-group form-float'><div class='form-line'><input id=\"jointCustName" + i + "\" name=\"jointCustName" + i + "\" type='text' class='form-control ValAlpha' maxlength='50' required><label class='form-label'>Joint Customer Name</label></div></div></div><div class='col-lg-4 col-md-4 col-sm-10 col-xs-10'><div class='form-group form-float'><div class='form-line'><input id=\"jointCustMobNo" + j + "\" name=\"jointCustMobNo" + j + "\" type='text' class='form-control ValNumeric' maxlength='10' required><label class='form-label'>Joint Customer Mobile</label></div></div></div><div class='col-lg-2 col-md-2 col-sm-2 col-xs-2' style='padding-left:0px;'><button onclick=\"DestroyJointDataDiv(" + i + ");\" type='button' class='btn btn-default btn-circle waves-effect waves-circle waves-float'><i class='material-icons' style='margin-left:-2px; margin-top:4px; font-size:20px;'>delete_forever</i></button></div></div>");
    i++;
    j++;
    $(function () {
        $.AdminBSB.input.activate();
    });
}

function DestroyJointDataDiv(value) {
    var remContentId = '#JointContent' + value;
    var jointLength = $("#JointDiv > div").length;
    if (jointLength > 1) {
        $(remContentId).remove();
    }
}

function DestroyAllJointData() {
    var jointLength = $("#JointDiv > div").length;
    if (jointLength > 0) {
        $('.joint-content-data').remove();
        i = 0;
        j = 0;
    }
}

function selNomineeYnOnchange(value) {
    if (value === 'N') {
        document.getElementById('wizard_with_validation-p-2').disabled = true;
        $(".nominee-content").prop('required', false);
    } else {
        document.getElementById('wizard_with_validation-p-2').disabled = false;
        $(".nominee-content").prop('required', true);
    }
}


function InitSubmitFormAjax() {
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
        base64String = reader.result;
        base64String = base64String.split(',');

        var filePasscode = document.getElementById('bFileCode').value;

        if (base64String[1] != null && base64String[1] != '') {
            SaveCustomerIndAccData(base64String[1], filePasscode)
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


function SaveCustomerIndAccData(fileData, filePasscode) {
    debugger;
    var selPrdType = document.getElementById('selPrdType').value;
    var selAccType = document.getElementById('selAccType').value;
    var selMOP = document.getElementById('selMOP').value;
    var selTDS = document.getElementById('selTDS').value;
    var selTitle = document.getElementById('selTitle').value;
    var bName = document.getElementById('bName').value;
    var bFName = document.getElementById('bFName').value;
    var bMName = document.getElementById('bMName').value;
    var selMarital = document.getElementById('selMarital').value;
    var selGender = document.getElementById('selGender').value;
    var bDOB = document.getElementById('bDOB').value;
    var minorDOB = document.getElementById('minorDOB').value;
    var guardianName = document.getElementById('guardianName').value;
    var guardianRelation = document.getElementById('guardianRelation').value;
    var selPolYN = document.getElementById('selPolYN').value;
    var bEmail = document.getElementById('bEmail').value;
    var panNumber = document.getElementById('bPAN').value;
    var bOcc = document.getElementById('bOcc').value;
    var bIncome = document.getElementById('bIncome').value;
    var selNomineYN = document.getElementById('selNomineYN').value;
    var ddlState = document.getElementById('ddlState').value;
    var ddlCity = document.getElementById('ddlCity').value;
    var bDistrict = document.getElementById('bDistrict').value;
    var bHouse = document.getElementById('bHouse').value;
    var bLocality = document.getElementById('bLocality').value;
    var bLandmark = document.getElementById('bLandmark').value;
    var bPinCode = document.getElementById('bPinCode').value;

    var selNomineeNo = document.getElementById('selNomineeNo').value;
    var selNomineeTitle1 = document.getElementById('selNomineeTitle1').value;
    var nomineeName1 = document.getElementById('nomineeName1').value;
    var nomineeRelation1 = document.getElementById('nomineeRelation1').value;
    var nomineeDOB1 = document.getElementById('nomineeDOB1').value;
    var nomineeAddr1_1 = document.getElementById('nomineeAddr1_1').value;
    var nomineeAddr1_2 = document.getElementById('nomineeAddr1_2').value;
    var nomineeAddr1_3 = document.getElementById('nomineeAddr1_3').value;

    var selNomineeTitle2 = document.getElementById('selNomineeTitle2').value;
    var nomineeName2 = document.getElementById('nomineeName2').value;
    var nomineeRelation2 = document.getElementById('nomineeRelation2').value;
    var nomineeDOB2 = document.getElementById('nomineeDOB2').value;
    var nomineeAddr2_1 = document.getElementById('nomineeAddr2_1').value;
    var nomineeAddr2_2 = document.getElementById('nomineeAddr2_2').value;
    var nomineeAddr2_3 = document.getElementById('nomineeAddr2_3').value;

    var selNomineeTitle3 = document.getElementById('selNomineeTitle3').value;
    var nomineeName3 = document.getElementById('nomineeName3').value;
    var nomineeRelation3 = document.getElementById('nomineeRelation3').value;
    var nomineeDOB3 = document.getElementById('nomineeDOB3').value;
    var nomineeAddr3_1 = document.getElementById('nomineeAddr3_1').value;
    var nomineeAddr3_2 = document.getElementById('nomineeAddr3_2').value;
    var nomineeAddr3_3 = document.getElementById('nomineeAddr3_3').value;

    var selNomineeTitle4 = document.getElementById('selNomineeTitle4').value;
    var nomineeName4 = document.getElementById('nomineeName4').value;
    var nomineeRelation4 = document.getElementById('nomineeRelation4').value;
    var nomineeDOB4 = document.getElementById('nomineeDOB4').value;
    var nomineeAddr4_1 = document.getElementById('nomineeAddr4_1').value;
    var nomineeAddr4_2 = document.getElementById('nomineeAddr4_2').value;
    var nomineeAddr4_3 = document.getElementById('nomineeAddr4_3').value;

    var selNomineeTitle5 = document.getElementById('selNomineeTitle5').value;
    var nomineeName5 = document.getElementById('nomineeName5').value;
    var nomineeRelation5 = document.getElementById('nomineeRelation5').value;
    var nomineeDOB5 = document.getElementById('nomineeDOB5').value;
    var nomineeAddr5_1 = document.getElementById('nomineeAddr5_1').value;
    var nomineeAddr5_2 = document.getElementById('nomineeAddr5_2').value;
    var nomineeAddr5_3 = document.getElementById('nomineeAddr5_3').value;

    var NomineeListData = [
        { NomineeTitle: selNomineeTitle1, NomineeName: nomineeName1, NomineeRltn: nomineeRelation1, NomineeDob: nomineeDOB1, NomineeAdd1: nomineeAddr1_1, NomineeAdd2: nomineeAddr1_2, NomineeAdd3: nomineeAddr1_3 },
        { NomineeTitle: selNomineeTitle2, NomineeName: nomineeName2, NomineeRltn: nomineeRelation2, NomineeDob: nomineeDOB2, NomineeAdd1: nomineeAddr2_1, NomineeAdd2: nomineeAddr2_2, NomineeAdd3: nomineeAddr2_3 },
        { NomineeTitle: selNomineeTitle3, NomineeName: nomineeName3, NomineeRltn: nomineeRelation3, NomineeDob: nomineeDOB3, NomineeAdd1: nomineeAddr3_1, NomineeAdd2: nomineeAddr3_2, NomineeAdd3: nomineeAddr3_3 },
        { NomineeTitle: selNomineeTitle4, NomineeName: nomineeName4, NomineeRltn: nomineeRelation4, NomineeDob: nomineeDOB4, NomineeAdd1: nomineeAddr4_1, NomineeAdd2: nomineeAddr4_2, NomineeAdd3: nomineeAddr4_3 },
        { NomineeTitle: selNomineeTitle5, NomineeName: nomineeName5, NomineeRltn: nomineeRelation5, NomineeDob: nomineeDOB5, NomineeAdd1: nomineeAddr5_1, NomineeAdd2: nomineeAddr5_2, NomineeAdd3: nomineeAddr5_3 }
    ]

    var NomineeJson = [];
    var NomineeNo = parseInt(selNomineeNo);
    if (NomineeNo > 0 && selNomineYN === 'Y') {
        NomineeJson = createNomineeJSONList(NomineeNo, NomineeListData);
    }
    else {
        NomineeNo = 0;
    }

    var JointCustJson = GetJointCustData();
    var JointYN = 'N';
    if (JointCustJson.length > 0) {
        JointYN = 'Y';
    }

    var ckATM = document.getElementById('ckATM');
    var ckCB = document.getElementById('ckCB');
    var ckIB = document.getElementById('ckIB');
    var ckAtmYN = "N", ckCbYN = "N", ckIbYN = "N";
    if (ckATM.checked) { ckAtmYN = "Y"; }
    if (ckCB.checked) { ckCbYN = "Y"; }
    if (ckIB.checked) { ckIbYN = "Y"; }

    debugger;
    var Data = {
        ApplType: parseInt(xApplType),
        CustMobNo: xCustMobNo,
        PanNumber: panNumber,
        ExistingCustYN: 'N',
        CbsCustNo: 0,
        ProductType: selPrdType,
        ModeOfOperation: parseInt(selMOP),
        AccountType: parseInt(selAccType),
        TDSYN: selTDS,
        Title: selTitle,
        custBasicInfo: {
            CustId: "",
            CustMobNo: "",
            Name: bName,
            FatherName: bFName,
            MotherName: bMName,
            DOB: bDOB,
            Gender: selGender,
            MaritalStatus: selMarital,
            Email: bEmail,
            Occupation: bOcc,
            AnnualIncome: bIncome,
            PolitcallyExpYN: selPolYN,
            House: bHouse,
            Locality: bLocality,
            Landmark: bLandmark,
            District: bDistrict,
            State: ddlState,
            City: ddlCity,
            PinCode: bPinCode,
            // AadhaarRefId: "",
            // PanNumber: "",
        },
        MinorDOB: minorDOB,
        GuardianName: guardianName,
        GuardianRelation: guardianRelation,
        NomineeYN: selNomineYN,
        NoOfNominee: NomineeNo,
        NomineeDatas: NomineeJson,
        JointYN: JointYN,
        JointRefId: xJointRefId,
        JointCustDatas: JointCustJson,
        ChequeBookYN: ckAtmYN,
        ATMCardYN: ckCbYN,
        INETBankingYN: ckIbYN,
        AadhaarZipInfo: {
            ZipFile: fileData,
            FilePassword: filePasscode
        },
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/SaveCustomerIndAccData",
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
                    if (selLang === "MR") {
                        window.location.href = './CustInfoReview_mr.html';
                    }
                    else {
                        window.location.href = './CustInfoReview.html';
                    }
                });
            }
            else {
                swal("Alert", responseJSON.ResponseMessage, "error");
            }
        },
        error: function () { }
    });
}

function createNomineeJSONList(NomineeNo, list) {
    debugger;
    var maxLen = NomineeNo;
    jsonObj = [];
    for (var i = 0; i < maxLen; i++) {
        params = {};
        params["NomineeTitle"] = list[i].NomineeTitle;
        params["NomineeName"] = list[i].NomineeName;
        params["NomineeRltn"] = list[i].NomineeRltn;
        params["NomineeDob"] = list[i].NomineeDob;
        params["NomineeAdd1"] = list[i].NomineeAdd1;
        params["NomineeAdd2"] = list[i].NomineeAdd2;
        params["NomineeAdd3"] = list[i].NomineeAdd3;

        jsonObj.push(params);
    }
    console.log('jsonObj >>>', jsonObj);
    return jsonObj;
}

function GetJointCustData() {
    debugger;
    jointJsonObj = [];
    var jointDataLen = $('#JointDiv > .joint-content-data').length;
    if (jointDataLen > 0) {
        $(".joint-content-data").each(function () {
            var i = 0;
            var jointCustName = '';
            var jointCustMobNo = '';
            $(this).find('input').each(function () {
                if (i === 0) {
                    jointCustName = $(this).val();
                }
                else {
                    jointCustMobNo = $(this).val();
                }
                i++;
            });
            item = {}
            item["JointCustName"] = jointCustName;
            item["JointCustMob"] = jointCustMobNo;

            jointJsonObj.push(item);
        });
    }
    console.log('jointJsonObj >>>', jointJsonObj);
    return jointJsonObj;
}