var boolInit;
var boolInitSwal;
var Table;

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
        InitDatatable();
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
        GetQueuedCustomer(opUserCode, opUserId);
        setInterval(function () { GetQueuedCustomer(opUserCode, opUserId); }, 10000);
    }
});

async function GetQueuedCustomer(opUserCode, opUserId) {
    var Data = {
        UserCode: opUserCode,
        UserId: opUserId,
        Status: 1
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/GetQueuedCustomer",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                if (responseJSON.CustomerList.length > 0) {
                    var custCount = responseJSON.CustomerList.length;
                    var opCallLogs = responseJSON.OperatorCallLog;
                    $('#countToday').countTo({ from: 0, to: custCount });
                    $('#callsAttended').countTo({ from: 0, to: opCallLogs.CallsAttended });
                    $('#callsAccepted').countTo({ from: 0, to: opCallLogs.CallsAccepted });
                    $('#callsHold').countTo({ from: 0, to: opCallLogs.CallsHold });
                    $('#callsDropped').countTo({ from: 0, to: opCallLogs.CallsDropped });
                    $('#callsRejected').countTo({ from: 0, to: opCallLogs.CallsRejected });
                    $('.count-to').countTo();
                    if (boolInit === true) {
                        boolInit = false;
                        // LoadDatatable(responseJSON.CustomerList);
                        Table.clear().draw();
                        Table.rows.add(responseJSON.CustomerList).draw();
                        swal.close();
                    }
                    else {
                        Table.clear().draw();
                        Table.rows.add(responseJSON.CustomerList).draw();
                    }
                }
            }
            else {
                Table.clear().draw();
                var opCallLogs = responseJSON.OperatorCallLog;
                $('#countToday').countTo({ from: 0, to: 0 });
                $('#callsAttended').countTo({ from: 0, to: opCallLogs.CallsAttended });
                $('#callsAccepted').countTo({ from: 0, to: opCallLogs.CallsAccepted });
                $('#callsHold').countTo({ from: 0, to: opCallLogs.CallsHold });
                $('#callsDropped').countTo({ from: 0, to: opCallLogs.CallsDropped });
                $('#callsRejected').countTo({ from: 0, to: opCallLogs.CallsRejected });
                $('.count-to').countTo();
                if (boolInitSwal === true) {
                    boolInitSwal = false;
                    swal("Alert", "No Active Customers Found!", "info");
                }
                console.log(responseJSON.ResponseCode);
            }
        },
        error: function () {
            $('#countToday').countTo({ from: 0, to: 0 });
            $('#callsAttended').countTo({ from: 0, to: 0 });
            $('#callsAccepted').countTo({ from: 0, to: 0 });
            $('#callsHold').countTo({ from: 0, to: 0 });
            $('#callsDropped').countTo({ from: 0, to: 0 });
            $('#callsRejected').countTo({ from: 0, to: 0 });
            $('.count-to').countTo();
        }
    });
}

function InitDatatable() {
    Table = $('#tblLiveCust').DataTable({
        "aaData": [],
        "columns": [{
            "data": "SchSlotId"
        }, {
            "data": "SchSlotDay"
        }, {
            //format: 'dd/mm/yyyy',
            "data": "SchSlotDate"
        },
        // {
        //     "data": "SchSlotStartTime"
        // }, {
        //     "data": "SchSlotEndTime"
        // },
        {
            "data": "CustId"
        },
        {
            "data": "CustMobNo"
        }, {
            "data": "NameAsAadhaar"
        },
        {
            "data": "Status"
        },
        {
            "data": null
        }],
        "columnDefs": [{
            "targets": -1,
            "data": null,
            "defaultContent": '<button class="btn btn-block bg-deep-purple waves-effect">Start Session</button>'
        }]
    });

    $('#tblLiveCust tbody').on('click', 'button', function () {
        var data = null;
		var current_row = $(this).parents('tr');//Get the current row
        if (current_row.hasClass('child')) {//Check if the current row is a child row
            current_row = current_row.prev();//If it is, then point to the row before it (its 'parent')
             data = Table.row(current_row).data();//At this point, current_row refers to a valid row in the table, whether is a child row (collapsed by the DataTable's responsiveness) or a 'normal' row
        }
        else {
            data = Table.row($(this).parents('tr')).data();
        }
        
        // var data = Table.row($(this).parents('tr')).data();
        var CustMobNo = data["CustMobNo"];
        var CustId = data["CustId"];
        if (CustMobNo != null && CustMobNo != '') {
            swal({
                title: 'Are You Sure?',
                text: 'Your Session Will Start With Customer: ' + CustMobNo,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: 'Yes, I Am Sure!',
                cancelButtonText: "No, Not Now!"
            }, function (isConfirm) {
                if (isConfirm) {
                    sessionStorage.setItem("sesParamSelectedCustId", CustId);
                    sessionStorage.setItem("sesParamSelectedCustMobNo", CustMobNo);
                    window.location = "../OperatorCallIndex.html";
                }
            });
        }
        else {
            swal('Alert!', 'Please Select A Customer', 'error');
        }
    });
}