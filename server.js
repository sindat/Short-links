require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const validUrl = require('valid-url');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Access HTML body data for all types and requests which are over as encoded strings (x-www-form-urlencoded)
app.use(bodyParser.urlencoded({extended: false}));

//MongoDB Connection Check
getConnection = async () => {
  try {
    // Connect to MongoDB database I have set up
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    // log connection successful if connection succeeds
    console.log('Connection to DB Successful');
    // log state of MongoDB connection to confirm
    console.log(mongoose.connection.readyState);
  } catch (err) {
    // log failed connection if connection succeeds
    console.log('Connection to DB Failed');
    // log state of MongoDB connection to confirm
    console.log(mongoose.connection.readyState);
  }
};

getConnection();


// CREATE MONGO DOCUMENT SCHEMA FOR MY URL DOCUMENTS
const shortUrlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String
});

// CREATE MONGO MODEL FROM MONGO SCHEMA
const ShortUrlMongoModel = mongoose.model('ShortUrlMongoModel', shortUrlSchema);

	
// THIS FUNCTION IS RESPONSIBLE FOR CREATING THE URL OBJECT DOCUMENT IN THE DB
const createNewShortUrlEntry = (userPassedUrl, callback) => {
  
    // CHECK THAT THE PASSED IN URL IS OF VALID FORMAT
    
    
  

        
    // CREATE NEW DOCUMENT IN MONFO IF LOOKUP SUCCEEDS AS THE URL IS CORRECT
    ShortUrlMongoModel.create({originalUrl: userPassedUrl, shortUrl: shortid.generate()}, (err, createdUrlDoc) => {
      if (err) return console.log(err);
      
      // CALL THE PASSED IN CALLBACK FUNCTION
      callback(null, createdUrlDoc);
    });

  
    
    
    
    
    
    

    
};


// THIS IS FOR CREATING NEW SHORT URL ENTRIES IN THE DATABASE
// posting is being done via x-www-form-urlencoded method
// api/shorturl/new - that is what the user is posting against when submitting the form
app.post('/api/shorturl/new/', (req, res) => {
  
  userPassedUrl = req.body.url.toString();

  // VALID URL CHECK (https with www)
  if (!validUrl.isWebUri(userPassedUrl)) {
    res.json( {"error" : "Invalid URL"} );
    console.log("User passed in an invalid URL.");
  } else {

      // VALID URL - THEREFORE CALL MONGO DOCUMENT ENTRY CREATION SCRIPT
      createNewShortUrlEntry(userPassedUrl, (err, foundAndUpdatedUrlDoc) => {
      res.json({ original_url : foundAndUpdatedUrlDoc.originalUrl, short_url : foundAndUpdatedUrlDoc.shortUrl});
      });

  }
     
});


// USER GETTING REDIRECTED TO URL USING SHORT URL
app.get('/api/shorturl/:shortUrl', (req, res) => {
  userPassedShortUrl = req.params.shortUrl;
  
  // LOOKUP IF SHORTURL ALREADY EXISTS IN THE DB
  ShortUrlMongoModel.findOne({shortUrl: userPassedShortUrl}, (err, foundUrlDocument) => {
    if (err) return console.log(err);
    
    if (foundUrlDocument === null){
      res.json( {"error": "this short url is not in the database."} );
    } else {
    
      // REDIRECT USER TO THE URL MATCHING THE SHORT URL
      res.redirect(foundUrlDocument.originalUrl);
      
      console.log("Redirected user successfully.");
    }
    

  });
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
