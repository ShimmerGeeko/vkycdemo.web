var boolInit;
var boolInitSwal;

$(document).ready(function () {
    var opUserId = null, opUserCode = null, opUserRole = null;
    opUserId = sessionStorage.getItem("sesParamOpUserId");
    opUserCode = sessionStorage.getItem("sesParamOpUserCode");
    opUserRole = sessionStorage.getItem("sesParamOpUserRole");
    if (opUserId === null || opUserId === '' || opUserCode === null || opUserCode === '' || opUserRole === null || opUserRole === '') {
        window.location.href = './index.html';
    }
    else {
        document.getElementById('divOpMob').innerHTML = opUserId;
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
        GetPendingCustomers(opUserCode, opUserId);
        setInterval(function () { GetPendingCustomers(opUserCode, opUserId); }, 10000);
    }
});

async function GetPendingCustomers(opUserCode, opUserId) {
    var Data = {
        UserCode: opUserCode,
        UserId: opUserId,
        CallStatus: 3
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/PendingAuthCustomers",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                if (responseJSON.PendingAuthCustList.length > 0) {
                    if (boolInit === true) {
                        boolInit = false;
                        LoadDatatable(responseJSON.PendingAuthCustList);
                        swal.close();
                    }
                    else {
                        var datatable = $('#tblLiveCust').DataTable();
                        datatable.clear();
                        datatable.rows.add(responseJSON.PendingAuthCustList).draw();
                    }
                }
            }
            else {
                var datatable = $('#tblLiveCust').DataTable();
                datatable.clear().draw(false);
                if (boolInitSwal === true) {
                    boolInitSwal = false;
                    swal("Alert", "No Active Customers Found!", "info");
                }
                console.log(responseJSON.ResponseCode);
            }
        },
        error: function () {
        }
    });
}

function LoadDatatable(data) {
    var table = $('#tblLiveCust').DataTable({
        "aaData": data,
        "columns": [{
            "data": "CustId"
        }, {
            "data": "CustMobNo"
        }, {
            "data": "Name"
        }, {
            "data": "PanNumber"
        }, {
            "data": "Maker"
        }, {
            "data": "CreationDate"
        }, {
            "data": "CreationTime"
        }, {
            "data": null
        }],
        "columnDefs": [{
            "targets": -1,
            "data": null,
            "defaultContent": '<button class="btn btn-block bg-deep-purple waves-effect">Select</button>'
        }]
    });

    $('#tblLiveCust tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        var CustId = data["CustId"];
        var CustMobNo = data["CustMobNo"];
        if (CustMobNo != null && CustMobNo != '') {
            sessionStorage.setItem("sesParamSelectedAuthCustId", CustId);
            sessionStorage.setItem("sesParamSelectedAuthCustMobNo", CustMobNo);
            window.location = "./AuthorizationCk.html";
        }
        else {
            swal('Alert!', 'Please Select A Customer', 'error');
        }
        //alert("Customer: " + data["MobileNo"] + " Slot Id: " + data["SchSlotId"]);
    });
}