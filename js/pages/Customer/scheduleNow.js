var xCustMobNo = null, xCustId = null, xLatitude = null, xLongitude = null, clientPublicIP = null, selLang;
window.onload = function () {
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    xCustId = sessionStorage.getItem("sesParamCustId");
    selLang = sessionStorage.getItem("selLanguage");
    if (xCustMobNo === null || xCustMobNo === '' || xCustId === null || xCustId === '') {
        window.location.href = './index.html';
    }
    else {
        GetClientPublicIP();
        if (clientPublicIP === null || clientPublicIP === '') {
            clientPublicIP = 'NA';
        }
    }
}

function GetClientPublicIP() {
    try {
        $.getJSON("https://api.ipify.org?format=json",
            function (data) {
                clientPublicIP = data.ip;
                console.log("IPA >>>", data.ip);
            })
    }
    catch (error) {
        clientPublicIP = 'NA';
        console.log("Unable to get client's IP Address", error);
    }
}

document.getElementById('ck2').addEventListener('change', (event) => {
    if (event.target.checked) {
        GetGeoLocation();
    }
})

function GetGeoLocation() {
    try {
        if (navigator.geolocation) {
            // navigator.geolocation.getCurrentPosition(showPosition);
            //New Implementation
            navigator.geolocation.getCurrentPosition(function (position) {
                var lats = position.coords.latitude;
                var longs = position.coords.longitude;

                if (lats != null && lats != "" && longs != null && longs != "") {
                    console.log(position.coords.latitude + "," + position.coords.longitude);
                    xLatitude = lats;
                    xLongitude = longs;
                    document.getElementById('ck2').checked = true;
                }
                else {
                    swal('Alert!', 'Unable To Fetch Location!', 'error');
                    return;
                }
            }, function () {
                document.getElementById('ck2').checked = false;
            });
        } else {
            swal('Alert!', 'Geolocation not supported by this browser!', 'error');
        }
    }
    catch (err) {
        swal('Alert!', 'Geolocation not supported!', 'error');
        return;
    }
}


function callNow() {
    var ck1 = document.getElementById('ck1');
    var ck2 = document.getElementById('ck2');
    var ck3 = document.getElementById('ck3');
    var ck4 = document.getElementById('ck4');
    if (!ck1.checked || !ck2.checked || !ck3.checked || !ck4.checked) {
        swal("Alert!", "Please Check All Conditions To Proceed!", "error");
        return;
    }
    else {
        if (xLatitude === null || xLatitude === '' || xLongitude === null || xLongitude === '') {
            document.getElementById('ck2').checked = false;
            swal('Alert!', 'Unable To Fetch Geolocation!', 'error');
            return;
        }
        swal({
            title: "Processing...",
            text: "Please Wait",
            // type: "info",
            // icon: "info",
            imageUrl: "../images/Loader-Ellipsis-244px.gif",
            buttons: false,
            showConfirmButton: false,
            // showCancelButton: false,
            // closeOnConfirm: false,
            // showLoaderOnConfirm: false,
            allowOutsideClick: false,
        });
        SaveCustomerPermissionData();
    }
}

async function SaveCustomerPermissionData() {
    var Data = {
        CustId: xCustId,
        CustMobNo: xCustMobNo,
        LocationPermYN: "Y",
        Geolocation: {
            Latitude: xLatitude,
            Longitude: xLongitude
        },
        IndianCitizenYN: "Y",
        AadhaarPermYN: "Y",
        NomineeDeclYN: "N",
        TCYN: "Y",
        CreatedByIP: clientPublicIP
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/SaveCustomerPermissionData",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                GetLiveCallSchedule();
            }
            else {
                console.log(responseJSON.ResponseCode);
                swal('Alert!', responseJSON.ResponseMessage, 'error');
            }
        },
        error: function () {
        }
    });
}

async function GetLiveCallSchedule() {
    var Data = {
        CustMobNo: xCustMobNo,
        CustId: xCustId
    };
    $.ajax({
        type: "POST",
        url: schServiceURL + "/api/MainService/GetLiveCallSchedule",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            debugger;
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                swal.close();
                console.log(responseJSON.Response.Message);
                var SlotId = responseJSON.Response.SlotId;
                var SlotBound = responseJSON.Response.SlotBound;
                var SchSlotDay = responseJSON.Response.SchSlotDay;
                var SlotDate = responseJSON.Response.SlotDate
                var SlotDateDisplay = responseJSON.Response.SlotDateDisplay;
                var SlotStartTime = responseJSON.Response.SlotStartTime;
                var SlotStartTimeDisplay = responseJSON.Response.SlotStartTimeDisplay;
                var SchSlotEndTime = responseJSON.Response.SchSlotEndTime;

                debugger;
                if (SlotBound === '2') {
                    //Production Script
                    showCounterModal(SlotDateDisplay, SlotStartTimeDisplay, responseJSON.ServerTimeResponse.ServerDate, responseJSON.ServerTimeResponse.ServerTime);
                    //Demo Script
                    //DemoCounterModal();
                }
                else {
                    //Demo Script
                    DemoCounterModal();
                    // if(selLang === "MR") {
                    //     window.location.href = "./CustCallIndex_mr.html";
                    // }
                    // else {
                    //     window.location.href = "./CustCallIndex.html";
                    // }
                }
            }
            else if (responseJSON.ResponseCode === "200") {
                swal.close();
                var SlotDateDisplay = responseJSON.Response.SlotDateDisplay;
                var SlotStartTimeDisplay = responseJSON.Response.SlotStartTimeDisplay;
                showCounterModal(SlotDateDisplay, SlotStartTimeDisplay, responseJSON.ServerTimeResponse.ServerDate, responseJSON.ServerTimeResponse.ServerTime);
                //Demo Script
                //DemoCounterModal();
            }
            else if (responseJSON.ResponseCode === "101") {
                swal('Alert!', responseJSON.Response.Message, 'error');
                swal({
                    title: 'Alert!',
                    text: responseJSON.Response.Message + '. Please Reschedule Your Call!',
                    type: 'error'
                }, function () {
                    window.location.href = "./ScheduleLater.html";
                });
            }
            else {
                console.log(responseJSON.ResponseCode);
                swal({
                    title: 'Alert!',
                    text: responseJSON.Response.Message,
                    type: 'error'
                }, function () {
                    window.location.href = "./ScheduleLater.html";
                });
            }
        },
        error: function () {
        }
    });
}

