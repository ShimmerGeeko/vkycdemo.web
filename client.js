//our username 
var name;
var connectedUser;
var recorder;
var recordedBlobs = [];
var mediaRecorder;
var mediaRecorderLive;
var clientPublicIP;

let width = 324;    // We will scale the photo width to this
let height = 312;     // This will be computed based on the input stream

var canvas = null;
var photo = null;
var btnTakePersonPhoto = null;

var docphoto = null;
var docphotocanvas = null;
var docphotobtn = null;
var anchordocphotocanvas = null;
var selIdDocType = '0';
var selAddrDocType = '0';

var capImg = null;
var capDoc = null;
var imageURI = null;

var xCustMobNo = null;
var xCustId = null;
var xOperatorId = null;
var xOpUserCode = null;
var xLatitude = null;
var xLongitude = null;
var xBlobVideoData = null;

var xQuestionList;

var livenessFrames = [];
var framesCapturedCount = 0;
var frameCaptureInterval = 3000; //in milliseconds
var maxFrameSetCount = 10;
var livenessCanWidth = 400;
var livenessCanHeight = 320;
var passiveLiveCkBool = false;

//Signaling Server
conn = new WebSocket(webSocketURL);

var callPage = document.querySelector('#callPage');
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn');

var hangUpBtn = document.querySelector('#hangUpBtn');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

//var callRecord = document.querySelector('#callRecord');
var startRecoding = document.querySelector('#btn-start-recording');
var recordIcon = document.querySelector('#recordIcon');
var stopRecording = document.querySelector('#btn-stop-recording');

var btnLivenessStartRecord = document.querySelector('#btnLivenessStartRecord');
var btnLivenessStopRecord = document.querySelector('#btnLivenessStopRecord');
var btnLivenessStopRecord_Spinner = document.querySelector('#btnLivenessStopRecord_Spinner');

var btnAuthorize = document.querySelector('#btnAuthorize');
var btnReject = document.querySelector('#btnReject');
var btnHold = document.querySelector('#btnHold');
var btnDrop = document.querySelector('#btnDrop');
//var modalPage = document.querySelector('#modalPage');
var viewPage = document.querySelector('#viewPage');

var msgInput = document.querySelector('#msgInput');
var sendMsgBtn = document.querySelector('#sendMsgBtn');

var chatArea = document.querySelector('#chatarea');

var docphoto = document.querySelector('#docphoto');
//var docSignphoto = document.querySelector('#docSignphoto');
var docphotobtn = document.querySelector('#docphotobtn');
var docphotocanvas = document.querySelector('#docphotocanvas0');
var anchordocphotocanvas = document.querySelector('#anchordocphotocanvas0');

var docSignCanvas = document.querySelector('#docSignCanvas');
var docAddrphotobtn = document.querySelector('#docAddrphotobtn');
var docAddrCanvas = document.querySelector('#docAddrCanvas');
var panAadharDetails = document.getElementById('panAadharDetails');

var canvas = document.getElementById('canvas');
var photo = document.getElementById('photo');
var btnTakePersonPhoto = document.getElementById('btnTakePersonPhoto');

var matchphotobtn = document.getElementById('matchphotobtn');
var matchPanphotobtn = document.getElementById('matchPanphotobtn');

const initCropperBtnX = document.getElementById("initCropperBtn");
const destroyCropperBtnX = document.getElementById("destroyCropperBtn");
const initCropperBtnAddrX = document.getElementById("initCropperBtnAddr");
const destroyCropperBtnAddrX = document.getElementById("destroyCropperBtnAddr");

var flagRemoteStreamSet = false;
var addressMismatchFlag = false;
var addrProofTakenFlag = false;

var customerToken = '';

var RTCPeerConn;
var stream;
var remoteStream;
var dataChannel;
var videoFlag = 0;
var videoImage = false;
var audioFlag = 0;
var audioImg = "false";
var streamType = "audio";
var customerLogin = false;


window.onload = function () {
   document.getElementById('imgContactDefault');
   var context = canvas.getContext('2d');
   if (width && height) {
      canvas.width = width;
      canvas.height = height;

      var image = new Image();
      image.onload = function () {
         context.drawImage(image, 0, 0, width, height);
      };
      image.src = './images/contactDefault.png';
      document.getElementById('xPanPhoto').src = './images/contactDefault.png'; 
   } 
   xOperatorId = sessionStorage.getItem("sesParamOpUserId");
   xOpUserCode = sessionStorage.getItem("sesParamOpUserCode");
   xCustMobNo = sessionStorage.getItem("sesParamSelectedCustMobNo");
   xCustId = sessionStorage.getItem("sesParamSelectedCustId");
   if (xOperatorId === null || xOperatorId === '' || xOpUserCode === null || xOpUserCode === '') {
      window.location.href = './Operator/index.html'
   }
   else if (xCustMobNo === null || xCustMobNo === '' || xCustId === null || xCustId === '') {
      window.location.href = './Operator/OperatorDashboard.html'
   }
   else {
      
      document.getElementById('navbarUsername').innerHTML = xOperatorId;
      swal({
         title: "Processing...",
         text: "Please Wait",
         // type: "info",
         // icon: "info",
         imageUrl: "./images/Loader-Ellipsis-244px.gif",
         buttons: false,
         showConfirmButton: false,
         // showCancelButton: false,
         // closeOnConfirm: false,
         // showLoaderOnConfirm: false,
         allowOutsideClick: false
      });
      name = xOperatorId;
      document.getElementById('callToUsernameInput').innerHTML = xCustMobNo;
      // InitVideo();
      // GetClientPublicIP()
   }
};

// $('#remoteVideo').on('loadstart', function (event) {
//    debugger;
//    $(this).addClass('background');
//    $(this).attr("poster", "http://iphonewrd.com/img/loading.gif");
// });
// $('#remoteVideo').on('canplay', function (event) {
//    $(this).removeClass('background');
//    $(this).removeAttr("poster");
// });

function GetClientPublicIP() {
   try {
      // $.getJSON("https://api.ipify.org?format=json",
      //    function (data) {
      //       clientPublicIP = data.ip;
      //       console.log("IPA >>>", data.ip);
      //       InitVideo();
      //    });
      // clientPublicIP = 'NA';
      // InitVideo();
   }
   catch (error) {
      clientPublicIP = 'NA';
      InitVideo();
      console.log("Unable to get client's IP Address", error);
   }
}

conn.onopen = function () {
   console.log("Connected to the signaling server");
   clientPublicIP = 'NA';
   InitVideo();
};

//when we got a message from a signaling server 
conn.onmessage = function (msg) {
   console.log("Got message", msg.data);
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
   console.log("Conn error", err);
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
      // conn.onopen = () => conn.send(JSON.stringify(message));
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
   try {
      stream.getVideoTracks()[0].enabled = true;
   }
   catch (err) {
      window.location.reload();
   }
}

//stop video if video is started
function stopVideo() {
   console.log("Inside stop video");
   stream.getVideoTracks()[0].enabled = false;
}

//Login Event
      function handleLogin(success) {
         if (success === false) {
            alertify.alert("Oops! Username Already Taken, Try Something Else!");
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
         
         
         localVideo.srcObject = stream;
         localVideo.play();

         GetCustomerDataForOperator();

         console.log("Local video started");
         console.log(stream.getTracks());
         //using Google public stun server 
         var configuration = {
            "iceServers": [{ "urls": stunURL }, { "urls": turnURL, "username": turnUsername, "credential": turnCredential }]
            //"iceServers": [{ "url": "stun:stun2.1.google.com:19302" }, { "url": "turn:turn.bistri.com:80", "username": "homeo", "credential": "homeo" }]
         };

         RTCPeerConn = new webkitRTCPeerConnection(configuration, { optional: [{ RTCDataChannel: true }] });

         // setup stream listening 
         RTCPeerConn.addStream(stream);

         //when a remote user adds stream to the peer connection
         RTCPeerConn.onaddstream = function (e) {
            //remoteVideo.src = window.URL.createObjectURL(e.stream);
            remoteStream = e.stream;
            remoteVideo.srcObject = e.stream;
            remoteVideo.play();

            flagRemoteStreamSet = true;
            btnAuthorize.disabled = false;
            btnDrop.disabled = false;
            btnReject.disabled = false;
            btnHold.disabled = false;
            btnTakePersonPhoto.disabled = false;
            docphotobtn.disabled = false;
            startRecoding.disabled = false;
            btnLivenessStartRecord.disabled = false;
            hangUpBtn.disabled = false;
            initCropperBtnX.disabled = false;
            destroyCropperBtnX.style.display = 'none';
            initCropperBtnAddrX.disabled = false;
            destroyCropperBtnAddrX.style.display = 'none';
            SetCustomerOperatorMapping();
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
               btnIceConnStats.className = 'btn btn-sm btn-info';
            }
            else if (RTCPeerConn.iceConnectionState === 'connected') {
               btnIceConnStats.innerHTML = 'Connected';
               btnIceConnStats.className = 'btn btn-sm btn-success';
            }
            else if (RTCPeerConn.iceConnectionState === 'failed') {
               // remoteVideo.srcObject = null;
               btnIceConnStats.innerHTML = 'Failed';
               btnIceConnStats.className = 'btn btn-sm btn-danger';
               // swal('Alert!', 'Unable To Establish Peer Connection!', 'error');
               swal({
                  title: "Reconnecting...",
                  text: "Please Wait",
                  // type: "info",
                  // icon: "info",
                  imageUrl: "./images/Loader-Ellipsis-244px.gif",
                  //buttons: false,
                  showConfirmButton: true,
                  // showCancelButton: false,
                  // closeOnConfirm: false,
                  // showLoaderOnConfirm: false,
                  allowOutsideClick: false
               });
               // $('#remoteVideo').attr("poster", "./images/Loader-Ellipsis-244px.gif");
               console.log('Promise => Ice Failed >>>');
               RestartIce()
               
            }
            else if (RTCPeerConn.iceConnectionState === 'disconnected') {
               // remoteVideo.srcObject = null;
               btnIceConnStats.innerHTML = 'Disconnected';
               btnIceConnStats.className = 'btn btn-sm btn-danger';
               // swal('Alert!', 'Peer Disconnected!', 'error');
               swal({
                  title: "Reconnecting...",
                  text: "Please Wait",
                  // type: "info",
                  // icon: "info",
                  imageUrl: "./images/Loader-Ellipsis-244px.gif",
                  //buttons: false,
                  showConfirmButton: true,
                  // showCancelButton: false,
                  // closeOnConfirm: false,
                  // showLoaderOnConfirm: false,
                  allowOutsideClick: false
               });
               console.log('Promise => Ice Disconnected >>>');
               RestartIce()
            }
            else if (RTCPeerConn.iceConnectionState === 'closed') {
               // Current local peer has shut down and is no longer handling requests.
               // Shall require a refresh
               remoteVideo.srcObject = null;
               btnIceConnStats.innerHTML = 'Closed';
               btnIceConnStats.className = 'btn btn-sm btn-danger';
               swal('Alert!', 'Local Peer Connection Closed!', 'error');
            }
         }

         RTCPeerConn.ondatachannel = handleChannelCallback;
         //Putting code for data communication
         dataChannel = RTCPeerConn.createDataChannel("channel2", { reliable: true });

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
         swal.close();
         swal({
            title: "Alert!",
            text: "Failed To Establish Connection!",
            type: "error",
            confirmButtonText: "Retry"
         }, function () {
            window.location.reload();
         });
      });
   };
};


