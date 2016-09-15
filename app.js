const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const config = require('./configFiles');
const URLShortModel = require('./models/urlShortModel');

mongoose.connect(config.getDBConnection());

app.get('/', (req, res) => {
    res.send(`
    <h1>FCC-URLShortener-API</h1>
    <h4>Example usage:</h4>
    <p>https://fcc-time-api.herokuapp.com/www.facebook.com</p>
    <p>https://fcc-time-api.herokuapp.com/f348</p>
    <br />
    <h4>Result:</h4>
    <p>{ "original": "https://fcc-time-api.herokuapp.com/www.facebook.com", "shortened": "https://fcc-time-api.herokuapp.com/f348" }</p>`
    );
});

app.get('/:url', (req, res) => {
    
    var url = req.params.url;
    const output = {};
    
    if (isValidURL(url)) {
        //fill with www. if not with www.
        if (!url.startsWith('www.')) {
            url = 'www.' + url;
        }
        
        //create hash of url
        const md5sum = crypto.createHash('md5');
        const hash = md5sum.update(url).digest('hex').substring(0, 4);
        
        //check if hash is already in database
        URLShortModel.find({ original : url }, (err, respond) => {
            if (err) console.log(err);
            
            if (respond.length === 0) {
                //if not, create new entry
                const newURLShort = URLShortModel( {
                    original : url,
                    shortened : hash 
                });
                
                newURLShort.save((err, respond) => {
                   if (err) throw err;
                   
                   output.original = newURLShort.original;
                   output.shortended = newURLShort.shortened;
                   
                   res.send(output);
                   res.end();
                });
                //if already there, return the shortended version of the url
            } else {
                output.original = respond[0].original;
                output.shortended = respond[0].shortened;
    
                res.send(output);
                res.end();
            }
        });
        
        //output json of original and shortened url
    } else {
        //open the wepage that was shortened
        URLShortModel.find({ shortened : url }, (err, respond) => {
            if (err) console.log('No such Shortcode');
            
            if (respond.length > 0) {
                const  originalURL = respond[0].original;
                
                res.statusCode = 302;
                res.setHeader('Location', 'https://' + originalURL);
                res.end();
            } else {
                 //return Json with error: "Nothing found"
                output.error = 'Nothing found'
                
                res.send(output);
                res.end();
            }
        });
    }
});

function isValidURL (url) {
    const pattern = /^www\.|.[A-Za-z0-9-_]+\.[a-zA-z]{2,4}[/]?$/
    return pattern.test(url);
}

app.listen(process.env.PORT || 3000);