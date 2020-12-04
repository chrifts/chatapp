import * as functions from 'firebase-functions';
import express = require('express');
import admin = require('firebase-admin');
import cors = require('cors');

const serviceAccount = require("../admin-sdk-keys.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-1d5a3.firebaseio.com"
});

// var allowedOrigins = ['http://localhost:8080', 'https://chat-1d5a3.web.app/'];
var allowedOrigins = ['*'];

const app: express.Application = express();

const validateFirebaseIdToken = async (req: any, res: any, next: any) => {
    console.log('Check if request is authorized with Firebase ID token');
  
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
      console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
          'Make sure you authorize your request by providing the following HTTP header:',
          'Authorization: Bearer <Firebase ID Token>',
          'or by passing a "__session" cookie.');
      res.status(403).send('Unauthorized');
      return;
    }
  
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      console.log('Found "Authorization" header');
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
      console.log('Found "__session" cookie');
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie
      res.status(403).send('Unauthorized');
      return;
    }
  
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      console.log('ID Token correctly decoded', decodedIdToken);
      req.user = decodedIdToken;
      next();
      return;
    } catch (error) {
      console.error('Error while verifying Firebase ID token:', error);
      res.status(403).send('Unauthorized');
      return;
    }
  };


app.use(cors({
    origin: function(origin, callback){
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  })
)

app.use(validateFirebaseIdToken);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

app.get('/get-user', function (req, res) {
    const email: string = req.query.email!.toString();
    admin.auth().getUserByEmail(email)
        .then(function(userRecord) {
            // tslint:disable-next-line:no-unsafe-any
            admin.database().ref('users/').child(userRecord.uid).once('value', (snapshot)=>{
                const extraData = snapshot.val();
                if(extraData['contacts']) {
                    delete extraData['contacts']
                }
                const theUser = {auth: userRecord.toJSON(), extraData: extraData}
                res.send(theUser);
            }).catch(er=>{
                console.log(er);
                return er
            })
        })
        .catch(function(error) {
            console.log('Error fetching user data:', error);
            res.status(404).send(error.toJSON());
        });
});

app.post('/get-user-uid', function (req, res) {
    //this returns what i call "auth" in database/user/contacts
    admin.auth().getUser(req.body.uid)
    .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully fetched user data:', userRecord.toJSON());
        res.send(userRecord.toJSON());
    })
    .catch(function(error) {
        console.log('Error fetching user data:', error);
        res.status(404).send(error.toJSON());
    });
});

app.get('/timestamp', function (req, res) { 
    res.send(`${Date.now()}`)
})

export const ggapp = functions.https.onRequest(app);
