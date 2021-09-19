var xCustMobNo = null, xCustId = null;
window.onload = function () {
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    xCustId = sessionStorage.getItem("sesParamCustId");
    if (xCustMobNo === null || xCustMobNo === '' || xCustId === null || xCustId === '') {
        window.location.href = './index.html';
    }
    else {
        swal({
            title: "Loading...",
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
        GetAvailableSchedule();
    }
};

async function GetAvailableSchedule() {
    var Data = {
        CustMobNo: xCustMobNo,
        CustId: xCustId
    };
    $.ajax({
        type: "POST",
        url: schServiceURL + "/api/MainService/GetAvailableSchedule",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                swal.close();
                var AvailSlotList = responseJSON.SlotList;

                var distinctDays = Array.from(new Set(AvailSlotList.map(x => x.SchSlotDay)));

                for (var i = 0; i < distinctDays.length; i++) {
                    var DaySlot = AvailSlotList.filter((x) => { return x.SchSlotDay === distinctDays[i] });
                    GenerateSlots(DaySlot, i);
                }
                document.getElementById('rootDiv').style.display = 'block';
            }
            else {
                swal('Alert!',responseJSON.ResponseMessage,'info');
                document.getElementById('rootDiv').style.display = 'none';
            }
        },
        error: function () {
        }
    });
}

function submitJs() {
    var radSlider = document.getElementsByName('radSlider');

    var ck = false;
    var schTime = ''; var xSchSlotId = ''; var xSchSlotDay = ''; var xSchSlotDate = ''; var xSchSlotStartTime = ''; var xSchSlotEndTime = '';

    for (var i = 0; i < radSlider.length; i++) {
        if (radSlider[i].checked === true) {
            ck = true

            xSchSlotId = radSlider[i].id;
            xSchSlotDay = radSlider[i].getAttribute("slot-day");
            xSchSlotDate = radSlider[i].getAttribute("slot-date");
            xSchSlotStartTime = radSlider[i].value;
            xSchSlotEndTime = radSlider[i].getAttribute("slot-endtime");
            schTime = radSlider[i].value.substr(0, 2) + ':' + radSlider[i].value.substr(2, 2);
            //schTime = radSlider[i].getAttribute("slot-starttime").substr(0, 2) + ':' + radSlider[i].getAttribute("slot-starttime").substr(2, 2);
            break;
        }
    }
    if (ck === false) {
        swal('Alert!', 'Please Select A Slot To Continue!', 'info');
        return;
    }
    else {
        if (xCustMobNo != '' && xSchSlotId != '' && xSchSlotDay != '' && xSchSlotDate != '' && xSchSlotStartTime != '' && xSchSlotEndTime != '' && schTime != '') {
            BookAvailableSlot(xSchSlotId, xSchSlotDay, xSchSlotDate, xSchSlotStartTime, xSchSlotEndTime, schTime);
        }
        else {
            swal('Alert!','Please Select A Slot First!','info');
            return;
        }
    }
}

async function BookAvailableSlot(xSchSlotId, xSchSlotDay, xSchSlotDate, xSchSlotStartTime, xSchSlotEndTime, schTime) {
    var Data = {
        CustId: xCustId,
        CustMobNo: xCustMobNo,
        SchSlotId: xSchSlotId,
        SchSlotDay: xSchSlotDay,
        SchSlotDate: xSchSlotDate,
        SchSlotStartTime: xSchSlotStartTime,
        SchSlotEndTime: xSchSlotEndTime
    };
    $.ajax({
        type: "POST",
        url: schServiceURL + "/api/MainService/BookAvailableSlot",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                swal({
                    title: "Success!",
                    text: 'Your Call Is Scheduled At ' + schTime + ' Hours Details Will Be Sent To You Via Mail & SMS!',
                    type: "success"
                }, function () {
                    window.location.href = './index.html';
                });
            }
            else {
                swal({
                    title: 'Alert!',
                    text: responseJSON.ResponseMessage,
                    type: 'error'
                }, function() {
                    window.location.reload();
                });
            }
        },
        error: function () {
        }
    });
}