// Ice Restart #BEGIN
function RestartIce() {
   debugger;
   var initRestart = window.setInterval(() => {
      console.log('Ice connectionState >>>', RTCPeerConn.connectionState);
      if (RTCPeerConn.connectionState === 'disconnected' || RTCPeerConn.connectionState === 'failed') {
         console.log('Create Restart Offer >>>', RTCPeerConn.connectionState);
         RTCPeerConn.createOffer({ iceRestart: true })
         .then(function (offer) {
            send({
               type: "restartoffer",
               offer: offer
            });
         })
         .then(RTCPeerConn.setLocalDescription());
      }
      if (RTCPeerConn.iceConnectionState === 'connected') {
         debugger;
         // $('#remoteVideo').removeAttr("poster");
         swal("Alert!", "Reconnected", "success");
         clearInterval(initRestart);
      }
      else if (RTCPeerConn.iceConnectionState === 'closed') {
         swal({
            title: "Alert!",
            text: 'Connection Closed!',
            type: "error"
         }, function () {
            window.location.href = './Operator/OperatorDashboard.html';
            // window.history.back();
         });
         swal({
            title: "Alert!",
            text: 'Connection Closed!',
            type: 'error',
            showCancelButton: true,
            confirmButtonColor: "#2b982b",
            confirmButtonText: 'Proceed With Reconnection!',
            cancelButtonText: "Proceed Without Reconnection!"
        }, function (isConfirm) {
            if (isConfirm) {
               window.location.href = './Operator/OperatorDashboard.html';
            }
            else {
              
            }
        });
      }
   }, 500);
}

// Ice Restart #END

async function GetCustomerDataForOperator() {
   var Data = {
      UserId: xOperatorId,
      CustId: xCustId,
      CustMobNo: xCustMobNo
   };
   $.ajax({
      type: "POST",
      url: serviceURL + "/api/MainService/GetCustomerDataForOperator",
      dataType: "JSON",
      data: JSON.stringify(Data),
      contentType: "application/json; charset=utf-8",
      success: function (responseData) {
         var responseJSON = JSON.parse(JSON.stringify(responseData));
         if (responseJSON.ResponseCode === "000") {
            swal.close();
            document.getElementById('callTobName').innerHTML = responseJSON.CustBasicInfo.Name;
            var xDocPhoto = document.getElementById('xDocPhoto');
            var anchorxDocPhoto = document.getElementById('anchorxDocPhoto');
            var xName = document.getElementById('xName');
            var xGender = document.getElementById('xGender');
            var xDOB = document.getElementById('xDOB');
            //var xAddress = document.getElementById('xAddress');

            var xPincode = document.getElementById('xPincode');
            var xCity = document.getElementById('xCity');
            var xState = document.getElementById('xState');
            var xCountry = document.getElementById('xCountry');
            var xVerifyCodeOp = document.getElementById('xVerifyCodeOp');
            var xRandomQuestions = document.getElementById('xRandomQuestions');

            xName.value = responseJSON.Uiddata.Poi._name;
            xGender.value = responseJSON.Uiddata.Poi._gender;
            xDOB.value = responseJSON.Uiddata.Poi._dob;
            //xAddress.value = responseJSON.Uiddata.Poa.house + ' ' + responseJSON.Uiddata.Poa.loc + '. ' + responseJSON.Uiddata.Poa.po + '. LANDMARK: ' + responseJSON.Uiddata.Poa.landmark + ' DISTRICT: ' + responseJSON.Uiddata.Poa.dist;
            document.getElementById('aHouse').innerHTML = responseJSON.Uiddata.Poa._house;
            document.getElementById('aLocality').innerHTML = responseJSON.Uiddata.Poa._loc;
            document.getElementById('aPO').innerHTML = responseJSON.Uiddata.Poa._po;
            document.getElementById('aStreet').innerHTML = responseJSON.Uiddata.Poa._street;
            document.getElementById('aLandmark').innerHTML = responseJSON.Uiddata.Poa._landmark;
            // document.getElementById('aSubdistrict').innerHTML = responseJSON.Uiddata.Poa.subdist;
            document.getElementById('aDistrict').innerHTML = responseJSON.Uiddata.Poa._dist;
            document.getElementById('bName').value = responseJSON.CustBasicInfo.Name;
            if (responseJSON.CustBasicInfo.Gender === 'M') {
               document.getElementById('bGender').value = 'Male';
            }
            else {
               document.getElementById('bGender').value = 'Female';
            }
            // document.getElementById('bGender').value = responseJSON.CustBasicInfo.Gender;
            document.getElementById('bDOB').value = responseJSON.CustBasicInfo.DOB;
            document.getElementById('bPinCode').value = responseJSON.CustBasicInfo.PinCode;
            document.getElementById('bCity').value = responseJSON.CustBasicInfo.City;
            document.getElementById('bState').value = responseJSON.CustBasicInfo.State;
            document.getElementById('bCountry').value = 'India';

            
            document.getElementById('bHouse').innerHTML = responseJSON.CustBasicInfo.House;
            document.getElementById('bLocality').innerHTML = responseJSON.CustBasicInfo.Locality;
            document.getElementById('bLandmark').innerHTML = responseJSON.CustBasicInfo.Landmark;
            document.getElementById('bCity').innerHTML = responseJSON.CustBasicInfo.City;
            document.getElementById('bPinCode').innerHTML = responseJSON.CustBasicInfo.PinCode;
            document.getElementById('bDistrict').innerHTML = responseJSON.CustBasicInfo.District;
            document.getElementById('bState').innerHTML = responseJSON.CustBasicInfo.State;

            document.getElementById('CustLat').innerHTML = responseJSON.Geolocation.Latitude;
            document.getElementById('CustLong').innerHTML = responseJSON.Geolocation.Longitude;

            xPincode.value = responseJSON.Uiddata.Poa._pc;
            xCity.value = responseJSON.Uiddata.Poa._vtc;
            xState.value = responseJSON.Uiddata.Poa._state;
            xCountry.value = responseJSON.Uiddata.Poa._country;
            xDocPhoto.src = "data:image/png;base64, " + responseJSON.Uiddata.Pht;

            //const blob = base64toBlob(responseJSON.Uiddata.Pht, 'image/png');
            //const blobUrl = URL.createObjectURL(blob);
            anchorxDocPhoto.href = "data:image/png;base64, " + responseJSON.Uiddata.Pht;
            xVerifyCodeOp.value = responseJSON.VerificationCode;
            xQuestionList = [];
            xQuestionList = responseJSON.QuestionList;
            xRandomQuestions.value = "1. " + responseJSON.QuestionList[0].Question + "\n" + "2. " + responseJSON.QuestionList[1].Question;
            // xRandomQuestions.value = "1. " + "What is your mother's maiden name?";

            var CityMatch = responseJSON.CityMatch;
            var PinCodeMatch = responseJSON.PinCodeMatch;
            var DistrictMatch = responseJSON.DistrictMatch;
            var StateMatch = responseJSON.StateMatch;
            var HouseSoundX = responseJSON.HouseSoundX;
            var LocalitySoundX = responseJSON.LocalitySoundX;
            var LandmarkSoundX = responseJSON.LandmarkSoundX;

            var lblAddrMismatch = document.getElementById('lblAddrMismatch');

            // District Match Tentative
            // if(CityMatch != 'Y' || PinCodeMatch != 'Y' || DistrictMatch != 'Y' || StateMatch != 'Y') {
            if (CityMatch != 'Y' || PinCodeMatch != 'Y' || StateMatch != 'Y') {
               addressMismatchFlag = false;
               lblAddrMismatch.innerHTML = 'Current Address Does Not Match With Aadhaar Address. Please Verify!';
               lblAddrMismatch.style.color = 'red';
            }
            else if (HouseSoundX < 2 || LocalitySoundX < 2 || LandmarkSoundX < 2) {
               addressMismatchFlag = false;
               lblAddrMismatch.innerHTML = 'Current Address And Aadhaar Address Does Not Appear To Be Similar. Please Verify!';
               lblAddrMismatch.style.color = 'red';
            }
            else {
               addressMismatchFlag = true;
               lblAddrMismatch.innerHTML = 'Current Address And Aadhaar Address Appear To Be Similar. Please Verify!'
               lblAddrMismatch.style.color = 'green';
            }
            InitAddrMismatch();
         }
         else {
            console.log(responseJSON.ResponseMessage);
            swal({
               title: "Alert!",
               text: 'Unable To Fetch Customer Data!',
               type: "error"
            }, function () {
               // window.location.href = './Operator/OperatorDashboard.html';
               window.history.back();
            });
         }
      },
      error: function () {
      }
   });
}

