require("dotenv").config();
import express = require('express');
import cors = require('cors');
import connectDB from './db';
const fs = require('fs');


connectDB();

// const allowedOrigins = ['*', 'http://localhost:8080']; //MAIN APP CORS

// Create a new express app instance
const app: express.Application = express();
// app.use(cors({
//     origin: function(origin, callback){
//         if(!origin) return callback(null, true);
//         if(allowedOrigins.indexOf(origin) === -1) {
//             var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     }
//     })
// )
app.use(cors())
app.use(express.urlencoded({limit: "16mb", extended: true, parameterLimit:50000}));
app.use(express.json({limit: "16mb"}));

var sslCerts = {
    key: fs.readFileSync('./certs/server-key.pem'),
    cert: fs.readFileSync('./certs/server-cert.pem'),
};

const https = require("https").Server(sslCerts, app);
const http = require("http").Server(app);
const io = require('socket.io')(process.env.NODE_ENV == 'development' ? http : https, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
});

require('./socket')(io);
const api = require("./routes")(io);
app.use("/api", api);


if(process.env.NODE_ENV == 'development') {
  http.listen(3000, '192.168.178.31', function () {
    console.log('App is listening on port 3000!');
  });
} else {
  https.listen(3000, function () {
    console.log('App is listening on port 3000!');
  });
}
console.log(process.env)


export default app;