function GenerateSlots(slotData, rowDayId) {
    var divRowDay = $("<div/>", {
        id: 'rowDay' + rowDayId,
        class: "row col-md-12 center-block mb-2"
    });
    var divRowHeader = $("<div/>", {
        class: "col-md-12 center-block mb-5",
    });
    var labelRowHeader = $("<div/>", {
        class: "col-form-label-sm mb-1",
        text: "Available Slots For " + slotData[0].SchSlotDate
    });
    //Toggle Badge
    var radRowBadgeId = "radRowBadge" + rowDayId;
    var divRowBadge = $("<div/>", {
        id: radRowBadgeId,
        class: "btn-group btn-group-sm btn-group-toggle",
        "data-toggle": "buttons"
    });
    var labelMorning = $("<label/>", {
        id: "lblM_" + rowDayId,
        class: "btn btn-secondary",
        text: "Morning"
    });
    var inputRadM = $("<input/>", {
        type: "radio",
        id: "radM_" + rowDayId,
        name: "options",
        autocomplete: "off"
    });
    labelMorning.append(inputRadM);

    var labelAfternoon = $("<label/>", {
        id: "lblA_" + rowDayId,
        class: "btn btn-secondary",
        text: "Afternoon"
    });
    var inputRadA = $("<input/>", {
        type: "radio",
        id: "radA_" + rowDayId,
        name: "options",
        autocomplete: "off"
    });
    labelAfternoon.append(inputRadA);

    var labelPostAfternoon = $("<label/>", {
        id: "lblPA_" + rowDayId,
        class: "btn btn-secondary",
        // text: "Post Afternoon"
        text: "Pre - Evening"
    });
    var inputRadPA = $("<input/>", {
        type: "radio",
        id: "radPA_" + rowDayId,
        name: "options",
        autocomplete: "off"
    });
    labelPostAfternoon.append(inputRadPA);

    divRowBadge.append(labelMorning);
    divRowBadge.append(labelAfternoon);
    divRowBadge.append(labelPostAfternoon);

    divRowHeader.append(labelRowHeader);
    divRowHeader.append(divRowBadge);
    divRowDay.append(divRowHeader);

    var distinctSession = Array.from(new Set(slotData.map(x => x.SlotSessionId)));

    for (var i = 0; i < distinctSession.length; i++) {

        var divSessionRowId = "sessionRow_" + distinctSession[i] + "_" + rowDayId;
        var divSessionRow = $("<div/>", {
            id: divSessionRowId,
            class: "row col-md-12 center-block",
            "session-row": distinctSession[i]
        });
        var DaySessionSlot = slotData.filter((x) => { return x.SlotSessionId === distinctSession[i] });

        for (var j = 0; j < DaySessionSlot.length; j++) {

            var divSwitch = $("<div/>", {
                class: "col-6 col-sm-4 col-md-2"
            });
            var labelSwitch = $("<label/>", {
                class: "switch"
            });
            var inputSwitch = $("<input/>", {
                type: "radio",
                class: "switch-input",
                name: "radSlider",
                value: DaySessionSlot[j].SchSlotStartTime,
                id: DaySessionSlot[j].SchSlotId,
                "slot-day": DaySessionSlot[j].SchSlotDay,
                "slot-sessionid": DaySessionSlot[j].SlotSessionId,
                "slot-starttime": DaySessionSlot[j].SchSlotStartTime,
                "slot-endtime": DaySessionSlot[j].SchSlotEndTime,
                "slot-date": DaySessionSlot[j].SchSlotDate
            });
            var spanSwitch = $("<span/>", {
                class: "switch-label",
                "data-on": DaySessionSlot[j].SchSlotStartTime.substr(0, 2) + ':' + DaySessionSlot[j].SchSlotStartTime.substr(2, 2),
                "data-off": DaySessionSlot[j].SchSlotStartTime.substr(0, 2) + ':' + DaySessionSlot[j].SchSlotStartTime.substr(2, 2)
                //"data-on": DaySessionSlot[j].SchSlotStartTime,
                //"data-off": DaySessionSlot[j].SchSlotStartTime
            });
            var spanSwitchHandle = $("<span/>", {
                class: "switch-handle"
            });
            labelSwitch.append(inputSwitch);
            labelSwitch.append(spanSwitch);
            labelSwitch.append(spanSwitchHandle);

            divSwitch.append(labelSwitch);
            divSessionRow.append(divSwitch);
            divRowDay.append(divSessionRow);
        }
        $("#divSlotRows").append(divRowDay);
    }
    BindSwitchToBadge(radRowBadgeId);
    InitSwitchDisplay(rowDayId);
}