async function SetCustomerOperatorMapping() {
   swal({
      title: "Connecting...",
      text: "Please Wait",
      // type: "info",
      // icon: "info",
      imageUrl: "./images/Loader-Ellipsis-244px.gif",
      //buttons: false,
      showConfirmButton: false,
      // showCancelButton: false,
      // closeOnConfirm: false,
      // showLoaderOnConfirm: false,
      allowOutsideClick: false
   });
   var xCurrentVerifyCodeOp = document.getElementById('xVerifyCodeOp').value;
   var Data = {
      UserCode: xOpUserCode,
      UserId: xOperatorId,
      CustId: xCustId,
      CustMobNo: xCustMobNo,
      VerificationCode: xCurrentVerifyCodeOp,
      CreatedByIP: clientPublicIP
   };
   $.ajax({
      type: "POST",
      url: serviceURL + "/api/MainService/SetCustomerOperatorMapping",
      dataType: "JSON",
      data: JSON.stringify(Data),
      contentType: "application/json; charset=utf-8",
      success: function (responseData) {
         var responseJSON = JSON.parse(JSON.stringify(responseData));
         if (responseJSON.ResponseCode === "000") {
            console.log('Mapping Set!');
            swal.close();
         }
         else {
            console.log('Mapping Not Set!');
            swal({
               title: "Alert!",
               text: responseJSON.ResponseMessage,
               type: "error"
            }, function () {
               window.location.href = './Operator/OperatorDashboard.html';
            });
         }
      },
      error: function () {
      }
   });
}

//Event handler for Authorize
btnAuthorize.addEventListener("click", function () {
   OperatorAuthAcceptRequest('M_ACCEPT', 'NA');
});

async function OperatorAuthAcceptRequest(actionType, remark) {
   var ckFace = document.getElementById('ckFace');
   var ckDoc = document.getElementById('ckDoc');
   var ckSignDoc = document.getElementById('ckSignDoc');
   var ckCode = document.getElementById('ckCode');
   var radAddrMatchY = document.getElementById('radMismatchY');
   var radAddrMatchN = document.getElementById('radMismatchN');
   var xCurrentVerifyCodeOp = document.getElementById('xVerifyCodeOp').value;

   if (ckFace.checked === false) {
      swal('Alert!', 'Please Complete Face Matching!', 'error');
      return;
   }
   if (ckDoc.checked === false) {
      swal('Alert!', 'Please Capture Document Picture!', 'error');
      return;
   }
   if (ckSignDoc.checked === false) {
      swal('Alert!', 'Please Capture Signature Picture!', 'error');
      return;
   }
   if (ckCode.checked === false) {
      swal('Alert!', 'Please Conduct Liveness Check!', 'error');
      return;
   }
   if (radAddrMatchY.checked === false && radAddrMatchN.checked === false) {
      swal('Alert!', 'Please Verify If The Address Matches Or Not!', 'error');
      return;
   }

   /////////////////////
   var photoCan = document.getElementById('canvas');
   var zCustPhoto = photoCan.toDataURL();
   // const zCustPhotoBlob = new Blob(recordedBlobs, { type: 'video/webm' });

   var docPhotoCan = document.getElementById('docphotocanvas0');
   var zCustDocPhoto = docPhotoCan.toDataURL();

   var docSignCan = document.getElementById('docphotocanvas2');
   var xCustSignPhoto = docSignCan.toDataURL();

   var CustRecSession = document.getElementById('viewremoteVideo');

   var radMatchN = document.getElementById('radMismatchN');
   var docAddrCanvas = document.getElementById('docAddrCanvas');
   var docAddrPhoto = null;
   var AddressPhotoFlag = null;

   if (radMatchN.checked === true) {
      docAddrPhoto = docAddrCanvas.toDataURL();
      if (docAddrPhoto === null || docAddrPhoto === "" || addrProofTakenFlag === false) {
         swal('Alert!', 'Please Take Address Proof Photo!', 'error');
         return;
      }
      else {
         AddressPhotoFlag = 'Y';
      }
   }
   else {
      AddressPhotoFlag = 'N';
      docAddrPhoto = 'NA';
      selAddrDocType = '0';
   }

   if (CustRecSession.src === "") {
      console.log('Video src empty');
      swal('Alert!', 'Please Record Session!', 'error');
      return;
   }
   if (xBlobVideoData === null) {
      console.log('Video Blob empty');
      swal('Alert!', 'Please Record Session And Try Again!', 'error');
      return;
   }

   swal({
      title: "Processing...",
      text: "Please Wait",
      // type: "info",
      // icon: "info",
      imageUrl: "./images/Loader-Ellipsis-244px.gif",
      //buttons: false,
      showConfirmButton: false,
      // showCancelButton: false,
      // closeOnConfirm: false,
      // showLoaderOnConfirm: false,
      allowOutsideClick: false
   });

   try {
      var formData = new FormData();
      formData.append('UserCode', xOpUserCode);
      formData.append('UserId', xOperatorId);
      formData.append('CustId', xCustId);
      formData.append('CustMobNo', xCustMobNo);
      formData.append('FaceMatchFlag', 'Y');
      formData.append('DocPhotoFLag', 'Y');
      formData.append('SignaturePhotoFlag', 'Y');
      formData.append('AddressPhotoFlag', AddressPhotoFlag);
      formData.append('SecCodeVerifiedFlag', 'Y');
      formData.append('VerificationCode', xCurrentVerifyCodeOp);
      formData.append('ActionType', actionType);
      formData.append('CreatedByIP', clientPublicIP);
      formData.append('Remark', remark);

      formData.append('IdDocType', selIdDocType);
      formData.append('ImgDocument', zCustDocPhoto);
      formData.append('ImgSignature', xCustSignPhoto);
      formData.append('ImgCustomer', zCustPhoto);
      formData.append('PoaDocType', selAddrDocType);
      formData.append('ImgPOA', docAddrPhoto);
      formData.append('VideoSession', xBlobVideoData);

      //Question List
      if (xQuestionList.length > 0) {
         for (var i = 0; i < xQuestionList.length; i++) {
            formData.append("QuestionDatas[" + i + "].SrNo", parseInt(xQuestionList[i].SrNo));
            formData.append("QuestionDatas[" + i + "].ApplType", parseInt(xQuestionList[i].ApplType));
            formData.append("QuestionDatas[" + i + "].LangCode", xQuestionList[i].LangCode);
            formData.append("QuestionDatas[" + i + "].Question", xQuestionList[i].Question);
        }
      }

      $.ajax({
         type: 'POST',
         url: serviceURL + "/api/MainService/OperatorAuthAccept",
         data: formData,
         processData: false,
         contentType: false,
         success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
               sessionStorage.setItem("sesParamSelectedCustId", '');
               sessionStorage.setItem("sesParamSelectedCustMobNo", '');
               swal({
                  title: "Success!",
                  text: 'Done! Customer Data Submitted For Further Processing! ' + ' Customer Reference Number Is: ' + xCustId,
                  type: "success"
               }, function () {
                  window.location.href = './Operator/OperatorDashboard.html';
               });
            }
            else {
               swal('Alert!', responseJSON.ResponseMessage, 'error');
               console.log("Failed Maker ACCEPT!")
               console.log(responseJSON.ResponseCode);
            }
         },
         error: function (err) {
            console.log("err >>>", err);
         }
      });
   }
   catch (err) {
      console.log(err);
   }
}


//Event handler for Reject
btnReject.addEventListener("click", function () {
   alertify.prompt('Reason For REJECTION', ''
      , function (evt, value) {
         if (value.trim() === '') {
            return false;
            // alertify.error('Oops! Reason cannot Be Blank!')
         }
         else {
            OperatorAuthHRD('M_REJECT', value.trim());
         }
      }
      , function () {
         alertify.error('Please Enter Reason/Remark!')
      });
});

//Event handler for Hold
btnHold.addEventListener("click", function () {
   alertify.prompt('Reason For HOLD', ''
      , function (evt, value) {
         if (value.trim() === '') {
            return false;
            // alertify.error('Oops! Reason cannot Be Blank!')
         }
         else {
            OperatorAuthHRD('M_HOLD', value.trim());
         }
      }
      , function () {
         alertify.error('Please Enter Reason/Remark!')
      });
});

//Event handler for Drop
btnDrop.addEventListener("click", function () {
   alertify.prompt('Reason For DROP', ''
      , function (evt, value) {
         if (value.trim() === '') {
            return false;
            // alertify.error('Oops! Reason cannot Be Blank!')
         }
         else {
            OperatorAuthHRD('M_DROP', value.trim());
         }
      }
      , function () {
         alertify.error('Please Enter Reason/Remark!')
      });
});

