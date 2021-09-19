$(document).ready(function () {
    var ApplType = sessionStorage.getItem('sesParamApplType');
    if (ApplType === null || ApplType === '') {
        window.location.href = './index.html'
    }
    if (ApplType === '2') {
        document.getElementById('icoAccOpening').style.display = 'inline-block';
        document.getElementById('icoApplyLoan').style.display = 'none';
        document.getElementById('icoReKyc').style.display = 'none';
        document.getElementById('divAccount').style.display = 'block';
        $('#txtJointRefId').prop('required', false);
    }
    else if (ApplType === '5') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'inline-block';
        document.getElementById('icoReKyc').style.display = 'none';
        $('#txtJointRefId').prop('required', false);
    }
    else if (ApplType === '4') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'none';
        document.getElementById('icoReKyc').style.display = 'inline-block';
        $('#txtJointRefId').prop('required', false);
    }

    $("form").submit(function () {
        if ($("form")[0].checkValidity()) {
            var txtMob = document.getElementById("txtMobNo").value;
            var txtJointRefId = document.getElementById("txtJointRefId").value;

            if (txtMob != null && txtMob != "") {
                if (txtMob.length >= 10) {
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
                        allowOutsideClick: false,
                    });
                    ValidateCustomer(txtMob, txtJointRefId);
                }
                else {
                    swal("", "Please Enter A Valid Mobile Number!", "error");
                    return;
                }
            }
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

async function ValidateCustomer(customerMobileNumber, jointRefId) {
    var Data = {
        custMobNo: customerMobileNumber,
        CustRefId: jointRefId
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/ValidateCustomer",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                if (responseJSON.JointRefId != 'NA' && responseJSON.JointRefId != null) {
                    sessionStorage.setItem("sesParamJointRefId", responseJSON.JointRefId);
                }
                else {
                    sessionStorage.setItem("sesParamJointRefId", '');
                }
                sessionStorage.setItem("sesParamExistingCust", 'N');
                GenerateOTP(customerMobileNumber, responseJSON.ResponseCode, '');
            }
            else if (responseJSON.ResponseCode === "100") {
                sessionStorage.setItem("sesParamExistingCust", 'Y');
                sessionStorage.setItem("sesParamCustId", responseJSON.Response);
                GenerateOTP(customerMobileNumber, responseJSON.ResponseCode, responseJSON.ResponseMessage);
            }
            else if (responseJSON.ResponseCode === "104" || responseJSON.ResponseCode === "105") {
                sessionStorage.setItem("sesParamExistingCust", 'Y');
                sessionStorage.setItem("sesParamCustId", responseJSON.Response);
                GenerateOTP(customerMobileNumber, responseJSON.ResponseCode, responseJSON.ResponseMessage);
            }
            else {
                swal("Alert", responseJSON.ResponseMessage, "error");
            }
        },
        error: function () { },
    });
}

function GenerateOTP(customerMobileNumber, respCode, respMsg) {
    var selLang = sessionStorage.getItem("selLanguage");
    var defaultMessage = "";
    var defaultIcon = "";
    var Data = {
        MobNo: customerMobileNumber,
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/GenerateOTP",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            // swal.close();
            if (responseJSON.ResponseCode === "000") {
                var respMobNo = responseJSON.Response.MobNo;
                var respOTP = responseJSON.Response.OTP;
                sessionStorage.setItem("sesParamCustMobNo", respMobNo);
                sessionStorage.setItem("sesParamOtp", respOTP);
                if (respCode === "100") {
                    defaultMessage = respMsg;
                    defaultIcon = "info";
                    swal({
                        title: "Success!",
                        text: defaultMessage,
                        type: defaultIcon
                    }, function (isConfirm) {
                        if(selLang === "MR"){
                            window.location.href = './CustOtp_mr.html';
                        }
                        else{
                            window.location.href = './CustOtp.html';
                        }
                        
                    });
                }
                else if (respCode === "104") {
                    defaultMessage = respMsg;
                    defaultIcon = "info";
                    swal({
                        title: "Success!",
                        text: defaultMessage,
                        type: defaultIcon
                    }, function (isConfirm) {
                        if(selLang === "MR"){
                            window.location.href = './CustOtp_mr.html';
                        }
                        else{
                            window.location.href = './CustOtp.html';
                        }
                    });
                }
                else {
                    if(selLang === "MR"){
                        window.location.href = './CustOtp_mr.html';
                    }
                    else{
                        window.location.href = './CustOtp.html';
                    }
                }
                /*else {
                    defaultMessage = "An OTP Has Been Sent On Your Mobile Number";
                    defaultIcon = "success";
                }
                swal({
                    title: "Success!",
                    text: defaultMessage,
                    type: defaultIcon
                }, function (isConfirm) {
                    window.location.href = './CustOtp.html';
                });*/
            } else {
                swal("Alert", responseJSON.ResponseMessage, "error");
            }
        },
        error: function () { },
    });
}

var btnNewAcc = document.getElementById('btnNewAcc');
var btnJointAcc = document.getElementById('btnJointAcc');


btnNewAcc.addEventListener('click', () => {
    document.getElementById('divTxtMobNo').style.display = "table";
    document.getElementById('divJointRefId').style.display = "none";
    btnNewAcc.disabled = true;
    btnJointAcc.disabled = false;
    $('#txtJointRefId').prop('required', false);
    document.getElementById('txtJointRefId').value = '';
});

btnJointAcc.addEventListener('click', () => {
    document.getElementById('divJointRefId').style.display = "table";
    btnJointAcc.disabled = true;
    btnNewAcc.disabled = false;
    $('#txtJointRefId').prop('required', true);
});