var name;
var connectedUser;
var clientPublicIP;

var RTCPeerConn;
var stream;
var remoteStream;
var dataChannel;
var videoFlag = 0;
var videoImage = false;
let camToggle = 0;

var xCustMobNo;
var xCustId;

//Signaling Server
conn = new WebSocket(webSocketURL);

window.onload = function () {
    xCustMobNo = null; xCustId = null; clientPublicIP = null;
    xCustMobNo = sessionStorage.getItem("sesParamCustMobNo");
    xCustId = sessionStorage.getItem("sesParamCustId");
    if (xCustMobNo === null || xCustMobNo === '' || xCustId === null || xCustId === '') {
        window.location.href = './index.html';
    }
    else {
        name = xCustMobNo;
        swal({
            title: "Processing...",
            text: "Please Wait",
            // type: "info",
            // icon: "info",
            imageUrl: "../images/Loader-Ellipsis-244px.gif",
            // imageUrl: "../images/incommingCall.gif",
            buttons: false,
            showConfirmButton: false,
            // showCancelButton: false,
            // closeOnConfirm: false,
            // showLoaderOnConfirm: false,
            allowOutsideClick: false
        });
        // GetClientPublicIP();
    }
}

function GetClientPublicIP() {
    try {
        // $.getJSON("https://api.ipify.org?format=json",
        //     function (data) {
        //         clientPublicIP = data.ip;
        //         console.log("IPA >>>", data.ip);
        //         InitVideo();
        //     })
        // clientPublicIP = 'NA';
        // InitVideo();
    }
    catch (error) {
        clientPublicIP = 'NA';
        InitVideo();
        console.log("Unable to get client's IP Address", error);
    }
}

///Socket Region #BEGIN
conn.onopen = function () {
    console.log("Connected to the signaling server");
    clientPublicIP = 'NA';
    InitVideo();
};

//when we got a message from a signaling server 
conn.onmessage = function (msg) {
    // console.log("Got message", msg.data);
    var data = JSON.parse(msg.data);

    switch (data.type) {
        case "login":
            handleLogin(data.success);
            break;
        //when somebody wants to call us 
        case "offer":
            handleCall(data.offer, data.name);
            //  handleOffer(data.offer,data.name);	 
            break;
        case "restartoffer":
            handleIceRestart(data.offer, data.name);
            break;
        case "answer":
            handleAnswer(data.answer);
            break;
        //when a remote peer sends an ice candidate to us 
        case "candidate":
            handleCandidate(data.candidate);
            break;
        case "leave":
            handleLeave();
            break;
        default:
            break;
    }
};

conn.onerror = function (err) {
    console.log("Got error", err);
    swal({
        title: "Alert!",
        text: "Failed To Establish Connection!",
        type: "error",
        confirmButtonText: "Retry"
    }, function () {
        window.location.reload();
    });
};

//alias for sending JSON encoded messages 
function send(message) {
    try {
        //attach the other peer username to our messages 
        if (connectedUser) {
            message.name = connectedUser;
        }
        conn.send(JSON.stringify(message));
    }
    catch (err) {
        swal({
            title: "Alert!",
            text: err,
            type: "error",
            confirmButtonText: "Retry"
        }, function () {
            window.location.reload();
        });
    }
};


var handleDataChannelError = function (error) {
    console.log("dataChannel.OnError:", error);
};

var handleDataChannelClose = function (event) {
    console.log("dataChannel.OnClose", event);
};

var handleDataChannelOpen = function (event) {
    console.log("dataChannel.OnOpen", event);
    dataChannel.send("Init DataChannel Open!");
};

var handleDataChannelMessageReceived = function (event) {
    console.log("dataChannel.OnMessage:", event);
    //chatArea.innerHTML += connectedUser + ": " + event.data + "<br />";
    console.log("Message Received on Channel");
};

var handleChannelCallback = function (event) {
    dataChannel = event.channel;
    dataChannel.onopen = handleDataChannelOpen;
    dataChannel.onmessage = handleDataChannelMessageReceived;
    dataChannel.onerror = handleDataChannelError;
    dataChannel.onclose = handleDataChannelClose;
};


