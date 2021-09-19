var xOTP = null;
var xCustMobNo = null;
window.onload = function () {
    var ApplType = sessionStorage.getItem('sesParamApplType');
    if (ApplType === '1') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'none';
        document.getElementById('icoReKyc').style.display = 'none';
        document.getElementById('icoCC').style.display = 'none';
        document.getElementById('icoBKyc').style.display = 'inline-block';
    }
    else if (ApplType === '2') {
        document.getElementById('icoAccOpening').style.display = 'inline-block';
        document.getElementById('icoApplyLoan').style.display = 'none';
        document.getElementById('icoReKyc').style.display = 'none';
        document.getElementById('icoCC').style.display = 'none';
        document.getElementById('icoBKyc').style.display = 'none';
    }
    else if (ApplType === '3') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'none';
        document.getElementById('icoReKyc').style.display = 'none';
        document.getElementById('icoCC').style.display = 'inline-block';
        document.getElementById('icoBKyc').style.display = 'none';
    }
    else if (ApplType === '4') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'none';
        document.getElementById('icoReKyc').style.display = 'inline-block';
        document.getElementById('icoCC').style.display = 'none';
        document.getElementById('icoBKyc').style.display = 'none';
    }
    else if (ApplType === '5') {
        document.getElementById('icoAccOpening').style.display = 'none';
        document.getElementById('icoApplyLoan').style.display = 'inline-block';
        document.getElementById('icoReKyc').style.display = 'none';
        document.getElementById('icoCC').style.display = 'none';
        document.getElementById('icoBKyc').style.display = 'none';
    }

    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    //Demo Script
    
    xOTP = sessionStorage.getItem("sesParamOtp");
    if (xCustMobNo === null || xCustMobNo === '' || xOTP === null || xOTP === '') {
        window.location.href = './index.html';
    }
    else {
        swal("", "Your OTP Is: " + xOTP, "info");
        document.getElementById('txtOTP').value = xOTP;
    }
    
    //Final Script
    //swal('Alert!', 'An OTP Has Been Sent On Your Mobile Number!', 'success');
}

$(".ValNumeric").on("input", function (event) {
    this.value = this.value.replace(/[^0-9]/g, "");
});

$(document).ready(function () {
    $("form").submit(function () {
        if ($("form")[0].checkValidity()) {
            var txtOTP = document.getElementById("txtOTP").value;
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
            ValidateOTP(txtOTP)
        }
        //else {alert('Fields Are Required!')}
    });
});

async function ValidateOTP(txtOTP) {
    var Data = {
        MobNo: xCustMobNo,
        OTP: txtOTP,
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/ValidateOTP",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                var xExistingCust = sessionStorage.getItem("sesParamExistingCust");
                var xCustId = sessionStorage.getItem("sesParamCustId");
                if (xExistingCust === 'Y' && xCustId != null && xCustId != '') {
                    swal({
                        title: "Success!",
                        text: "OTP Validated Successfully!",
                        type: "success"
                    }, function () {
                        var selLang = sessionStorage.getItem("selLanguage");
                        if(selLang === "MR") {
                            window.location.href = './ScheduleNow_mr.html';
                        }
                        else {
                            window.location.href = './ScheduleNow.html';
                        }
                    });
                }
                else {
                    swal({
                        title: "Success!",
                        text: "OTP Validated Successfully!",
                        type: "success"
                    }, function () {
                        var ApplType = sessionStorage.getItem('sesParamApplType');
                        var selLang = sessionStorage.getItem("selLanguage");
                        if(selLang === "MR") {
                            if (ApplType === '1') {
                                window.location.href = './CustInfo_mr.html';
                            }
                            else if (ApplType === '2') {
                                window.location.href = './AccountType_mr.html';
                            }
                            else if (ApplType === '3') {
                                window.location.href = './CustInfoCC_mr.html';
                            }
                            else if (ApplType === '4') {
                                window.location.href = './CustInfoReKYC_mr.html';
                            }
                            else if (ApplType === '5') {
                            }
                        }
                        else {
                           
                            if (ApplType === '1') {
                                window.location.href = './CustInfo.html';
                            }
                            else if (ApplType === '2') {
                                window.location.href = './AccountType.html';
                            }
                            else if (ApplType === '3') {
                                window.location.href = './CustInfoCC.html';
                            }
                            else if (ApplType === '4') {
                                window.location.href = './CustInfoReKYC.html';
                            }
                            else if (ApplType === '5') {
                            }
                        }
                    });
                }
            } else {
                swal("Alert", responseJSON.ResponseMessage, "error");
            }
        },
        error: function () { },
    });
}

/*
//v2.x with promise
swal({
    title: "Error",
    text: "Unauthorized Access! Redirecting To Login.",
    type: "error"
}).then(function () {
    window.location.href = './Operatorlogin.html';
});
//v1.x with callback
swal({
    title: "Success!",
    text: "OTP Validated Successfully!",
    type: "success"
}, function () {
    window.location.href = './CustInfo.html';
});
*/