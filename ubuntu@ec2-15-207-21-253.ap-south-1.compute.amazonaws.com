<!DOCTYPE html>
<html lang="en">

<head>
    <title>Peer-Peer Video Communication Demo</title>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<script src="js/jquery-2.1.1.min.js"></script>
<script src="js/face-api.js"></script>
<script src='https://unpkg.com/tesseract.js@v2.0.0-alpha.13/dist/tesseract.min.js'></script>
</head>


<body>

    <section>
        <div id="loginPage" class="container">
            <div class="row LoginrowClas  text-center ">
                <div class="col-12">
                    <h2>Tele-Consulting Room</h2>
                </div>
            </div>
            <div class="row d-flex LoginrowClass mt-3">
                <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                    <div class="form-group">
                        <label for="usernameInput" class="sr-only">Join</label>
                        <input type="email" id="usernameInput" class="form-control formgroup input-md" placeholder="Join" required="" autofocus="">
                    </div>
                </div>
                <div class=" col-xs-6 col-sm-6 col-md-1 col-lg-1 col-xl-1  ">
                    <button id="loginBtn" class="btn btn-md btn-primary btnblock middle">Join</button>
                </div>

            </div>
            <hr>
        </div>
    </section>


    <section>
        <div id="sectionID" class="container-fluid containerSection">
            <div class="row LoginrowClass mb-3 text-center">
                <div class=" col-md-12 col-lg-12 col-12 ">
                    <h2>Welcome to the confernce Room</h2>
                </div>
            </div>

            <div class="row LoginrowClass mb-3 mt-5">
                <div class="col-xs-3 col-sm-3 col-md-3 col-lg-2 col-xl-2 MainBox" sectionname="audio">
                    <div class="card cardclass"> 
                        <img src="mircophone6.png" class="sectionImg" title="Audio Call" id="micro" />
                        <img src="mircophone_mute.png" class="sectionImg" title="Audio Call" id="micro_mute"/>
                    </div>
                </div>
                <div class=" col-xs-3 col-sm-3 col-md-3 col-lg-2 col-xl-2  MainBox" sectionname="video">
                    <div class="card cardclass" id="video_div">
                        <img src="video4.png" class="sectionImg" title="Video Call" id="videoImg" />
                        <img src="video_mute.png" class="sectionImg" title="Video Call" id="videoImg_mute" />
                    </div>
                </div>

                <div class="col-xs-3 col-sm-3 col-md-3 col-lg-2 col-xl-2 MainBox" sectionname="chat">
                    <div class="card cardclass">
                        <img src="chat5.png" class="sectionImg" title="Chat" id="chatImg" />
                    </div>
                </div>

                <div class="col-xs-3 col-sm-3 col-md-3 col-lg-2 col-xl-2 MainBox" sectionname="fileshare">
                    <div class="card cardclass">
                        <img src="file1.png" class="sectionImg" title="File Share" id="fileShare" />
                    </div>
                </div>
            </div>
        </div>
    </section>


    <section>
        <div class="container containerSection">

            <div class="row LoginrowClass mb-3" id="mainPanel">

                <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8  col-xl-8  mt-5 " id="audioCallDiv" style="border: 1px solid #ccc;display: block;box-shadow: 0 0 10px gray;">
                    <h2 class="LoginrowClass mt-4 ">Audio call</h2>
                    <div class="card mt-5 mb-5" style="display: block;margin: 0 auto;width:50%;box-shadow: 0 0 10px #00d3b6;    border-radius: unset;">
                        <div class="card-body ">
                            <img src="microphone7.png" class="sectionImg" style="width: 89px;height: 131px;margin: 0 auto;display: block;" title="Audio Call" />
                        </div>
                    </div>
                </div>

                <div class=" col-xs-12 col-sm-12 col-md-8 col-lg-8  col-xl-8 mt-5" style="box-shadow: 0 0 10px gray;display: none; " id="videoCallDiv">
                    <span id="callPage">
                  <h2 class="LoginrowClass mt-4">Video call</h2>

                  <div class="row LoginrowClass mt-5 ">

                     <div class="col-12 ">
                        <div class="call-page">
                           <video id="localVideo" autoplay></video>
                           <video id="remoteVideo" autoplay></video>
                        </div>
                     </div>
                  </div>



                  <div class="row text-center LoginrowClass mt-3 ">
                     <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 ">
                        <div class="row LoginrowClass">
                           <div class="col-xs-5 col-sm-5 col-md-5 col-lg-5 col-xl-5 p-0">
                              <div class="form-group">
                                 <input id="callToUsernameInput" class="form-control formgroup input-md" type="text"
                                    placeholder="Username to call" />
                              </div>
                           </div>
                           <div class="col-xs-4 col-sm-5 col-md-7 col-lg-7 col-xl-7  p-0">
                              <button id="callBtn" class="btn-success btn btnText"><i class="fa fa-phone"
                                    aria-hidden="true"></i>
                                 Call</button>
                              <button id="hangUpBtn" class="btn-danger btn btnText"><i class="fa fa-times"
                                    aria-hidden="true"></i>
                                 Hang
                                 Up</button>
				<button id="startbutton" class="btn-success btn btnText">Take photo</button>
				<br> </br>	
				<button id="docphotobtn" class="btn-success btn btnText">Take Document photo</button>
				<br></br>
                           </div>
                           <div class="col-xs-4 col-sm-5 col-md-7 col-lg-7 col-xl-7  p-0">
				<img id="photo" class = "call-page-record" alt="The screen capture will appear in this box." crossOrigin="anonymous"/>
				<br></br>
				<img id="docphoto" class = "call-page-record" alt="The Document Photo will appear here !!" crossOrigin="anonymous"/> 
                                <br> </br>			
				<button id="matchphotobtn" class="btn-success btn btnText">Compare Face Image</button>
			<br></br>
				<button id="parseImgBtn" class="btn-success btn btnText">Extract data from Doc  Image</button>
                                <br></br>
				<div class="form-group">
    					<!-- label for="exampleTextarea">Example textarea</label-->
    					<textarea class="form-control" id="imgTextarea" rows="6"></textarea>
  				</div>
				<!-- textarea id="imgTextarea" name="imgTextarea" rows="5"cols="25"></textarea -->
			   </div>
			</div>
                     </div>
                  </div>
               </span>

                    <div class="row text-center LoginrowClass mt-3">
                        <div id="callRecord" class="call-record">
                            <div class="row text-center">
                                <div class="col-md-12 col-lg-12">
                                    <button id="btn-start-recording" class="btn-success btn btnText"><i class="fa fa-play"
                                 aria-hidden="true"></i>
                              Start Recording</button>
                                    <button id="btn-stop-recording" class="btn-danger btn btnText">
                              <i class="fa fa-stop-circle" aria-hidden="true"></i>
                              Stop Recording</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row text-center LoginrowClass mt-3 mb-3">
                        <div class="col-md-12 col-lg-12" style="display: flex;justify-content: center;">
                            <div id="viewPage" class="call-page-record">
                                <video id="viewlocalVideo" class="videoClass" autoplay></video>
                                <video id="viewremoteVideo" class="videoClass" autoplay></video>
                            </div>
                        </div>
                    </div>

                    <!-- div class="row">
               <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
                  check
               </button>
            </div -->

                    <!--  <div id="modalPage">
               <div class="modal-dialog" role="document">
                  <div class="modal-content">
                     <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Incoming Call...</h4>
                     </div>
                     <div class="modal-body">
                     </div>
                     <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Decline</button>
                        <button type="button" id="btn_ok_1" class="btn btn-primary">Accept</button>
                     </div>
                  </div>
               </div>
            </div> -->

                </div>
                <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4  col-xl-4 " id="chatarea">
                    <div class="card mt-5" style="position: sticky;
                    top: 0;">
                        <div class=" card-header ">
                            <h3>Chat</h3>
                        </div>
                        <div class="card-body ">
                            <section>
                                <div class="container-fluid containerclass">
                                    <div class="row">
                                        <div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2  middleflex">
                                            <img src="avatar.png" class="chatAvatar" alt="Avatar">
                                        </div>
                                        <div class="col-9 col-sm-9 col-md-9 col-lg-9 col-xl-9  chattextRightPad">
                                            <span class="chatText">Hello. How are you today?</span>
                                        </div>
                                        <div class="col-12" style="padding: 0;">
                                            <span class="time-right chatTime">11:00</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="container-fluid containerclass darker">
                                    <div class="row">
                                        <div class="col-9 col-sm-9 col-md-9 col-lg-9 col-xl-9 chattextLeftPad middleflex">
                                            <span class="chatText">Hello. How are you today?</span>
                                        </div>
                                        <div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2  middleflex">
                                            <img src="avatar.png" class="chatAvatar right" alt="Avatar">
                                        </div>
                                        <div class="col-12" style="padding: 0;">
                                            <span class="time-left chatTime">11:00</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <div class="row">
                                <div class="col-12 p-0">
                                    <div class="form-group">
                                        <textarea class="form-control" rows="5" placeholder="type.." id="Input"></textarea>
                                    </div>
                                </div>
                                <div class="col-12 p-0">
                                    <!--  <input type="button" id="sendMsgBtn" class="btn-success btn" value="Send" style="width: 100%;"> -->

                                    <Button id="sendMsgBtn" class="btn-success btn" style="width: 100%;">Send</Button>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <textarea class="form-control" rows="5" placeholder="type.." id="msgInput"></textarea>
            <Button id="pqr" class="btn-success btn" style="width: 100%;">Send1</Button>
    </section>


    <!-- modal Code Start-->
    <!-- The Modal -->
    <div id="modalPage" class="modal">
        <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
            <div class="modal-content">

                <!-- Modal Header -->
                <div class="modal-header">
                    <h6 class="modal-title">Incoming Call.....</h6>
                    <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                </div>

                <!-- Modal body -->
                <div class="modal-body">
                    <div class="row LoginrowClass">
                        <div class="col-6 ">
                            <img src="avatar.png" alt="avatar" class="">
                        </div>
                    </div>

                </div>

                <!-- Modal footer -->
                <div class="modal-footer">
                    <div class="row ">
                        <div class="col-4 ">
                            <button id="btn_ok_1" type="button" class="btn btn-success" data-dismiss="modal">Acccept</button>
                        </div>
                        <div class="col-1"></div>
                        <div class="col-4 ">
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- modal Code END -->
        <div class="row text-center LoginrowClass mt-3 mb-3">
          <div class="col-md-12 col-lg-12" style="display: flex;justify-content: center;"> </div>
          <div class="col-md-12 col-lg-12" style="display: flex;justify-content: center;">
		<canvas id="canvas">
  		</canvas>
          </div>
	
          <div class="col-md-12 col-lg-12" style="display: flex;justify-content: center;"> </div>
          <div class="col-md-12 col-lg-12" style="display: flex;justify-content: center;">
		<canvas id="docphotocanvas">
  		</canvas>
	</div>
	</div>
        
	<!--script src="client.js"></script>
        <script src="https://cdn.webrtc-experiment.com/RecordRTC.js"></script>
        <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script-->



        <script>
            $(document).ready(function() {
                $(document).on('click', '#sendMsgBtn', function() {
                    msg = $('#Input').val();
                    alert(msg);
                })
            });
        </script>

</body>

	<script src="client.js"></script>
        <script src="https://cdn.webrtc-experiment.com/RecordRTC.js"></script>
        <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
	<script src="js/tesseract-ocr.js"></script>
</html>