function InitVideo() {
    if (videoImage == true) {
        videoImage = false;
        stopVideo();
        console.log("Video Image True");
        return;
    }

    if (name.length > 0 && videoFlag == 0) {
        send({
            type: "login",
            name: name
        });
        videoImage = true;
        videoFlag = 1;
        streamType = "video";
        audioFlag = 1;
        streamType = "video";
        //mainPanel.style.display = "block";
        return;
    }

    if (videoImage == false) {
        videoImage = true;
        startVideo();
        console.log("Video Image False");
        return;
    }
}


//Start video if video is off
function startVideo() {
    console.log("Inside Start Video");
    stream.getVideoTracks()[0].enabled = true;
}

//stop video if video is started
function stopVideo() {
    console.log("Inside stop video");
    stream.getVideoTracks()[0].enabled = false;
}


function handleLogin(success) {
    if (success === false) {
        alert("Oops! Username Already Taken, Try Something Else!");
    } else {

        console.log("Inside Handle login");
        //********************** 
        //Starting a peer connection 
        //********************** 
        console.log("Starting Peer Video");
        //getting local video stream 

        navigator.webkitGetUserMedia({ video: { aspectRatio: { ideal: 1 } }, audio: true }, function (myStream) {
            console.log('Inside Get User Media');
            stream = myStream;
alert(stream);
            localVideo.srcObject = stream;
            localVideo.play();

            GenerateCustomerVerificationCode();

            console.log("Local video started");
            console.log(stream.getTracks());
            //using Google public stun server 
            var configuration = {
                "iceServers": [{ "url": stunURL }, { "url": turnURL, "username": turnUsername, "credential": turnCredential }]
            };

            RTCPeerConn = new webkitRTCPeerConnection(configuration, { optional: [{ RTCDataChannel: true }] });

            // setup stream listening 
            RTCPeerConn.addStream(stream);

            //when a remote user adds stream to the peer connection, we display it 
            RTCPeerConn.onaddstream = function (e) {
                //  remoteVideo.src = window.URL.createObjectURL(e.stream); 

                remoteStream = e.stream;
                remoteVideo.srcObject = e.stream;
                remoteVideo.play();
            };

            // Setup ice handling 
            RTCPeerConn.onicecandidate = function (event) {
                if (event.candidate) {
                    send({
                        type: "candidate",
                        candidate: event.candidate
                    });
                }
            };

            RTCPeerConn.oniceconnectionstatechange = (event) => {
                RTCPeerConn.iceConnectionState;
                var btnIceConnStats = document.getElementById('btnIceConnStats');
                if (RTCPeerConn.iceConnectionState === 'checking') {
                    btnIceConnStats.innerHTML = 'Connecting...';
                    btnIceConnStats.className = 'btn bg-orange btn-lg btn-block';
                 }
                else if (RTCPeerConn.iceConnectionState === 'connected') {
                    btnIceConnStats.innerHTML = 'Connected';
                    btnIceConnStats.className = 'btn bg-green btn-lg btn-block';
                }
                else if (RTCPeerConn.iceConnectionState === 'failed') {
                    remoteVideo.srcObject = null;
                    btnIceConnStats.innerHTML = 'Failed';
                    btnIceConnStats.className = 'btn bg-red btn-lg btn-block';
                    swal('Alert!', 'Unable To Establish Peer Connection!', 'error');
                }
                else if (RTCPeerConn.iceConnectionState === 'disconnected') {
                    // remoteVideo.srcObject = null;
                    btnIceConnStats.innerHTML = 'Disconnected';
                    btnIceConnStats.className = 'btn bg-red btn-lg btn-block';
                    swal('Alert!', 'Peer Disconnected!', 'error');
                }
                else if (RTCPeerConn.iceConnectionState === 'closed') {
                    // Current local peer has shut down and is no longer handling requests.
                    // Shall require a refresh
                    remoteVideo.srcObject = null;
                    btnIceConnStats.innerHTML = 'Closed';
                    btnIceConnStats.className = 'btn bg-red btn-lg btn-block';
                    swal('Alert!', 'Local Peer Connection Closed!', 'error');
                }
            }

            RTCPeerConn.ondatachannel = handleChannelCallback;

            //Putting code for data communication

            dataChannel = RTCPeerConn.createDataChannel("channel1", { reliable: true });


            console.log("Data Channel Created");

            dataChannel.onopen = handleDataChannelOpen;
            dataChannel.onmessage = handleDataChannelMessageReceived;
            dataChannel.onerror = handleDataChannelError;
            dataChannel.onclose = handleDataChannelClose;

            /*dataChannel.onerror = function (error) { 
                 console.log("Ooops...error:", error); 
                 }; 
         
            console.log("DataChannel Ready State  : " + dataChannel.readyState);
         
            dataChannel.onmessage = function (event) { 
                  chatArea.innerHTML += connectedUser + ": " + event.data + "<br />"; 
            }; 
         
            dataChannel.onclose = function () { 
                  console.log("data channel is closed"); 
            };*/
        }, function (error) {
            console.log(error);
            swal()
        });
    };
};