//Event handler for Reject
function OperatorAuthHRD(actionType, remark) {
   var xCurrentVerifyCodeOp = document.getElementById('xVerifyCodeOp').value;
   // swalLoader('ok');
   swal({
      title: "Processing...",
      text: "Please Wait",
      // type: "info",
      // icon: "info",
      imageUrl: "./images/Loader-Ellipsis-244px.gif",
      //buttons: false,
      showConfirmButton: false,
      // showCancelButton: false,
      // closeOnConfirm: false,
      // showLoaderOnConfirm: false,
      allowOutsideClick: false
   });
   var Data = {
      UserCode: xOpUserCode,
      UserId: xOperatorId,
      CustId: xCustId,
      CustMobNo: xCustMobNo,
      VerificationCode: xCurrentVerifyCodeOp,
      ActionType: actionType,
      Remark: remark,
      CreatedByIP: clientPublicIP
   };
   $.ajax({
      type: "POST",
      url: serviceURL + "/api/MainService/OperatorAuthHRD",
      dataType: "JSON",
      data: JSON.stringify(Data),
      contentType: "application/json; charset=utf-8",
      success: function (responseData) {
         var responseJSON = JSON.parse(JSON.stringify(responseData));
         if (responseJSON.ResponseCode === "000") {
            sessionStorage.setItem("sesParamSelectedCustId", '');
            sessionStorage.setItem("sesParamSelectedCustMobNo", '');
            swal({
               title: "Success!",
               text: "Operation Complete!",
               type: "success"
            }, function () {
               window.location.href = './Operator/OperatorDashboard.html';
            });
         }
         else {
            swal('Alert!', responseJSON.ResponseMessage, 'error');
            console.log("Failed Maker R/H!")
            console.log(responseJSON.ResponseCode)
         }
      },
      error: function (err) {
         console.log(err);
      }
   });
}


//initiating a call 
callBtn.addEventListener("click", function () {

   console.log("Inside the Callbtn");
   var callToUsername = callToUsernameInput.innerHTML;

   if (callToUsername == null || callToUsername == "") {
      swal('Alert!', 'Opps, Need A Username To Call!', 'error');
      return;
   }

   if (callToUsername.length > 0) {
      connectedUser = callToUsername;
      if (remoteVideo.srcObject != null && remoteVideo.srcObject != "") {
         swal('Alert!', 'You Are Already In A Call, Please Hang Up And Try', 'error');
         return;
      }

      // create an offer 
      RTCPeerConn.createOffer(function (offer) {
         send({
            type: "offer",
            offer: offer
         });

         RTCPeerConn.setLocalDescription(offer);
      }, function (error) {
         swal('Alert!', "Error While Creating An Offer", 'error');
      });
   }
});

//Accept or Decline the offer

function handleCall(offer, name) {
   connectedUser = name;
   RTCPeerConn.setRemoteDescription(new RTCSessionDescription(offer));
   var callIconHtml = '<i class="fa fa-phone mr-2 blink" aria-hidden="true" style="font-weight:bold; font-size:large;"></i>';
   alertify.confirm(callIconHtml + ' Operator ' + connectedUser + ' is calling...', function (e) {
      if (e) {
         handleOffer(offer, name);
      } else {
         // Rejected
      }
   }).set({ labels: { ok: 'Accept', cancel: 'Decline' } });
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
      alertify.alert("Error While Creating An Answer");
   });

   modalPage.style.display = "none";

   console.log("Executed the Original Offer");
   console.log("Data Channel Ready State in handle offer " + dataChannel.readyState);
};

//when we got an answer from a remote user
function handleAnswer(answer) {
   debugger;
   RTCPeerConn.setRemoteDescription(new RTCSessionDescription(answer));
};

//when we got an ice candidate from a remote user 
function handleCandidate(candidate) {
   RTCPeerConn.addIceCandidate(new RTCIceCandidate(candidate));
};


//Recording Data handled
function handleDataAvailable(event) {

   console.log("Handle Data Function Invoked");
   console.log('handleDataAvailable', event);
   if (event.data && event.data.size > 0) {
      recordedBlobs = [];
      recordedBlobs.push(event.data);
   }
}


startRecoding.addEventListener("click", function () {
   startRecoding.style.display = 'none';
   recordIcon.style.display = 'block';
   stopRecording.style.display = 'block';
   var options = { mimeType: 'video/webm;codecs=vp9' };
   try {
      mediaRecorder = new MediaRecorder(remoteStream, options);
   } catch (e) {
      console.log('Exception while creating MediaRecorder:', e);
      return;
   }

   mediaRecorder.ondataavailable = handleDataAvailable;
   mediaRecorder.start();

   mediaRecorder.onstop = (event) => {
      let superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
      viewremoteVideo.src = window.URL.createObjectURL(superBuffer);
      viewremoteVideo.controls = true;
      viewremoteVideo.play();
      // convertBlobTobase64(superBuffer);
      xBlobVideoData = superBuffer;
      // if (passiveLiveCkBool) {
      //    InitLivenessCheck(xBlobVideoData);
      // }
   }
});

function convertBlobTobase64(blob) {
   var reader = new FileReader();
   reader.readAsDataURL(blob);

   reader.onloadend = function () {
      var base64String = reader.result;
      console.log('Base64 String - ', base64String);
      // var xVideo = base64String.split(',');
      xBlobVideoData = base64String;
   }
}

function base64toBlob(base64Data, contentType) {
   try {
      contentType = contentType || '';
      var sliceSize = 1024;
      var byteCharacters = atob(base64Data);
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);

      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
         var begin = sliceIndex * sliceSize;
         var end = Math.min(begin + sliceSize, bytesLength);

         var bytes = new Array(end - begin);
         for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
         }
         byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
   }
   catch (err) {
      console.log(err);
   }
}

//Event handler for stop recording
stopRecording.addEventListener("click", function () {
   stopRecording.style.display = 'none';
   recordIcon.style.display = 'none';
   startRecoding.style.display = 'block';
   mediaRecorder.stop();
});



btnLivenessStartRecord.addEventListener("click", function () {
   btnLivenessStartRecord.style.display = 'none';
   recordIcon.style.display = 'block';
   btnLivenessStopRecord.style.display = 'block';
   var options = { mimeType: 'video/webm;codecs=vp9' };
   // var options = { mimeType: 'video/mp4; codecs="avc1.424028, mp4a.40.2"' };
   try {
      mediaRecorderLive = new MediaRecorder(remoteStream, options);
   } catch (e) {
      console.log('Exception while creating mediaRecorderLive:', e);
      return;
   }

   mediaRecorderLive.ondataavailable = handleDataAvailable;
   mediaRecorderLive.start();

   mediaRecorderLive.onstop = (event) => {
      let superBufferLive = new Blob(recordedBlobs, { type: 'video/webm' });
      InitLivenessCheck(superBufferLive);
   }
});

btnLivenessStopRecord.addEventListener("click", function () {
   btnLivenessStopRecord.style.display = 'none';
   recordIcon.style.display = 'none';
   btnLivenessStopRecord_Spinner.style.display = 'block';
   // btnLivenessStartRecord.style.display = 'block';
   mediaRecorderLive.stop();
});


//hang up 
hangUpBtn.addEventListener("click", function () {
   HangUpAndReload();
});

function HangUpAndReload() {
   remoteVideo.srcObject = null;
   send({
      type: "leave",
   });

   //Reload local/operator User Screen
   // window.location = './pages/Operator/OperatorDashboard.html'
}

function handleLeave() {
   connectedUser = null;
   remoteVideo.srcObject = null;

   RTCPeerConn.close();
   RTCPeerConn.onicecandidate = null;
   RTCPeerConn.onaddstream = null;

   btnAuthorize.disabled = true;
   btnTakePersonPhoto.disabled = true;
   docphotobtn.disabled = true;
   swal({
      title: "Alert!",
      text: 'Customer Has Ended The Call!',
      type: "info"
  }, function () {
      // window.location.reload();
  });
};

btnTakePersonPhoto.addEventListener('click', function (ev) {
   takepicture();
   ev.preventDefault();
}, false);

function clearphoto() {
   var context = canvas.getContext('2d');
   context.fillStyle = "#AAA";
   context.fillRect(0, 0, canvas.width, canvas.height);

   var data = canvas.toDataURL('image/png');
   //photo.setAttribute('src', data);
}

