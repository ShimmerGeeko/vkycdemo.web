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
        InitDataTable();
        //Onload
        var nowDate = new Date()
        var month = nowDate.getMonth() + 1;
        var day = nowDate.getDate();
        var year = nowDate.getFullYear();
        if (month < 10)
            month = '0' + month.toString();
        if (day < 10)
            day = '0' + day.toString();
        var todaysDate = year + '-' + month + '-' + day;
        GetPendingCustomers(opUserId, todaysDate, todaysDate);
    }

    $("form").submit(function () {
        if ($("form")[0].checkValidity()) {
            opUserId = sessionStorage.getItem("sesParamOpUserId");
            var FromDate = document.getElementById('fromDate').value;
            var ToDate = document.getElementById('toDate').value;

            var newFromDate = new Date(FromDate)
            var newToDate = new Date(ToDate)
            if (newFromDate > newToDate) {
                swal("Alert", "From Date Can not be greater than To Date", "error")
            }
            else {
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
                GetPendingCustomers(opUserId, FromDate, ToDate);
            }
        }
    });
});

function InitDataTable() {
    Table = $('#tblKYCStatus').DataTable({
        "aaData": [],
        "columns": [
            {
                "data": "ApplicationType"
            }, {
                "data": "CustId"
            }, {
                "data": "CustMobNo"
            }, {
                "data": "Name"
            }, {
                "data": "PanNumber"
            }, {
                "data": "CallStatus"
            }, {
                "data": "AuthStatus"
            }, {
                "data": "Maker"
            }, {
                "data": "Checker"
            }, {
                "data": "CreationDate"
            }, {
                "data": "CreationTime"
            }
        ]
    });

    var buttons = new $.fn.DataTable.Buttons(Table, {
        buttons: [
            'excelHtml5'
        ]
    }).container().appendTo($('#buttons'));
    formatExportButton();
}


async function GetPendingCustomers(opUserId, FromDate, ToDate) {
    var Data = {
        UserId: opUserId,
        FromDate: FromDate,
        ToDate: ToDate
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/GetCustomerKYCRep",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                swal.close();
                if (responseJSON.CustomerKYCDataList.length > 0) {
                    $('.btnExportExcel').prop('disabled', false);
                    Table.clear().draw();
                    Table.rows.add(responseJSON.CustomerKYCDataList).draw();
                    initDonutChart(responseJSON.CustomerKYCDataList);
                }
                else {
                    $('.btnExportExcel').prop('disabled', true);
                    swal('Alert!', 'No Record Found!', 'error');
                    Table.clear().draw();
                }
            }
            else {
                $('.btnExportExcel').prop('disabled', true);
                swal('Alert!', responseJSON.ResponseMessage, 'error');
                Table.clear().draw();
            }
        },
        error: function () {
        }
    });
}

function formatExportButton() {
    var exportBtn = $('#buttons > div > button');
    exportBtn.addClass('btnExportExcel btn btn-block btn-lg bg-deep-purple aves-effect')
    // var exportBtnSpan = $('#buttons > div > .buttons-excel > span');
    var exportBtnSpan = $('.buttons-excel > span');
    debugger;
    exportBtnSpan[0].innerHTML = 'Export Excel';
}

$(function () {
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();

    var maxTodayDate = year + '-' + month + '-' + day;
    $("#toDate").attr("max", maxTodayDate)
    $("#fromDate").attr("max", maxTodayDate)
});



function initDonutChart(chartData) {
    $('#donut_chart svg').empty();
    $('#stacked svg').empty();

    // debugger;
    // donut chart
    var acceptCount = chartData.filter((a) => {
        return a.CallStatus === 'ACCEPTED';
    });
    var holdCount = chartData.filter((h) => {
        return h.CallStatus === 'HOLD';
    });
    var rejectCount = chartData.filter((r) => {
        return r.CallStatus === 'REJECTED';
    });
    var dropCount = chartData.filter((d) => {
        return d.CallStatus === 'DROPPED';
    });

    // bar graph
    var accountOpen = chartData.filter((e) => {
        return e.ApplicationType === 'ACCOUNT OPENING';
    });
    var creditCard = chartData.filter((f) => {
        return f.ApplicationType === 'CREDIT CARD';
    });
    var reKyc = chartData.filter((g) => {
        return g.ApplicationType === 'RE KYC';
    });
    var basicKyc = chartData.filter((g) => {
        return g.ApplicationType === 'BASIC VKYC';
    });

    Morris.Donut({
        element: 'donut_chart',
        data: [{
            label: 'ACCEPTED',
            value: acceptCount.length
        }, {
            label: 'HOLD',
            value: holdCount.length
        }, {
            label: 'DROP',
            value: dropCount.length
        }, {
            label: 'REJECTED',
            value: rejectCount.length
        }],
        colors: ['rgb(255, 152, 0)', 'rgb(0, 188, 212)', 'rgb(0, 150, 136)', 'rgb(233, 30, 99)', 'rgb(96, 125, 139)'],
        formatter: function (y) {
            // return y + '%'
            return y
        }
    });
    Morris.Bar({
        element: 'stacked',
        data: [
            { label: 'Acc Op', a: accountOpen.length },
            { label: 'CC', a: creditCard.length },
            { label: 'Re KYC', a: reKyc.length },
            { label: 'Basic KYC', a: basicKyc.length }
        ],

        xkey: 'label',
        ykeys: ['a'],
        ymax: 4,
        labels: ['Status'],
        lineWidth: '3px',
        fill:['gray','red','red','red']
    });
}

