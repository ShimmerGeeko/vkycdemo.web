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
    }
    else if (ApplType === '5') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'inline-block';
        document.getElementById('icoReKyc').style.display = 'none';
    }
    else if (ApplType === '4') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'none';
        document.getElementById('icoReKyc').style.display = 'inline-block';
    }

    $("form").submit(function () {
        if ($("form")[0].checkValidity()) {
            var txtMob = document.getElementById("txtMobNo").value;
            var txtCbsCustNo = document.getElementById("txtCbsCustNo").value;

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
                    // ValidateCustomer(txtMob)
                    ValidateCBSCustNo(txtCbsCustNo, txtMob);
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

function ValidateCBSCustNo(txtCbsCustNo, txtMob) {
    var OperationDate = new Date();
    var Data = {
        CustNo: parseInt(txtCbsCustNo),
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
                var key = responseJSON.key
                if (key != null) {
                    if (key.PagerNo != txtMob) {
                        swal("Alert", "Please Enter Your Registered Mobile Number To Proceed!", "error");
                    }
                    else {
                        ValidateCustomer(txtMob, txtCbsCustNo);
                    }
                } else {
                    swal("Alert", "No Record Found!", "error");
                }
            }
            else {
                swal("Alert", "No Record Found!", "error");
            }
        },
        error: function (err) {
            swal("Alert!", err, 'error');
        }
    });
}

async function ValidateCustomer(customerMobileNumber, txtCbsCustNo) {
    var Data = {
        custMobNo: customerMobileNumber,
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/ValidateCustomer",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            sessionStorage.setItem("sesParamCBSCustNo", txtCbsCustNo);
            if (responseJSON.ResponseCode === "000") {
                sessionStorage.setItem("sesParamExistingCust", 'N');
                GenerateOTP(customerMobileNumber, responseJSON.ResponseCode, '');
            }
            else if (responseJSON.ResponseCode === "100") {
                // swal({
                //     title: "Alert!",
                //     text: responseJSON.ResponseMessage,
                //     type: "info"
                // }, function () {
                //     sessionStorage.setItem("sesParamExistingCust", 'Y');
                //     sessionStorage.setItem("sesParamCustId", responseJSON.Response);
                //     GenerateOTP(customerMobileNumber, responseJSON.ResponseCode, responseJSON.ResponseMessage);
                // });
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
            } else {
                swal("Alert", responseJSON.ResponseMessage, "error");
            }
        },
        error: function () { },
    });
}