function takepicture() {
   var btnTakePersonPhoto_Spinner = document.getElementById('btnTakePersonPhoto_Spinner');
   var btnTakePersonPhoto_LoadingText = document.getElementById('btnTakePersonPhoto_LoadingText');
   var btnTakePersonPhoto_ButtonText = document.getElementById('btnTakePersonPhoto_ButtonText');

   try {
      btnTakePersonPhoto.disabled = true;
      btnTakePersonPhoto_ButtonText.style.display = "none";
      btnTakePersonPhoto_Spinner.style.display = "inline-block";
      btnTakePersonPhoto_LoadingText.style.display = "block";

      GetCurrentRemoteVidDimension();

      var tempPersonCanvas = document.createElement('canvas');
      var tempPersonCanvasCtx = tempPersonCanvas.getContext('2d');
      tempPersonCanvas.width = width;
      tempPersonCanvas.height = height;
      tempPersonCanvasCtx.drawImage(remoteVideo, 0, 0, width, height);

      swal({
         title: "Detecting Face...",
         text: "Please Wait",
         // type: "info",
         // icon: "info",
         imageUrl: "./images/Loader-Ellipsis-244px.gif",
         buttons: false,
         showConfirmButton: false,
         // showCancelButton: false,
         // closeOnConfirm: false,
         // showLoaderOnConfirm: false,
         allowOutsideClick: false
      });

      // var ImageDataURL = docphotocanvas.toDataURL();
      var ImageDataURL = tempPersonCanvas.toDataURL();
      var ImageData = ImageDataURL.split(',');
      var b64Image = ImageData[1];

      var Data = {
         image: b64Image,
      };
      $.ajax({
         type: "POST",
         url: MaskDetectionURL,
         dataType: "JSON",
         data: JSON.stringify(Data),
         contentType: "application/json; charset=utf-8",
         success: function (responseData) {
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
               swal.close();
               var faceBoundaryImage = 'data:image/png;base64,' + responseJSON.ResponseMessage.OutputImage;
               // var faceBoundaryImage = 'data:image/png;base64,' + responseJSON.ResponseMessage.OutputFace;
               clearphoto();
               var context = canvas.getContext('2d');
               if (width && height) {
                  canvas.width = width;
                  canvas.height = height;
                  context.drawImage(tempPersonCanvas, 0, 0, width, height);

                  var image = new Image();
                  image.onload = function () {
                     context.drawImage(image, 0, 0, width, height);
                     var dataUrlCustPhotoCan = canvas.toDataURL();
                     document.getElementById('anchorxCustPhoto').href = dataUrlCustPhotoCan
                  };
                  image.src = faceBoundaryImage;
                  matchphotobtn.disabled = false;
                  matchPanphotobtn.disabled = false;
               } else {
                  clearphoto();
               }
            }
            else if (responseJSON.ResponseCode === '100') {
               matchphotobtn.disabled = true;
               matchPanphotobtn.disabled = true;
               clearphoto();
               swal('Alert!', 'Unable To Detect Any Face, Please Try Again!', 'error');
            }
            else if (responseJSON.ResponseCode === '101') {
               matchphotobtn.disabled = true;
               matchPanphotobtn.disabled = true;
               clearphoto();
               swal('Alert!', 'Face Mask Detected, Please Remove Your Mask And Try Again!', 'error');
            }
            else if (responseJSON.ResponseCode === '102') {
               matchphotobtn.disabled = true;
               matchPanphotobtn.disabled = true;
               clearphoto();
               swal('Alert!', 'More Than One Face Detected, Capture Photo With A Single Face!', 'error');
            }
            else {
               matchphotobtn.disabled = true;
               matchPanphotobtn.disabled = true;
               console.log('ERR >>> ', responseJSON.ResponseCode);
               clearphoto();
               swal('Alert!', 'Failed To Detect Any Face, Please Try Again!', 'error');
            }
            btnTakePersonPhoto.disabled = false;
            btnTakePersonPhoto_Spinner.style.display = "none";
            btnTakePersonPhoto_LoadingText.style.display = "none";
            btnTakePersonPhoto_ButtonText.style.display = "block";
         },
         error: function (err) {
            clearphoto();
            matchphotobtn.disabled = true;
            matchPanphotobtn.disabled = true;
            btnTakePersonPhoto.disabled = false;
            btnTakePersonPhoto_Spinner.style.display = "none";
            btnTakePersonPhoto_LoadingText.style.display = "none";
            btnTakePersonPhoto_ButtonText.style.display = "block";
            console.log('ERR >>> ', err);
            swal('Alert!', 'Face Detection Service Is Unavailable!', 'error');
         }
      });
   }
   catch (err) {
      console.log(err);
      clearphoto();
      matchphotobtn.disabled = true;
      btnTakePersonPhoto.disabled = false;
      btnTakePersonPhoto_Spinner.style.display = "none";
      btnTakePersonPhoto_LoadingText.style.display = "none";
      btnTakePersonPhoto_ButtonText.style.display = "block";
   }
}


// Address Photo
docAddrphotobtn.addEventListener('click', function (ev) {
   takeAddrDocPicture();
   ev.preventDefault();
}, false);

function takeAddrDocPicture() {
   try {
      GetCurrentRemoteVidDimension();
      clearAddrDocPhoto();
      if (width && height) {
         selAddrDocType = document.getElementById('ddlAddrDocType').value;
         var context = docAddrCanvas.getContext('2d');
         docAddrCanvas.width = width;
         docAddrCanvas.height = height;
         context.drawImage(remoteVideo, 0, 0, width, height);

         addrProofTakenFlag = true;
         var dataUrlAddrCan = docAddrCanvas.toDataURL();
         document.getElementById('anchordocAddrCanvas').href = dataUrlAddrCan;
      } else {
         clearAddrDocPhoto();
      }
   }
   catch (err) {
      console.log(err);
   }
}

function clearAddrDocPhoto() {
   var context = docAddrCanvas.getContext('2d');
   context.fillStyle = "#AAA";
   context.fillRect(0, 0, docAddrCanvas.width, docAddrCanvas.height);
   document.getElementById('anchordocAddrCanvas').href = '';
}

ddlDocType.addEventListener('change', function () {
   var genDocCanId = 'anchordocphotocanvas';
   var genDocLabelId = 'docphotoLabel';
   var selDoc = parseInt(this.value);

   docphotocanvas = document.getElementById('docphotocanvas' + selDoc.toString());
   anchordocphotocanvas = document.getElementById('anchordocphotocanvas' + selDoc.toString());
   var optionList = $('#ddlDocType option');
   for (var i = 0; i < optionList.length; i++) {
      var xGenDocLabelId = genDocLabelId + i.toString();
      document.getElementById(xGenDocLabelId).innerHTML = 'Captured ' + optionList[i].text;
      if (selDoc != i) {
         var xGenDocCanId = genDocCanId + i.toString();
         document.getElementById(xGenDocCanId).style.display = 'none';
      }
   }
   var selDocCanId = genDocCanId + selDoc.toString();
   
   document.getElementById(selDocCanId).style.display = 'block';
});

docphotobtn.addEventListener('click', function (ev) {
   takedocpicture();
   ev.preventDefault();
}, false);

function cleardocphoto() {
   var ddlDocType = document.getElementById('ddlDocType');
   if (ddlDocType.value === '2') {
      var context = docphotocanvas.getContext('2d');
      context.fillStyle = "#FFF";
      context.fillRect(0, 0, docphotocanvas.width, docphotocanvas.height);
      var ckSignDoc = document.getElementById('ckSignDoc');
      ckSignDoc.checked = false;
      // document.getElementById('anchordocSignCanvas').href = '';
   }
   else {
      var context = docphotocanvas.getContext('2d');
      context.fillStyle = "#FFF";
      context.fillRect(0, 0, docphotocanvas.width, docphotocanvas.height);
      var ckDoc = document.getElementById('ckDoc');
      ckDoc.checked = false;
      // document.getElementById('anchordocphotocanvas').href = '';
   }
}

