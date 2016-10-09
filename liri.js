var keys = require('./keys.js');
var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request')
var fs = require('fs');

function runLiri (command, searchTerm) {

    if (command === 'my-tweets') {
        var client = new twitter (keys.twitterKeys);
        var screenName = searchTerm;
        if (screenName == undefined) {
            screenName = 'NatGeo';
        }
        var params = {screen_name: screenName, count: 20};
        client.get('statuses/user_timeline', params, function(err, tweets, response) {
            if ( err ) {
                return console.log( err );
            } 

            var output = '';
            for (i = 0; i < tweets.length; i++) {
                output += (tweets[i].created_at + '\n'  + tweets[i].text + '\n\n');
            }

            console.log(output);
        });

    } else if (command === 'spotify-this-song') {
        var songName = searchTerm;
        if (songName == undefined) {
            songName = 'The Sign';
        }
        spotify.search({ type: 'track', query: songName }, function(err, data) {
            if ( err ) {
                return console.log( err );
            }
           
            var itemsArray = data.tracks.items; 
            var songFound = false;
            var i = 0;
            var item;

            while (!songFound && (i < itemsArray.length)) {
                if (itemsArray[i].name.toLowerCase() == songName.toLowerCase()) {
                    item = itemsArray[i];
                    songFound = true;
                }
                i++;
            }

            var artistsArray = item.artists;
            var artistsString = '';
            for (var i = 0; i < artistsArray.length; i++) {
                artistsString += item.artists[i].name + ' ';
            }

            console.log('Artist(s): ' + artistsString);
            console.log('Song name: ' + item.name);
            console.log('Preview: ' + item.preview_url);
            console.log('Album: ' + item.album.name);
    });

    } else if (command === 'movie-this') {
        var movieName = searchTerm;
        if (movieName == undefined) {
            movieName = 'Mr. Nobody';
        }
        var queryUrl = 'http://www.omdbapi.com/?t=' + movieName +'&y=&plot=short&tomatoes=true&r=json';
        request(queryUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) { 
                var movieData = JSON.parse(body);
                console.log ('Title: ' + movieData.Title);
                console.log('Year: ' + movieData.Year);
                console.log('Rating: ' + movieData.Rated);
                console.log('Country: ' + movieData.Country);
                console.log('Language: ' + movieData.Language);
                console.log('Plot: ' + movieData.Plot);
                console.log('Actors: ' + movieData.Actors);
                console.log('Rotten Tomatoes Rating: ' + movieData.tomatoRating);
                console.log('Rotten Tomatoes URL: ' + movieData.tomatoURL);
            }

        });

    }
}

if (process.argv[2] === 'do-what-it-says') {
    fs.readFile('random.txt', 'utf8', function (err, data) {
        if(err) {
            return console.log(err);
        }
        var dataArray = data.split(',');
        console.log(dataArray);
        runLiri(dataArray[0], dataArray[1]);
    })
} else {
    runLiri(process.argv[2], process.argv[3]);
}