function BindSwitchToBadge(radRowBadgeId) {

    var prev = null;
    $("#" + radRowBadgeId + " :input").change(function () {
        (prev) ? prev.value : null;
        if (this !== prev) {
            prev = this;
        }
        ToggleSwitchDisplay(this);
    });
}

function ToggleSwitchDisplay(elRad) {
    var radIdX = elRad.id.split('_');
    var divSession1 = document.getElementById('sessionRow_1_' + radIdX[1]);
    var divSession2 = document.getElementById('sessionRow_2_' + radIdX[1]);
    var divSession3 = document.getElementById('sessionRow_3_' + radIdX[1]);

    if (elRad.id === 'radM_' + radIdX[1] && elRad.checked) {

        if (divSession1 != null) { divSession1.style.display = 'flex'; }
        if (divSession2 != null) { divSession2.style.display = 'none'; }
        if (divSession3 != null) { divSession3.style.display = 'none'; }
    }
    else if (elRad.id === 'radA_' + radIdX[1] && elRad.checked) {

        if (divSession1 != null) { divSession1.style.display = 'none'; }
        if (divSession2 != null) { divSession2.style.display = 'flex'; }
        if (divSession3 != null) { divSession3.style.display = 'none'; }
    }
    else if (elRad.id === 'radPA_' + radIdX[1] && elRad.checked) {

        if (divSession1 != null) { divSession1.style.display = 'none'; }
        if (divSession2 != null) { divSession2.style.display = 'none'; }
        if (divSession3 != null) { divSession3.style.display = 'flex'; }
    }
}

function InitSwitchDisplay(rowDayId) {
    var divSession1 = document.getElementById('sessionRow_1_' + rowDayId);
    var divSession2 = document.getElementById('sessionRow_2_' + rowDayId);
    var divSession3 = document.getElementById('sessionRow_3_' + rowDayId);

    if (divSession1 != null) {
        if (divSession1 != null) { divSession1.style.display = 'flex'; }
        if (divSession2 != null) { divSession2.style.display = 'none'; }
        if (divSession3 != null) { divSession3.style.display = 'none'; }
        var lblM_Id = 'lblM_' + rowDayId;
        var radM_Id = 'radM_' + rowDayId;
        document.getElementById(lblM_Id).className = 'btn btn-secondary active';
        document.getElementById(radM_Id).checked = true;
    }
    else if (divSession2 != null) {
        if (divSession1 != null) { divSession1.style.display = 'none'; }
        if (divSession2 != null) { divSession2.style.display = 'flex'; }
        if (divSession3 != null) { divSession3.style.display = 'none'; }
        var lblA_Id = 'lblA_' + rowDayId;
        var radA_Id = 'radA_' + rowDayId;
        document.getElementById(lblA_Id).className = 'btn btn-secondary active';
        document.getElementById(radA_Id).checked = true;
    }
    else if (divSession3 != null) {
        if (divSession1 != null) { divSession1.style.display = 'none'; }
        if (divSession2 != null) { divSession2.style.display = 'none'; }
        if (divSession3 != null) { divSession3.style.display = 'flex'; }
        var lblPA_Id = 'lblPA_' + rowDayId;
        var radPA_Id = 'radPA_' + rowDayId;
        document.getElementById(lblPA_Id).className = 'btn btn-secondary active';
        document.getElementById(radPA_Id).checked = true;
    }
}