function takedocpicture() {
   var docphotobtn_Spinner = document.getElementById('docphotobtn_Spinner');
   var docphotobtn_LoadingText = document.getElementById('docphotobtn_LoadingText');
   var docphotobtn_ButtonText = document.getElementById('docphotobtn_ButtonText');

   try {
      docphotobtn.disabled = true;
      docphotobtn_ButtonText.style.display = "none";
      docphotobtn_Spinner.style.display = "inline-block";
      docphotobtn_LoadingText.style.display = "block";

      cleardocphoto();
      GetCurrentRemoteVidDimension();
      if (width && height) {
         var ddlDocType = document.getElementById('ddlDocType');
         selIdDocType = ddlDocType.value;
         if (ddlDocType.value === '2') {
            var context = docphotocanvas.getContext('2d');
            docphotocanvas.width = width;
            docphotocanvas.height = height;
            context.drawImage(remoteVideo, 0, 0, width, height);

            var dataUrlSignCan = docphotocanvas.toDataURL();
            anchordocphotocanvas.href = dataUrlSignCan;

            var ckSignDoc = document.getElementById('ckSignDoc');
            ckSignDoc.checked = true;
            docphotobtn.disabled = false;
            docphotobtn_Spinner.style.display = "none";
            docphotobtn_LoadingText.style.display = "none";
            docphotobtn_ButtonText.style.display = "block";
         }
         else {
            var tempCanvas = document.createElement('canvas');
            var tempCanvasCtx = tempCanvas.getContext('2d');
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCanvasCtx.drawImage(remoteVideo, 0, 0, width, height);
            var docDetectURL = '', falseMessage = '';
            if (selIdDocType === '0') {

               // 24/06/2021 added below one line of code
               ckDoc.checked = false;

               docDetectURL = panDetectionURL;
               falseMessage = 'Invalid PAN document!';
            }
            else if (selIdDocType === '1') {
               docDetectURL = aadhaarDetectionURL;
               falseMessage = 'Invalid Aadhaar document!';
            }

            swal({
               title: "Validating Document...",
               text: "Please Wait",
               // type: "info",
               // icon: "info",
               imageUrl: "./images/Loader-Ellipsis-244px.gif",
               buttons: false,
               showConfirmButton: false,
               // showCancelButton: false,
               // closeOnConfirm: false,
               // showLoaderOnConfirm: false,
               allowOutsideClick: false
            });

            var ImageDataURL = tempCanvas.toDataURL();
            var ImageData = ImageDataURL.split(',');
            var b64Image = ImageData[1];

            var Data = {
               image: b64Image,
            };
            $.ajax({
               type: "POST",
               url: docDetectURL,
               dataType: "JSON",
               data: JSON.stringify(Data),
               contentType: "application/json; charset=utf-8",
               success: function (responseData) {
                  var responseJSON = JSON.parse(JSON.stringify(responseData));
                  console.log(responseData, "responseData of pan and aadhar");
                  if (responseJSON.ResponseCode === "000") {
                     var maskImage = 'data:image/png;base64,' + responseJSON.ResponseMessage.OutputImage;
                     if (responseJSON.FaceDetectFlag != true) {
                        // swal('Alert!', 'Document Verified But Unable To Detect Face In Document, You Can Try Again', 'info');
                        swal({
                           title: 'Alert!',
                           text: 'Document Verified But Unable To Detect Face Image!',
                           type: 'info',
                           showCancelButton: true,
                           confirmButtonColor: "#2b982b",
                           confirmButtonText: 'Accept',
                           cancelButtonText: "Retake Photo"
                       });
                     }

                     // 24/06/2021 added below one line of code

                     ckDoc.checked = true;
                     var context = docphotocanvas.getContext('2d');
                     docphotocanvas.width = width;
                     docphotocanvas.height = height;

                     var image = new Image();
                     image.onload = function () {
                        context.drawImage(image, 0, 0, width, height);
                        var dataUrlPhotoAadharCan = docphotocanvas.toDataURL();
                        anchordocphotocanvas.href = dataUrlPhotoAadharCan;
                     };
                     image.src = maskImage;

                     //PAN OCR
                     if (selIdDocType === '0') {
                        var panFaceImage = 'data:image/png;base64,' + responseJSON.ResponseMessage.FaceImage;
                        document.getElementById('xPanPhoto').src = panFaceImage;
                        document.getElementById('anchorxPanPhoto').href = panFaceImage;
                        if (responseJSON.ResponseMessage.FaceImage != '') {
                           matchPanphotobtn.disabled = false;
                        }
                        else {
                           matchPanphotobtn.disabled = true;
                           document.getElementById('xPanPhoto').src = './images/contactDefault.png'; 
                        }
                        InitPanOCR(b64Image);
                     }
                     else {
                        swal.close();
                     }

                     /*if (selIdDocType === '1') {
                        var maskImage = 'data:image/png;base64,' + responseJSON.ResponseMessage.OutputImage;

                        var context = docphotocanvas.getContext('2d');
                        docphotocanvas.width = width;
                        docphotocanvas.height = height;

                        var image = new Image();
                        image.onload = function () {
                           context.drawImage(image, 0, 0, width, height);
                           var dataUrlPhotoAadharCan = docphotocanvas.toDataURL();
                           anchordocphotocanvas.href = dataUrlPhotoAadharCan;
                        };
                        image.src = maskImage;
                     }
                     else {
                        swal.close();
                        var context = docphotocanvas.getContext('2d');
                        docphotocanvas.width = width;
                        docphotocanvas.height = height;
                        context.drawImage(tempCanvas, 0, 0, width, height);

                        var dataUrlPhotoPanCan = docphotocanvas.toDataURL();
                        anchordocphotocanvas.href = dataUrlPhotoPanCan;
                     }
                     */
                     ckDoc.checked = true;
                     docphotobtn.disabled = false;
                     docphotobtn_Spinner.style.display = "none";
                     docphotobtn_LoadingText.style.display = "none";
                     docphotobtn_ButtonText.style.display = "block";
                  }
                  else {
                     docphotobtn.disabled = false;
                     docphotobtn_Spinner.style.display = "none";
                     docphotobtn_LoadingText.style.display = "none";
                     docphotobtn_ButtonText.style.display = "block";
                     console.log('ERR >>> ', responseJSON.ResponseCode);
                     cleardocphoto();
                     swal('Alert!', falseMessage, 'error');
                  }
               },
               error: function (err) {
                  cleardocphoto();
                  docphotobtn.disabled = false;
                  docphotobtn_Spinner.style.display = "none";
                  docphotobtn_LoadingText.style.display = "none";
                  docphotobtn_ButtonText.style.display = "block";
                  console.log('ERR >>> ', err);
                  swal('Alert!', 'An Error Occured While Validating Document!', 'error');
               }
            });
         }
      } else {
         cleardocphoto();
      }
   }
   catch (err) {
      console.log(err);
      cleardocphoto();
      docphotobtn.disabled = false;
      docphotobtn_Spinner.style.display = "none";
      docphotobtn_LoadingText.style.display = "none";
      docphotobtn_ButtonText.style.display = "block";
   }
}

function InitPanOCR(imageData) {
   var aadhaarFullName = document.getElementById('xName').value;

   swal({
      title: "Analyzing PAN Document...",
      text: "Please Wait",
      // type: "info",
      // icon: "info",
      imageUrl: "./images/Loader-Ellipsis-244px.gif",
      buttons: false,
      showConfirmButton: false,
      // showCancelButton: false,
      // closeOnConfirm: false,
      // showLoaderOnConfirm: false,
      allowOutsideClick: false
   });

   var Data = {
      image: imageData,
      firstname: aadhaarFullName
   };
   $.ajax({
      type: "POST",
      url: panOCRURL,
      dataType: "JSON",
      data: JSON.stringify(Data),
      contentType: "application/json; charset=utf-8",
      success: function (responseData) {
         if (responseData.ResponseCode === "000") {
            
            var ResponsePanData = responseData.ResponseMessage;

            // 24/06/2021 added below one line of code
            ckDoc.checked = true;


            if (ResponsePanData != null) {
               var aadhaarName = document.getElementById('xName').value;
               if (ResponsePanData.FirstName.trim().toUpperCase() != aadhaarName.trim().toUpperCase()) {
                  // swal('Alert!', 'Name On PAN Does Not Match With Name On Aadhaar', 'info');
                  swal({
                     title: 'Alert!',
                     text: 'Name On PAN Does Not Match With Name On Aadhaar',
                     type: 'warning',
                     showCancelButton: true,
                     confirmButtonColor: "#2b982b",
                     confirmButtonText: 'Accept!',
                     cancelButtonText: "Re-analyze"
                 }, function (isConfirm) {
                     if (isConfirm) {
                        document.getElementById('pName').value = ResponsePanData.FirstName.trim();
                        document.getElementById('pDOB').value = ResponsePanData.Dob.trim();
                        document.getElementById('pPAN').value = ResponsePanData.PanNumber.trim();
                        // 24/06/2021 added below one line of code
                        ckDoc.checked = true;
                     }
                     else {
                        document.getElementById('pName').value = '';
                        document.getElementById('pDOB').value = '';
                        document.getElementById('pPAN').value = '';

                        // 24/06/2021 added below one line of code
                        ckDoc.checked = false;
                     }
                 });
               }
               else {
                  swal.close();
                  document.getElementById('pName').value = ResponsePanData.FirstName.trim();
                  document.getElementById('pDOB').value = ResponsePanData.Dob.trim();
                  document.getElementById('pPAN').value = ResponsePanData.PanNumber.trim();
               }
            }
            else {
               swal.close();
            }
         }
         else {
            swal('Alert!', 'Poor Image Quality! Unable to Perform OCR.', 'info');

            // 24/06/2021 added below one line of code
            ckDoc.checked = true;
         }
      },
      error: function (err) {
         swal('Alert!', 'PAN OCR Service is Unavailable!', 'error');
         // 24/06/2021 added below one line of code
         ckDoc.checked = false;
      }
   });
}

