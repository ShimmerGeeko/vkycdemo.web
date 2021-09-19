var opUserId, opUserCode, opUserRole;
$(document).ready(function () {
    opUserId = null, opUserCode = null, opUserRole = null;
    opUserId = sessionStorage.getItem("sesParamOpUserId");
    opUserCode = sessionStorage.getItem("sesParamOpUserCode");
    opUserRole = sessionStorage.getItem("sesParamOpUserRole");
    if (opUserId === null || opUserId === '' || opUserCode === null || opUserCode === '' || opUserRole === null || opUserRole === '') {
        window.location.href = './index.html';
    }
    else {
        document.getElementById('divOpMob').innerHTML = opUserId;
    }
});

var btnReject = document.querySelector('#clearData');

btnReject.addEventListener("click", function () {
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
    ClearTransactionFlowData()
    /*swal({
        title: 'Are You Sure?',
        text: 'This Will Clear Entire Customer Data!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: 'Yes, I Am Sure!',
        cancelButtonText: "No, Not Now!"
    }, function (isConfirm) {
        if (isConfirm) {
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
            ClearTransactionFlowData()
        }
    });*/
});

function ClearTransactionFlowData() {
    var Data = {
        UserId: opUserId,
        UserRole: parseInt(opUserRole)
    }
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/Login/ClearTransactionFlowData",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                swal('Alert!', 'Operation Complete', 'success');
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
                console.log(responseJSON.ResponseCode)
            }
        },
        error: function () {
            swal.close();
        }
    });
}