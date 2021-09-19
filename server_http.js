//require file system module 
//var fs = require('fs'); 
//var httpServ = require('https');
  
//https://github.com/visionmedia/superagent/issues/205 
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  
//out secure server will bind to the port 9090 
/*var cfg = { 
   port: 9090, 
   ssl_key: 'server.key', 
   ssl_cert: 'server.crt' 
};
  
//in case of http request just send back "OK" 
var processRequest = function(req, res) { 
   res.writeHead(200); 
   res.end("OK"); 
};
  
//create our server with SSL enabled 
var app = httpServ.createServer({ 
   key: fs.readFileSync(cfg.ssl_key), 
   cert: fs.readFileSync(cfg.ssl_cert) 
}, processRequest).listen(cfg.port);*/

var WebSocketServer = require('ws').Server; 

//creating a websocket server at port 9090 
//var wss = new WebSocketServer({port: app}); 

var wss = new WebSocketServer({port: 9090}); 
//all connected to the server users 
var users = {};
  
//when a user connects to our sever 
wss.on('connection', function(connection) {
  
   console.log("User connected");
	
   //when server gets a message from a connected user 
   connection.on('message', function(message) { 
	
      var data; 
		
      //accepting only JSON messages 
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }
		
      //switching type of the user message 
      switch (data.type) { 
         //when a user tries to login
         case "login": 
            console.log("User logged", data.name); 
				
            //if anyone is logged in with this username then refuse 
            if(users[data.name]) { 
               sendTo(connection, { 
                  type: "login", 
                  success: false 
               }); 
            } else { 
               //save user connection on the server 
               users[data.name] = connection; 
               connection.name = data.name; 
					
               sendTo(connection, { 
                  type: "login", 
                  success: true 
               }); 
            } 
				
            break;
				
         case "offer": 
            //for ex. UserA wants to call UserB 
            console.log("Sending offer to: ", data.name);
				
            //if UserB exists then send him offer details 
            var conn = users[data.name]; 
				
            if(conn != null) { 
               //setting that UserA connected with UserB 
               connection.otherName = data.name; 
					
               sendTo(conn, { 
                  type: "offer", 
                  offer: data.offer, 
                  name: connection.name 
               }); 
            }
				
            break;
				
         case "answer": 
            console.log("Sending answer to: ", data.name); 
            //for ex. UserB answers UserA 
            var conn = users[data.name]; 
				
            if(conn != null) { 
               connection.otherName = data.name; 
               sendTo(conn, { 
                  type: "answer", 
                  answer: data.answer 
               }); 
            } 
				
            break; 
				
         case "candidate": 
            console.log("Sending candidate to:",data.name); 
            var conn = users[data.name];
				
            if(conn != null) { 
               sendTo(conn, { 
                  type: "candidate", 
                  candidate: data.candidate 
               }); 
            } 
				
            break;
				
         case "leave": 
            
            var conn = users[data.name]; 
           
				
            //notify the other user so he can disconnect his peer connection 
            if(conn != null) {
               sendTo(conn, { 
                  type: "leave" 
              }); 
            //   delete users[conn.name]; 
            //   delete users[conn.otherName]; 
             // console.log("Leaving from", data.name, conn.name); 
              //console.log("Leaving from", data.name, conn.otherName); 
            }
				
            break;
				
         default: 
            sendTo(connection, { 
               type: "error", 
               message: "Command not found: " + data.type 
            }); 
				
            break; 
      }
		
   }); 
	
   //when user exits, for example closes a browser window 
   //this may help if we are still in "offer","answer" or "candidate" state 
   connection.on("close", function() { 
	
      if(connection.name) { 
         delete users[connection.name]; 
			console.log("Disconnecting from ", connection.name); 
         if(connection.otherName) { 
            
            
            console.log("Disconnecting from ", connection.otherName); 
            var conn = users[connection.otherName]; 
           // conn.otherName = null;
				
            if(conn != null) { 
               sendTo(conn, { 
                  type: "leave" 
               }); 
               delete users[connection.otherName];
               console.log("users[connection.otherName]", users[connection.otherName]);
               connection.otherName = null;
               connection.name = null; 
               console.log("Disconnecting from admin", connection.otherName); 
               console.log("Disconnecting from user", connection.name)
            }
         } 
      }
		
   });  
	
   connection.send("Hello world");  
});
  
function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}
console.log("Server started");