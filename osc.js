var osc = require('node-osc');
var WebSocket = require('ws');
//var sb = require('./sb.js');

var sb = {};
sb.server = 'sandbox.spacebrew.cc';
sb.name = "nodeosc";
sb.desc = "This will convert osc message to spacebrew.";

if (process.argv.length > 2) {
  for ( var i = 2; i < process.argv.length; i ++ ) {
    var expression = /([-a-zA-Z]+)=([-a-zA-Z0-9\.]+)/;
    var m = process.argv[i].match(expression);
    if (m) {
      if (m[1] == "server") { 
        sb.server = m[2];
        console.log("set server hostname: " + sb.server);
      }
      else if (m[1] == "name") {
        sb.name = m[2];
        console.log("set app name: " + sb.name);
      }
      else if (m[1] == "file") {
        data.file = m[2];
        console.log("set file name: " + data.file);
      }
    }
  }
}

sb.config = {
  "config": {
    "name": sb.name,
    "description": sb.desc,
    "subscribe": {
      "messages": []
    },
    "publish": {
      "messages": [
        {
          "name": "roll",
          "type": "range"
        },
        {
          "name": "yaw",
          "type": "range"
        },
        {
          "name": "pitch",
          "type": "range"
        }
      ]
    }
  }
};

sb.conn = new WebSocket("ws://"+sb.server+":9000");  

sb.conn.onopen = function() {
  console.log("WebSockets connection opened");
  // send my config
  sb.conn.send(JSON.stringify(sb.config));
}

sb.conn.onmessage = function(e) {
    console.log("Got WebSockets message: " + e.data);
    var tMsg = JSON.parse(e.data);
    var tName = tMsg.message.name;
    var tType = tMsg.message.type;
    var tValue = tMsg.message.value;
    data.log.info( { data: ++data.id, user: sb.name, name: tName, sbtype: tType, value: tValue } );

}

sb.conn.onclose = function() {
    console.log("WebSockets connection closed");
}

sb.conn.onerror = function(e) {
  console.log("onerror ", e);

}

// When the "error" event is emitted for the spacebrew connection, this is called
sb.conn.on("error", function(error) {
  console.log("+++++++ ERROR +++++++");
  console.error(error);
});


//var client = new osc.Client('127.0.0.1', 3333);
//client.send('/oscAddress', 200);
//console.log(sb);
//console.log(Spacebrew.Client);

// Spacebrew Object
// var sbConnection = sb.Client("sandbox.spacebrew.cc", "nodeosc", "this is a desc");

var oscServer = new osc.Server(3819, '0.0.0.0');
oscServer.on("message", function (msg, rinfo) {
      console.log("TUIO message:");
      console.log(msg[1]);
      var pitch = msg[1] * 1023;
      var roll = msg[2] * 1023;
      var yaw = msg[3] * 1023;

      var message = {message:
       {
           clientName:sb.name,
           name:"pitch",
           type:"range",
           value:pitch
       }
   		};

   	//console.log(message);
   	sb.conn.send(JSON.stringify(message));


   	      var message = {message:
       {
           clientName:sb.name,
           name:"roll",
           type:"range",
           value:roll
       }
   		};

   	//console.log(message);
   	sb.conn.send(JSON.stringify(message));

   	      var message = {message:
       {
           clientName:sb.name,
           name:"yaw",
           type:"range",
           value:yaw
       }
   		};

   	//console.log(message);
   	sb.conn.send(JSON.stringify(message));

});

