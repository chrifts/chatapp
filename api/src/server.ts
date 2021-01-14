require('dotenv').config();
import express = require('express');
import cors = require('cors');
import connectDB from './db';
const fs = require('fs');
connectDB();

const allowedOrigins = ['https://www.chatapp.website']; //MAIN APP CORS
// Create a new express app instance
const app: express.Application = express();
if(process.env.NODE_ENV == 'development') {
  app.use(cors())
} else {
  app.use(cors({
      origin: function(origin, callback){
          if(!origin) return callback(null, true);
          if(allowedOrigins.indexOf(origin) === -1) {
              var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
              return callback(new Error(msg), false);
          }
          return callback(null, true);
      }
      })
  )
}
app.use(express.urlencoded({limit: "16mb", extended: true, parameterLimit:50000}));
app.use(express.json({limit: "16mb"}));

let web;

if(process.env.NODE_ENV == 'production') {
  var certsPath = process.env.SSL_CERT_PATH;
  var httpsCerts = {
    key: fs.readFileSync(certsPath+'/privkey.pem'),
    cert: fs.readFileSync(certsPath+'/cert.pem'),
    ca: fs.readFileSync(certsPath+'/chain.pem')
  };
  web = require("https").Server(httpsCerts, app);
} else {
  web = require("http").Server(app);
}


const io = require('socket.io')(web, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    },
    pingInterval: 10000,
    pingTimeout: 5000,
});

require('./socket')(io);
const api = require("./routes")(io);
app.use("/api", api);


if(process.env.NODE_ENV == 'development') {
  web.listen(3000, '192.168.178.20', function () {
    console.log('App is listening on port 3000!');
  });
} else {
  web.listen(3000, function () {
    console.log('App is listening on port 3000!');
  });
}

console.log(process.env)

export default app;