//Video Facing
const supports = navigator.mediaDevices.getSupportedConstraints();
var videoFaceConfig = null;
if (!supports['facingMode']) {
    videoFaceConfig = false;
    swal('Alert!', 'This browser does not support Multi Camera Switch!', 'warning');
}
else {
    videoFaceConfig = true;
}
const capture = async facingMode => {
    const options = {
        audio: true,
        video: {
            facingMode,
            aspectRatio: { ideal: 1 }
        },
    };

    try {
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia(options);

        RTCPeerConn.getSenders()[0].replaceTrack(stream.getAudioTracks()[0]);
        RTCPeerConn.getSenders()[1].replaceTrack(stream.getVideoTracks()[0]);
    } catch (e) {
        swal('Alert!', e, 'error');
        return;
    }
    localVideo.srcObject = null;
    localVideo.srcObject = stream;
    localVideo.play();
}

function camflip() {
    if (videoFaceConfig === true) {
        camToggle = 1 - camToggle;
        if (camToggle === 0) {
            capture('user');
        }
        else {
            capture('environment');
        }
    }
    else {
        document.getElementById('btnFlip').disabled = true;
    }
}



//Accept or Decline the offer
function handleCall(offer, name) {
    debugger;
    connectedUser = name;
    RTCPeerConn.setRemoteDescription(new RTCSessionDescription(offer));
    swal({
        title: 'Incomming Call',
        text: 'Operator ' + connectedUser + ' is calling...',
        // type: 'warning',
        imageUrl: "../images/incommingCall-scaled.gif",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: 'Accept',
        cancelButtonText: "Reject"
    }, function (isConfirm) {
        if (isConfirm) {
            handleOffer(offer, name);
            var callStatusSpan = document.getElementById('callStatusSpan');
            callStatusSpan.innerHTML = "Connected";
            callStatusSpan.className = '';
            swal.close();
        } else {
            //Rejected
            swal.close();
        }
    });

    /*
    var callIconHtml = '<i class="fa fa-phone mr-2 blink" aria-hidden="true" style="font-weight:bold; font-size:large;"></i>';
    alertify.confirm(callIconHtml + ' Operator ' + connectedUser + ' is calling...', function (e) {
        if (e) {
            handleOffer(offer, name);
        } else {
            // Rejected
        }
    }).set({ labels: { ok: 'Accept', cancel: 'Decline' } });
    */
    //.set({labels:{ok:'Accept', cancel: 'Decline'}, padding: false});
}

//when somebody sends us an offer 
function handleOffer(offer, name) {
    // connectedUser = name;
    // RTCPeerConn.setRemoteDescription(new RTCSessionDescription(offer));

    //create an answer to an offer 
    RTCPeerConn.createAnswer(function (answer) {
        RTCPeerConn.setLocalDescription(answer);

        send({
            type: "answer",
            answer: answer
        });

    }, function (error) {
        swal("Alert!", "Error While Creating An Answer", "error");
    });
    console.log("Executed the Original Offer");
    console.log("Data Channel Ready State in handle offer " + dataChannel.readyState);
};