function scheduleCall() {
    window.open('./ScheduleLater.html', '_blank');
}

function DemoCounterModal() {
    // var timeleft = 11;
    try {
        if (selLang === "MR") {
            window.location.href = "./CustCallIndex_mr.html";
        }
        else {
            window.location.href = "./CustCallIndex.html";
        }
    } catch (error) {
        console.log(error, "error is in demo counter");
    }
    // var downloadTimer = setInterval(function () {
    //     timeleft--;
    //     var display = document.querySelector('#clock-b');
    //     document.getElementById("min").innerHTML = '00';
    //     document.getElementById("sec").innerHTML = timeleft.toString().padStart(2, "0");
    //     if (timeleft <= 0) {
    //         clearInterval(downloadTimer);
    //         if(selLang === "MR") {
    //             window.location.href = "./CustCallIndex_mr.html";
    //         }
    //         else {
    //             window.location.href = "./CustCallIndex.html";
    //         }
    //     }
    // }, 1000);
    debugger;
    $("#counterModal").modal({ backdrop: 'static', keyboard: false });
}

function showCounterModal(SlotDateDisplay, SlotStartTimeDisplay, serverDate, serverTime) {
    debugger;
    // Set the date we're counting down to
    var serverCountdownDate = SlotDateDisplay + ' ' + SlotStartTimeDisplay;
    var countDownDate = new Date(serverCountdownDate).getTime();

    var serverNowDate = new Date(serverDate + ' ' + serverTime);
    var serverNowDateTime = serverNowDate.getTime();
    if (countDownDate - serverNowDateTime < 0) {
        if (selLang === "MR") {
            window.location.href = "./CustCallIndex_mr.html";
        }
        else {
            window.location.href = "./CustCallIndex.html";
        }
        return;
    }

    // Update the count down every 1 second

    // var x = setInterval(function () {

    // Get today's date and time
    // var now = new Date().getTime();
    try {
        serverNowDate.setSeconds(serverNowDate.getSeconds() + 1);
        var serverClock = serverNowDate.getTime();
        var distance = countDownDate - serverClock;

        // Time calculations for days, hours, minutes and seconds
        //var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        //var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var display = document.querySelector('#clock-b');
        document.getElementById("min").innerHTML = minutes.toString().padStart(2, "0");
        document.getElementById("sec").innerHTML = seconds.toString().padStart(2, "0");

        // If the count down is over, write some text 
        // if (distance < 0) {
        //     clearInterval(x);
            document.getElementById("min").innerHTML = '00';
            document.getElementById("sec").innerHTML = '00';
            if (selLang === "MR") {
                window.location.href = "./CustCallIndex_mr.html";
            }
            else {
                window.location.href = "./CustCallIndex.html";
            }
        // }
    } catch (error) {
        console.log(error, "this is showCounter Modal");
    }
    $("#counterModal").modal({ backdrop: 'static', keyboard: false });
}

$(function () {
    function reposition() {
        var modal = $(this),
            dialog = modal.find('.modal-dialog');
        modal.css('display', 'block');

        // Dividing by two centers the modal exactly, but dividing by three 
        // or four works better for larger screens.
        dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
    }
    // Reposition when a modal is shown
    $('.modal').on('show.bs.modal', reposition);
    // Reposition when the window is resized
    $(window).on('resize', function () {
        $('.modal:visible').each(reposition);
    });
});

/*jquery countdown
function showCounterModal(slotDate, slotStartTime) {
    var countdownDateTime = slotDate + ' ' + slotStartTime + ':00';
    $(function () {
        $('#clock').countdown(countdownDateTime).on('update.countdown', function (event) {
            var $this = $(this).html(event.strftime(''
                // + '<div class="holder m-2"><span class="h1 font-weight-bold">%D</span> Day%!d</div>'
                // + '<div class="holder m-2"><span class="h1 font-weight-bold">%H</span> Hr</div>'
                + '<div class="holder m-2"><span class="h1 font-weight-bold">%M</span> Min</div>'
                + '<div class="holder m-2"><span class="h1 font-weight-bold">%S</span> Sec</div>'));
        });

        $('#clock').countdown(countdownDateTime).on('finish.countdown', function (event) {
            console.log(event.elapsed);
            if (event.elapsed) {
                window.location.href = "./index.html";
            }
        });
    });
    $("#counterModal").modal({ backdrop: 'static', keyboard: false });
}*/