const serviceURLx = 'http://192.168.4.25/FinConnect.VKYC/FinConnectVKYC.svc';
// const serviceURLx = 'http://localhost:64601/FinConnectVKYC.svc';

var opUsrId = null;
opUsrId = sessionStorage.getItem("sesParamOpMob");

var clientTimestamp = (new Date()).valueOf();

var Data = {
    OperatorMobileNo: opUsrId,
    requestClientTime: clientTimestamp
};
$.ajax({
    type: "POST",
    url: serviceURLx + "/FinVKYC/GetServerDateTime/1.0",
    dataType: "JSON",
    data: JSON.stringify(Data),
    contentType: "application/json; charset=utf-8",
    success: function (responseData) {
        var responseJSON = JSON.parse(JSON.stringify(responseData));
        if (responseJSON.ResponseCode === "000") {

            // New Logic
            var x = clientReqTimestamp = clientTimestamp;
            var y = serverTimestamp = responseJSON.Response.ServTimestamp * 1000;
            var z = clientRespTimestamp = (new Date()).valueOf();

            var reqElapsed = Math.abs(z - x);
            var respElapsed = Math.abs(z - y);

            var serverNewTime = z + respElapsed;

            //Init Server Clock
            setInterval(function () {
                var servClockdt = new Date(serverNewTime += 1000);
                var month = servClockdt.toLocaleString('default', { month: 'short' });
                // var servDateString = ("0" + servClockdt.getDate()).slice(-2) + "/" + ("0"+(servClockdt.getMonth()+1)).slice(-2) + "/" + servClockdt.getFullYear();
                var servDateString = ("0" + servClockdt.getDate()).slice(-2) + " " + month + " " + servClockdt.getFullYear();
                var serverTimeString = ("0" + servClockdt.getHours()).slice(-2) + ":" + ("0" + servClockdt.getMinutes()).slice(-2) + ":" + ("0" + servClockdt.getSeconds()).slice(-2);

                var divServerClock = document.getElementById('serverClock');
                divServerClock.style.color = '#ffffff';
                divServerClock.style.position = 'absolute';
                divServerClock.style.right = '15px';
                divServerClock.style.top = '15px';
                divServerClock.style.textAlign = 'right';
                document.getElementById('serverClock').innerHTML = servDateString + '<br/>' + serverTimeString;
            }, 1000);

            // NTP Protocol #START#
            // var nowTimeStamp = (new Date()).valueOf();
            // var serverClientRequestDiffTime = responseJSON.Response.ServClientRequestDiffTime;
            // var serverTimestamp = responseJSON.Response.ServTimestamp;
            // var serverClientResponseDiffTime = nowTimeStamp - serverTimestamp;

            //***Old Formula***
            //var responseTime = (serverClientRequestDiffTime - nowTimeStamp + clientTimestamp - serverClientResponseDiffTime) / 2;
            //var syncedServerTime = new Date((new Date()).valueOf() + (serverClientResponseDiffTime - responseTime));

            //***New Formula***
            // var syncedServerTime = clientTime + (data.Diff + (data.ServerTime - nowTimeStamp)) / 2
            //var syncedServerTime = new Date(clientTimestamp + (serverClientRequestDiffTime + serverClientResponseDiffTime) / 2);
            // NTP Protocol #END#

            // swal("", syncedServerTime, "info");
            //alert(syncedServerTime);
        }
        else {
            swal("", "Unable To Fetch Server Time!", "info");
            console.log(responseJSON.ResponseCode);
        }
    },
    error: function () {
    }
});