function handleIceRestart(offer, name) {
    debugger;
    RTCPeerConn.setRemoteDescription(new RTCSessionDescription(offer));
    swal("Alert!", "Reconnected", "success");
}

function handleLeave() {
    connectedUser = null;
    remoteVideo.srcObject = null;

    RTCPeerConn.close();
    RTCPeerConn.onicecandidate = null;
    RTCPeerConn.onaddstream = null;

    var Data = {
        CustId: xCustId,
        CustMobNo: xCustMobNo
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/CheckCustomerStatusOnDisconnect",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                var zResponse = responseJSON.Response;
                if (zResponse.CallStatus === 2) {
                    // callStatusSpan.innerHTML = "Waiting for Operator to connect...";
                    // callStatusSpan.className = 'blink';
                    // swal('Alert!', 'Operator Disconnected, Please Wait For Someone To Join!', 'info');

                    swal({
                        title: "Alert!",
                        text: 'Operator Disconnected, Please Wait For Someone To Join!',
                        type: "info"
                    }, function () {
                        window.location.reload();
                    });

                }
                else if (zResponse.CallStatus === 3) {
                    swal({
                        title: "Alert!",
                        text: 'Your KYC Request Has Been Submitted For Further Processing, Your Reference Number Is : ' + zResponse.CustId,
                        type: "success"
                    }, function () {
                        sessionStorage.setItem("sesParamCustMobNo", '');
                        sessionStorage.setItem("sesParamCustId", '');
                        window.location.href = './index.html';
                    });
                }
                else if (zResponse.CallStatus === 4) {
                    swal({
                        title: "Alert!",
                        text: 'Your KYC Request Has Been Put On Hold, Your Reference Number Is : ' + zResponse.CustId + '. You Will Receive An Email And A Text Message For The Same!',
                        type: "info"
                    }, function () {
                        sessionStorage.setItem("sesParamCustMobNo", '');
                        sessionStorage.setItem("sesParamCustId", '');
                        window.location.href = './index.html';
                    });
                }
                else if (zResponse.CallStatus === 5) {
                    swal({
                        title: "Alert!",
                        text: 'Your KYC Request Has Been Rejected, Your Reference Number Is : ' + zResponse.CustId + '. You Will Receive An Email And A Text Message For The Same!',
                        type: "info"
                    }, function () {
                        sessionStorage.setItem("sesParamCustMobNo", '');
                        sessionStorage.setItem("sesParamCustId", '');
                        window.location.href = './index.html';
                    });
                }
                else {
                    swal({
                        title: "Alert!",
                        text: "Your Call Has Ended Unexpectedly, Kindly Restart Your Call!",
                        type: "error"
                    }, function () {
                        window.location.href = './ScheduleNow.html';
                    });
                }
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
                console.log(responseJSON.ResponseCode);
            }
        },
        error: function () {
        }
    });
};

//when we got an answer from a remote user
function handleAnswer(answer) {
    RTCPeerConn.setRemoteDescription(new RTCSessionDescription(answer));
};
//when we got an ice candidate from a remote user 
function handleCandidate(candidate) {
    RTCPeerConn.addIceCandidate(new RTCIceCandidate(candidate));
};
///Socket Region #END

///Service Calling
async function GenerateCustomerVerificationCode() {
    var Data = {
        CustId: xCustId,
        CustMobNo: xCustMobNo,
        CreatedByIP: clientPublicIP
    };
    $.ajax({
        type: "POST",
        url: serviceURL + "/api/MainService/GenerateCustomerVerificationCode",
        dataType: "JSON",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
                console.log("Verification Code Generated!")
                document.getElementById('btnVerificationCode').innerHTML = responseJSON.Response;
                document.getElementById('btnVerificationCodeNoti').innerHTML = responseJSON.Response;
                swal.close();
            }
            else {
                swal('Alert!', responseJSON.ResponseMessage, 'error');
                console.log(responseJSON.ResponseCode);
            }
        },
        error: function () {
        }
    });
}

// Get RTC stats

