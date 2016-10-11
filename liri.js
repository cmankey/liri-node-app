var keys = require('./keys.js');
var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request')
var fs = require('fs');

function logAndWrite(output) {
    console.log(output);
    fs.appendFile('log.txt', output, function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

function tweets(screenName) {
    var client = new twitter (keys.twitterKeys);
    if (screenName == undefined) {
        screenName = 'NatGeo';
    }
    var params = {screen_name: screenName, count: 20};
    client.get('statuses/user_timeline', params, function(err, tweets, response) {
        if ( err ) {
            return console.log( err );
        } 
        var output = '';
        for ( var i = 0; i < tweets.length; i++ ) {
            output += (tweets[i].created_at + '\n'  + tweets[i].text + '\n\n');
        }
        logAndWrite(output);
    });
}

function songInfo(songName) {
    if ( songName == undefined ) {
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
        while ( !songFound && (i < itemsArray.length) ) {
            if (itemsArray[i].name.toLowerCase() == songName.toLowerCase()) {
                item = itemsArray[i];
                songFound = true;
            }
            i++;
        }
        var artistsArray = [];
        for (var i = 0; i < item.artists.length; i++) {
            artistsArray.push(item.artists[i].name);
        }
        var artists = artistsArray.join(', ')
        var output =
            'Artist(s): ' + artists +
            '\nSong name: ' + item.name +
            '\nPreview: ' + item.preview_url +
            '\nAlbum: ' + item.album.name + '\n\n';
        logAndWrite(output);
    });
}

function movieInfo(movieName) {
    if ( movieName == undefined ) {
        movieName = 'Mr. Nobody';
    }
    var queryUrl = 'http://www.omdbapi.com/?t=' + movieName +'&y=&plot=short&tomatoes=true&r=json';
    request(queryUrl, function (error, response, body) {
        if ( !error && response.statusCode == 200 ) { 
            var movieData = JSON.parse(body);
            var output =
                'Title: ' + movieData.Title +
                '\nYear: ' + movieData.Year +
                '\nRating: ' + movieData.Rated +
                '\nCountry: ' + movieData.Country +
                '\nLanguage: ' + movieData.Language +
                '\nPlot: ' + movieData.Plot +
                '\nActors: ' + movieData.Actors +
                '\nRotten Tomatoes Rating: ' + movieData.tomatoRating +
                '\nRotten Tomatoes URL: ' + movieData.tomatoURL + '\n\n';
            logAndWrite(output);
        }
    });
}

function runLiri (command, searchTerm) {
    switch ( command ) {
        case 'my-tweets':
            tweets(searchTerm);
            break;
        case 'spotify-this-song':
            songInfo(searchTerm);
            break;
        case 'movie-this':
            movieInfo(searchTerm);
            break;
        case 'do-what-it-says':
            fs.readFile('random.txt', 'utf8', function (err, data) {
                if( err ) {
                    return console.log(err);
                }
                var dataArray = data.split(',');
                var command = dataArray[0];
                var searchTerm = dataArray[1];
                if ((searchTerm.charAt(0) === "'" && searchTerm.charAt(searchTerm.length-1) === "'") || (searchTerm.charAt(0) === '"' && searchTerm.charAt(searchTerm.length-1) === '"')) {
                    console.log('ran if');
                    searchTerm = searchTerm.slice(1, searchTerm.length - 1);
                }
                console.log(dataArray);
                console.log(command, searchTerm);
                runLiri(command, searchTerm);
            });

            break;
        default:
            console.log('I don\'t recognize that command.')
    }
}

runLiri(process.argv[2], process.argv[3]);