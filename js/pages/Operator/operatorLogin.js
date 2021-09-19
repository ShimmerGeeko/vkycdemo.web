window.onload = function() {
    sessionStorage.setItem("sesParamOpUserId", '');
    sessionStorage.setItem("sesParamOpUserCode", '');
    sessionStorage.setItem("sesParamOpUserRole", '');
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

function InitAjax() {
    var opUsrId = document.getElementById('opUserId').value;
    var opPwd = document.getElementById('opPassword').value;

    if (opUsrId === null || opUsrId === '' || opPwd === null || opPwd === '') {
        swal("", "Input Cannot Be Blank!", "error");
    }
    else {
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
        ValidateLogin(opUsrId, opPwd)
    }
}

async function ValidateLogin(opUsrId, opPwd) {
    var Data = {
        UserId: opUsrId,
        Password: opPwd
    }
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/Login/ValidateLogin",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                if (responseJSON.UserRole === 1) {
                    console.log("Admin Login!")
                    sessionStorage.setItem("sesParamOpUserId", responseJSON.UserId);
                    sessionStorage.setItem("sesParamOpUserCode", responseJSON.UserCode);
                    sessionStorage.setItem("sesParamOpUserRole", responseJSON.UserRole);
                    window.location.href = "./AdminDashboard.html"
                }
                else if (responseJSON.UserRole === 2) {
                    console.log("Operator Login!")
                    sessionStorage.setItem("sesParamOpUserId", responseJSON.UserId);
                    sessionStorage.setItem("sesParamOpUserCode", responseJSON.UserCode);
                    sessionStorage.setItem("sesParamOpUserRole", responseJSON.UserRole);
                    window.location.href = "./OperatorDashboard.html"
                }
                else if (responseJSON.UserRole === 3) {
                    console.log("Authorizer Login!")
                    sessionStorage.setItem("sesParamOpUserId", responseJSON.UserId);
                    sessionStorage.setItem("sesParamOpUserCode", responseJSON.UserCode);
                    sessionStorage.setItem("sesParamOpUserRole", responseJSON.UserRole);
                    window.location.href = "./AuthorizerDashboard.html"
                }
                else {
                    console.log(responseJSON.UserRole);
                    // swal("UserType: " + responseJSON.UserType + "User Not Found!", "", "error");
                    swal("Code: " + responseJSON.ResponseCode + " User Not Found!", "", "error");
                }
            }
            else {
                // swal("Code: " + responseJSON.ResponseCode + " User Not Found!", "", "error");
                swal('Alert!', responseJSON.ResponseMessage, 'error');
                console.log(responseJSON.ResponseCode)
            }
        },
        error: function () {
        }
    });
}