matchphotobtn.addEventListener('click', function (ev) {
   var matchphotobtn_Spinner = document.getElementById('matchphotobtn_Spinner');
   var matchphotobtn_LoadingText = document.getElementById('matchphotobtn_LoadingText');
   var matchphotobtn_ButtonText = document.getElementById('matchphotobtn_ButtonText');

   async function face() {
      try {
         const displaySize = { width: "320", height: "200" }
         //const MODEL_URL = '/vkycmd/models'

         await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
         await faceapi.loadFaceLandmarkModel(MODEL_URL)
         await faceapi.loadFaceRecognitionModel(MODEL_URL)


         const input1 = document.getElementById('canvas');
         const input2 = document.getElementById('xDocPhoto');

         // const detections = await faceapi.detectAllFaces(input1);
         // const resizedDetections = faceapi.resizeResults(detections, displaySize);
         // faceapi.draw.drawDetections(canvas, resizedDetections);

         var detection1 = null;
         var detection2 = null;

         try {
            detection1 = await faceapi.detectAllFaces(input1).withFaceLandmarks().withFaceDescriptors();
            detection2 = await faceapi.detectAllFaces(input2).withFaceLandmarks().withFaceDescriptors();

            if (detection1 != null && detection1.length > 0 && detection2 != null && detection2.length > 0) {
               const distance = await faceapi.euclideanDistance(detection1[0].descriptor, detection2[0].descriptor);
               console.log(distance);

               var distanceFloat = parseFloat(distance).toFixed(2)
               var ckFace = document.getElementById('ckFace');
               if (distanceFloat > 0.6) {
                  ckFace.checked = false;
                  document.getElementById('icoCheckCustPhoto').style.display = 'none';
                  document.getElementById('icoCrossCustPhoto').style.display = 'block';
                  document.getElementById('faceMatchPercent').innerHTML = '';
                  swal('Alert!', "Face Match Unsuccessful, Customer's Face Does Not Match With The Id Document's Face Image!", 'error');
                  matchphotobtn.disabled = false;
                  matchphotobtn_Spinner.style.display = "none";
                  matchphotobtn_LoadingText.style.display = "none";
                  matchphotobtn_ButtonText.style.display = "block";
               }
               else {
                  
                  ckFace.checked = true;
                  document.getElementById('icoCrossCustPhoto').style.display = 'none';
                  document.getElementById('icoCheckCustPhoto').style.display = 'block';
                  document.getElementById('faceMatchPercent').innerHTML = distanceFloat;
                  swal('Alert!', 'Face Match Successful!', 'success');
                  matchphotobtn.disabled = true;
                  matchphotobtn_Spinner.style.display = "none";
                  matchphotobtn_LoadingText.style.display = "none";
                  matchphotobtn_ButtonText.style.display = "block";
               }
            }
            else {
               matchphotobtn.disabled = false;
               matchphotobtn_Spinner.style.display = "none";
               matchphotobtn_LoadingText.style.display = "none";
               matchphotobtn_ButtonText.style.display = "block";

               if (detection1 === null || detection1.length === 0) {
                  swal('Alert!', "Could Not Detetct Any Face In 'Captured' Photo, Please Try Again!", 'error');
                  return;
               }
               if (detection2 === null || detection2.length === 0) {
                  swal('Alert!', "Could Not Detetct Any Face In 'Document' Photo, Please Try Again!", 'error');
                  return;
               }
               else {
                  swal('Alert!', "Unable To Detect Face, Please Try Again!", 'error');
                  return;
               }
            }
         }
         catch (err) {
            console.log(err);
            matchphotobtn.disabled = false;
            matchphotobtn_Spinner.style.display = "none";
            matchphotobtn_LoadingText.style.display = "none";
            matchphotobtn_ButtonText.style.display = "block";
            if (detection1 === null || detection1.length === 0) {
               swal('Alert!', "Could Not Detetct Any Face In 'Captured' Photo, Please Try Again!", 'error');
               return;
            }
            else {
               try {
                  if (detection1[0].descriptor === null) {
                     swal('Alert!', "Could Not Detetct Face Descriptors In 'Captured' Photo, Please Try Again!", 'error');
                     return;
                  }
               }
               catch (err) {
                  swal('Alert!', "Unable To Get Face Descriptors In 'Captured' Photo, Please Try Again!", 'error');
                  return;
               }
            }

            if (detection2 === null || detection2.length === 0) {
               swal('Alert!', "Could Not Detetct Any Face In 'Document' Photo, Please Try Again!", 'error');
               return;
            }
            else {
               try {
                  if (detection2[0].descriptor === null) {
                     swal('Alert!', "Could Not Detetct Face Descriptors In 'Document' Photo, Please Try Again!", 'error');
                     return;
                  }
               }
               catch (err) {
                  swal('Alert!', "Unable To Get Face Descriptors In 'Document' Photo, Please Try Again!", 'error');
                  return;
               }
            }
            return;
         }
      }
      catch (errX) {
         console.log(errX);
         swal('Alert!', "Failed To Match Face, Please Try Again!", 'error');
         matchphotobtn.disabled = false;
         matchphotobtn_Spinner.style.display = "none";
         matchphotobtn_LoadingText.style.display = "none";
         matchphotobtn_ButtonText.style.display = "block";
      }
   }
   matchphotobtn.disabled = true;
   matchphotobtn_ButtonText.style.display = "none";
   matchphotobtn_Spinner.style.display = "inline-block";
   matchphotobtn_LoadingText.style.display = "block";
   face();
});

matchPanphotobtn.addEventListener('click', function (ev) {
   var matchPanphotobtn_Spinner = document.getElementById('matchPanphotobtn_Spinner');
   var matchPanphotobtn_LoadingText = document.getElementById('matchPanphotobtn_LoadingText');
   var matchPanphotobtn_ButtonText = document.getElementById('matchPanphotobtn_ButtonText');

   async function face() {
      try {
         const displaySize = { width: "320", height: "200" }
         //const MODEL_URL = '/vkycmd/models'

         await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
         await faceapi.loadFaceLandmarkModel(MODEL_URL)
         await faceapi.loadFaceRecognitionModel(MODEL_URL)


         const input1 = document.getElementById('xDocPhoto');
         const input2 = document.getElementById('xPanPhoto');

         // const detections = await faceapi.detectAllFaces(input1);
         // const resizedDetections = faceapi.resizeResults(detections, displaySize);
         // faceapi.draw.drawDetections(canvas, resizedDetections);

         var detection1 = null;
         var detection2 = null;

         try {
            detection1 = await faceapi.detectAllFaces(input1).withFaceLandmarks().withFaceDescriptors();
            detection2 = await faceapi.detectAllFaces(input2).withFaceLandmarks().withFaceDescriptors();

            if (detection1 != null && detection1.length > 0 && detection2 != null && detection2.length > 0) {
               const distance = await faceapi.euclideanDistance(detection1[0].descriptor, detection2[0].descriptor);
               console.log(distance);

               var distanceFloat = parseFloat(distance).toFixed(2)
               // var ckFace = document.getElementById('ckFace');
               if (distanceFloat > 0.6) {
                  // ckFace.checked = false;
                  document.getElementById('icoCheckPanPhoto').style.display = 'none';
                  document.getElementById('icoCrossPanPhoto').style.display = 'block';
                  document.getElementById('panFaceMatchPercent').innerHTML = '';
                  swal('Alert!', "Face Match Unsuccessful, Customer's Face Does Not Match With The Id Document's Face Image!", 'error');
                  matchPanphotobtn.disabled = false;
                  matchPanphotobtn_Spinner.style.display = "none";
                  matchPanphotobtn_LoadingText.style.display = "none";
                  matchPanphotobtn_ButtonText.style.display = "block";
               }
               else {
                  // ckFace.checked = true;
                  document.getElementById('icoCrossPanPhoto').style.display = 'none';
                  document.getElementById('icoCheckPanPhoto').style.display = 'block';
                  document.getElementById('panFaceMatchPercent').innerHTML = distanceFloat;
                  swal('Alert!', 'Face Match Successful!', 'success');
                  matchPanphotobtn.disabled = true;
                  matchPanphotobtn_Spinner.style.display = "none";
                  matchPanphotobtn_LoadingText.style.display = "none";
                  matchPanphotobtn_ButtonText.style.display = "block";
               }
            }
            else {
               matchPanphotobtn.disabled = false;
               matchPanphotobtn_Spinner.style.display = "none";
               matchPanphotobtn_LoadingText.style.display = "none";
               matchPanphotobtn_ButtonText.style.display = "block";

               if (detection1 === null || detection1.length === 0) {
                  swal('Alert!', "Could Not Detetct Any Face In 'Aadhaar' Photo, Please Try Again!", 'error');
                  return;
               }
               if (detection2 === null || detection2.length === 0) {
                  swal('Alert!', "Could Not Detetct Any Face In 'PAN' Photo, Please Try Again!", 'error');
                  return;
               }
               else {
                  swal('Alert!', "Unable To Detect Face, Please Try Again!", 'error');
                  return;
               }
            }
         }
         catch (err) {
            console.log(err);
            matchPanphotobtn.disabled = false;
            matchPanphotobtn_Spinner.style.display = "none";
            matchPanphotobtn_LoadingText.style.display = "none";
            matchPanphotobtn_ButtonText.style.display = "block";
            if (detection1 === null || detection1.length === 0) {
               swal('Alert!', "Could Not Detetct Any Face In 'Aadhaar' Photo, Please Try Again!", 'error');
               return;
            }
            else {
               try {
                  if (detection1[0].descriptor === null) {
                     swal('Alert!', "Could Not Detetct Face Descriptors In 'Aadhaar' Photo, Please Try Again!", 'error');
                     return;
                  }
               }
               catch (err) {
                  swal('Alert!', "Unable To Get Face Descriptors In 'Aadhaar' Photo, Please Try Again!", 'error');
                  return;
               }
            }

            if (detection2 === null || detection2.length === 0) {
               swal('Alert!', "Could Not Detetct Any Face In 'PAN' Photo, Please Try Again!", 'error');
               return;
            }
            else {
               try {
                  if (detection2[0].descriptor === null) {
                     swal('Alert!', "Could Not Detetct Face Descriptors In 'PAN' Photo, Please Try Again!", 'error');
                     return;
                  }
               }
               catch (err) {
                  swal('Alert!', "Unable To Get Face Descriptors In 'PAN' Photo, Please Try Again!", 'error');
                  return;
               }
            }
            return;
         }
      }
      catch (errX) {
         console.log(errX);
         swal('Alert!', "Failed To Match Face, Please Try Again!", 'error');
         matchPanphotobtn.disabled = false;
         matchPanphotobtn_Spinner.style.display = "none";
         matchPanphotobtn_LoadingText.style.display = "none";
         matchPanphotobtn_ButtonText.style.display = "block";
      }
   }
   matchPanphotobtn.disabled = true;
   matchPanphotobtn_ButtonText.style.display = "none";
   matchPanphotobtn_Spinner.style.display = "inline-block";
   matchPanphotobtn_LoadingText.style.display = "block";
   face();
});