var upLink = document.getElementById('upLink');
var downLink = document.getElementById('downLink');

// Outbound RTC
let outBoundLastResult;
window.setInterval(() => {
    if (!RTCPeerConn) {
        return;
    }
    if (RTCPeerConn.connectionState != 'connected') {
        upLink.innerHTML = '0';
        downLink.innerHTML = '0';
        return;
    }
    const sender = RTCPeerConn.getSenders()[1];
    if (!sender) {
        return;
    }
    sender.getStats().then(res => {
        res.forEach(report => {
            let bytes;
            let headerBytes;
            let packets;
            if (report.type === 'outbound-rtp') {
                if (report.isRemote) {
                    return;
                }
                const now = report.timestamp;
                bytes = report.bytesSent;
                headerBytes = report.headerBytesSent;

                packets = report.packetsSent;
                if (outBoundLastResult && outBoundLastResult.has(report.id)) {
                    const deltaT = now - outBoundLastResult.get(report.id).timestamp;
                    // calculate bitrate
                    const bitrate = 8 * (bytes - outBoundLastResult.get(report.id).bytesSent) / deltaT;
                    const headerrate = 8 * (headerBytes - outBoundLastResult.get(report.id).headerBytesSent) / deltaT;

                    //calculate UpLink
                    const KiloBytesPerSec = (bytes - outBoundLastResult.get(report.id).bytesSent) / 1024;
                    upLink.innerHTML = parseInt(KiloBytesPerSec);

                    // append to chart
                    // bitrateSeries.addPoint(now, bitrate);
                    // headerrateSeries.addPoint(now, headerrate);
                    // bitrateGraph.setDataSeries([bitrateSeries, headerrateSeries]);
                    // bitrateGraph.updateEndDate();

                    // calculate number of packets and append to chart
                    // packetSeries.addPoint(now, packets -
                    //   outBoundLastResult.get(report.id).packetsSent);
                    // packetGraph.setDataSeries([packetSeries]);
                    // packetGraph.updateEndDate();
                }
            }
        });
        outBoundLastResult = res;
    });
}, 1000);


// Inbound RTC
let inBoundLastResult;
window.setInterval(() => {
    if (!RTCPeerConn) {
        return;
    }
    if (RTCPeerConn.connectionState != 'connected') {
        downLink.innerHTML = '0';
        return;
    }
    const receiver = RTCPeerConn.getReceivers()[1];
    if (!receiver) {
        return;
    }
    receiver.getStats().then(res => {
        res.forEach(report => {
            let bytes;
            let headerBytes;
            let packets;
            if (report.type === 'inbound-rtp') {
                if (report.isRemote) {
                    return;
                }
                const now = report.timestamp;
                bytes = report.bytesReceived;
                headerBytes = report.headerBytesReceived;

                packets = report.packetsReceived;
                if (inBoundLastResult && inBoundLastResult.has(report.id)) {
                    const deltaT = now - inBoundLastResult.get(report.id).timestamp;
                    // calculate bitrate
                    const bitrate = 8 * (bytes - inBoundLastResult.get(report.id).bytesReceived) / deltaT;
                    const headerrate = 8 * (headerBytes - inBoundLastResult.get(report.id).headerBytesReceived) / deltaT;

                    //calculate UpLink
                    const KiloBytesPerSec = (bytes - inBoundLastResult.get(report.id).bytesReceived) / 1024;
                    downLink.innerHTML = parseInt(KiloBytesPerSec);

                    // append to chart
                    // bitrateSeries.addPoint(now, bitrate);
                    // headerrateSeries.addPoint(now, headerrate);
                    // bitrateGraph.setDataSeries([bitrateSeries, headerrateSeries]);
                    // bitrateGraph.updateEndDate();

                    // calculate number of packets and append to chart
                    // packetSeries.addPoint(now, packets -
                    //   inBoundLastResult.get(report.id).packetsSent);
                    // packetGraph.setDataSeries([packetSeries]);
                    // packetGraph.updateEndDate();
                }
            }
        });
        inBoundLastResult = res;
    });
}, 3000);