async function faceboundary(val) {
   var btnTakePersonPhoto_Spinner = document.getElementById('btnTakePersonPhoto_Spinner');
   var btnTakePersonPhoto_LoadingText = document.getElementById('btnTakePersonPhoto_LoadingText');
   var btnTakePersonPhoto_ButtonText = document.getElementById('btnTakePersonPhoto_ButtonText');

   var docphotobtn_Spinner = document.getElementById('docphotobtn_Spinner');
   var docphotobtn_LoadingText = document.getElementById('docphotobtn_LoadingText');
   var docphotobtn_ButtonText = document.getElementById('docphotobtn_ButtonText');

   try {
      // const displaySize = { width: "320", height: "200" }
      const displaySize = { width: width, height: height }
      //const MODEL_URL = '/vkyc.web/models' //set in env.url.js

      await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
      await faceapi.loadFaceLandmarkModel(MODEL_URL)
      await faceapi.loadFaceRecognitionModel(MODEL_URL)

      if (val == "photo") {
         const input1 = document.getElementById('canvas');
         const detections = await faceapi.detectAllFaces(input1);
         if (detections === null || detections.length === 0) {
            matchphotobtn.disabled = true;
            alertify.alert('Unable To Detect Face In Captured Photo, Please Try Again!')
         }
         else if (detections.length > 1) {
            matchphotobtn.disabled = true;
            alertify.alert('More Than One Face Detected, Capture Photo With A Single Face!')
         }
         else {
            matchphotobtn.disabled = false;
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvas, resizedDetections);
         }
         btnTakePersonPhoto.disabled = false;
         btnTakePersonPhoto_Spinner.style.display = "none";
         btnTakePersonPhoto_LoadingText.style.display = "none";
         btnTakePersonPhoto_ButtonText.style.display = "block";
      }
      else if (val == "docphotocanvas") {
         // const input2 = document.getElementById('docphotocanvas');
         const input2 = docphotocanvas;
         const detections = await faceapi.detectAllFaces(input2);
         if (detections === null || detections.length === 0) {
            swal('Alert!', 'Unable To Detect Face In Document Photo, Please Try Again!', 'error');
            document.getElementById('anchordocphotocanvas').href = '';
         }
         else {
            swal.close();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(docphotocanvas, resizedDetections);

            var dataUrlPhotoCan = docphotocanvas.toDataURL();
            document.getElementById('anchordocphotocanvas').href = dataUrlPhotoCan;
            var ckDoc = document.getElementById('ckDoc');
            ckDoc.checked = true;
         }
         docphotobtn.disabled = false;
         docphotobtn_Spinner.style.display = "none";
         docphotobtn_LoadingText.style.display = "none";
         docphotobtn_ButtonText.style.display = "block";
      }
   }
   catch (err) {
      console.log(err);
      swal('Alert!', 'Failed To Detect Face!', 'error');
      document.getElementById('anchordocphotocanvas').href = '';
      if (val == 'photo') {
         btnTakePersonPhoto.disabled = false;
         btnTakePersonPhoto_Spinner.style.display = "none";
         btnTakePersonPhoto_LoadingText.style.display = "none";
         btnTakePersonPhoto_ButtonText.style.display = "block";
      }
      else if (val == "docphotocanvas") {
         docphotobtn.disabled = false;
         docphotobtn_Spinner.style.display = "none";
         docphotobtn_LoadingText.style.display = "none";
         docphotobtn_ButtonText.style.display = "block";
      }
   }
}

function InitAddrMismatch() {
   var prev = null;
   $("#divAddrMismatch :input").change(function () {
      (prev) ? prev.value : null;
      if (this !== prev) {
         prev = this;
      }
      if (this.id === 'radMismatchN' && radMismatchN.checked) {
         document.getElementById('ddlAddrDocType').disabled = false;
         document.getElementById('docAddrphotobtn').disabled = false;
      }
      else {
         document.getElementById('ddlAddrDocType').disabled = true;
         document.getElementById('docAddrphotobtn').disabled = true;
      }
   });
}

function GetCurrentRemoteVidDimension() {
   height = remoteVideo.videoHeight;
   width = remoteVideo.videoWidth;
}

panAadharDetails.addEventListener('click', function () {
   var aadharDetails = document.getElementById("aadharDetails");
   var panDetails = document.getElementById("panDetails");
   if (aadharDetails.style.display === "none") {
       aadharDetails.style.display = "block";
       panDetails.style.display = "none";
       aadharTitle.style.display = "block";
       panTitle.style.display = "none";
   } 
   else if(panDetails.style.display === "none") {
       aadharDetails.style.display = "none";
       panDetails.style.display = "block";
       aadharTitle.style.display = "none";
       panTitle.style.display = "block";
   }
})



// Get RTC stats

var upLink = document.getElementById('upLink');
var downLink = document.getElementById('downLink');
var localPacketLoss = document.getElementById('localPacketLoss');
var localRetransmittedPacket = document.getElementById('localRetransmittedPacket');
var remotePacketLoss = document.getElementById('remotePacketLoss');

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

               const LocalRetransmittedPacket = report.retransmittedPacketsSent;
               localRetransmittedPacket.innerHTML = LocalRetransmittedPacket;
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

               const RemotePacketLoss = inBoundLastResult.get(report.id).packetsLost;
               remotePacketLoss.innerHTML = RemotePacketLoss;
               /*
               console.log('---------------------------------------INBOUND----------------------------------------------------');
               console.log('Bytes/s >>>', KiloBytesPerSec);
               console.log('BitRate >>>', bitrate);
               console.log('PacketsSent/s >>>', packets - inBoundLastResult.get(report.id).packetsReceived);
               console.log('TotalPacketsSent >>>', packets);
               console.log('-----------------------------------------------------------------------------------------');
               console.log('-----------------------------------------------------------------------------------------');
               */

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
}, 1000);


// Remote Inbound RTC
let remoteInBoundLastResult;
window.setInterval(() => {
   if (!RTCPeerConn) {
      return;
   }
   if (RTCPeerConn.connectionState != 'connected') {
      downLink.innerHTML = '0';
      return;
   }
   const sender = RTCPeerConn.getSenders()[1];
   if (!sender) {
      return;
   }
   sender.getStats().then(res => {
      res.forEach(report => {
         if (report.type === 'remote-inbound-rtp') {
            const now = report.timestamp;
            if (remoteInBoundLastResult && remoteInBoundLastResult.has(report.id)) {
               const deltaT = now - remoteInBoundLastResult.get(report.id).timestamp;

               const LocalPacketLoss = report.packetsLost;
               localPacketLoss.innerHTML = LocalPacketLoss;
            }
         }
      });
      remoteInBoundLastResult = res;
   });
}, 1000);




//Liveness Check

function InitLivenessCheck(blobData) {
   debugger;
   var livenessStatsBadge = document.getElementById('livenessStatsBadge');
   livenessStatsBadge.innerHTML = "- PENDING -";
   try {
      var aadhaarImgSrc = document.getElementById('xDocPhoto').src;
      
      var formData = new FormData();
      formData.append('inputfile', blobData, xCustId + '.webm');
      // formData.append('inputImage', aadhaarImgSrc);
      $.ajax({
         type: 'POST',
         url: LivenessCheckURL,
         data: formData,
         processData: false,
         contentType: false,
         success: function (responseData) {
            debugger;
            btnLivenessStopRecord_Spinner.style.display = 'none';
            btnLivenessStartRecord.style.display = 'block';
            var responseJSON = JSON.parse(JSON.stringify(responseData));
            if (responseJSON.ResponseCode === "000") {
               // swal('Alert!', responseJSON.ResponseMessage, 'success');
               livenessStatsBadge.innerHTML = "- SUCCESS -";
            }
            else {
               // swal('Alert!', responseJSON.ResponseMessage, 'error');
               livenessStatsBadge.innerHTML = "- FAILURE -";
               console.log("LivenessCheck >>>", responseJSON.ResponseMessage);
            }
         },
         error: function (err) {
            btnLivenessStopRecord_Spinner.style.display = 'none';
            btnLivenessStartRecord.style.display = 'block';
            livenessStatsBadge.innerHTML = "- PENDING -";
            console.log("LivenessCheck err >>>", err);
         }
      });
   }
   catch (error) {
      btnLivenessStopRecord_Spinner.style.display = 'none';
      btnLivenessStartRecord.style.display = 'block';
      livenessStatsBadge.innerHTML = "- PENDING -";
      console.log("LivenessCheck Catch error >>>", error);
   }
}

// ckLiveness.addEventListener('change', function () {
//    debugger;
//    if(this.checked) {
//       passiveLiveCkBool = true;
//       // initValidateLiveness();
//    }
//    else {
//       passiveLiveCkBool = false;
//    }
// });

// function initValidateLiveness() {
//    livenessFrames = [];
//    framesCapturedCount = 0;
//    var captureFPSinterval = setInterval(function () {
//       initCaptureFrame();
//       if(framesCapturedCount > maxFrameSetCount) {
//          clearInterval(captureFPSinterval);
//          console.log(livenessFrames.length);
//          validateCapturedFramesAjax(livenessFrames);
//       }
//    }, frameCaptureInterval)
// }

// function initCaptureFrame() {
//    debugger;
//    try {
//       //clearphoto();
//       var fps = 30;
//       var livenessCanvas = document.createElement('canvas');
//       var context = livenessCanvas.getContext('2d');
//       if (livenessCanWidth && livenessCanHeight) {
//          for(var i = 0; i < fps; i++) {
//             livenessCanvas.width = livenessCanWidth;
//             livenessCanvas.height = livenessCanHeight;
//             context.drawImage(remoteVideo, 0, 0, livenessCanWidth, livenessCanHeight);
//             var data = livenessCanvas.toDataURL().split(',');
//             livenessFrames.unshift(data[1]);
//             //console.log(data);
//          }
//          framesCapturedCount++;
//          //var data = canvas.toDataURL('image/png');
//          //photo.setAttribute('src', data);
//       }
//    }
//    catch (err) {
//       console.log(err);
//    }
// }

// function validateCapturedFramesAjax(livenessFrames) {
//    debugger;
//    var Data = {
//       images: livenessFrames
//    };
//    $.ajax({
//       type: "POST",
//       url: LivenessCheckURL,
//       dataType: "JSON",
//       data: JSON.stringify(Data),
//       contentType: "application/json; charset=utf-8",
//       success: function (responseData) {
//          debugger;
//          var responseJSON = JSON.parse(JSON.stringify(responseData));
//          if (responseJSON.ResponseCode === "000") {
//             swal('Alert!', responseJSON.ResponseMessage, 'success');
//          }
//          else {
//             swal('Alert!', responseJSON.ResponseMessage, 'error');
//          }
//       },
//       error: function (err) {
//          console.log(err);
//       }
//    });
// }