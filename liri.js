var request = require("request");
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var fs = require("fs");
var keys = require("./keys");

function searchSpotify(args) {
    var spotify = new Spotify(keys.spotifyKeys);
    var queryString = "";
    if (args.length > 0) {
        args.forEach(function (arg) {
            queryString += arg + "%20";
        })
    } else {
        queryString = "The%20Sign%20Ace";
    }


    spotify.search({ type: 'track', query: queryString, limit: 1 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var track = data.tracks.items[0];
        var artists = "";

        track.artists.forEach(function (artistObj) {
            artists += artistObj.name + ", ";
        })

        console.log("  ");
        console.log("Song: " + track.name);
        console.log("  ");
        console.log("Album: " + track.album.name);
        console.log("  ");
        console.log("Artist(s): " + artists.slice(0, -2));
        console.log("  ");
        console.log("Preview: " + track.preview_url);

    });
}

function searchOmdb(args) {
    var movieName = "";
    if (args.length > 0) {
        args.forEach(function (arg) {
            movieName += arg + "+";
        })
    } else {
        console.log("no movie provided");
        movieName = "Mr.+Nobody";
    }


    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=40e9cece";
    console.log(queryUrl);

    request(queryUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var responseBody = JSON.parse(body)

            var rottenTomatoesRating = "";

            responseBody.Ratings.forEach(function (rating) {
                if (rating.Source === "Rotten Tomatoes") {
                    rottenTomatoesRating = rating.Value;
                }
            })

            console.log("  ");
            console.log("Title: " + responseBody.Title);
            console.log("  ");
            console.log("Year: " + responseBody.Year);
            console.log("  ");
            console.log("IMDB Rating: " + responseBody.imdbRating);
            console.log("  ");
            console.log("Rotten Tomatoes Rating: " + rottenTomatoesRating);
            console.log("  ");
            console.log("Country: " + responseBody.Country);
            console.log("  ");
            console.log("Language: " + responseBody.Language);
            console.log("  ");
            console.log("Plot: " + responseBody.Plot);
            console.log("  ");
            console.log("Actors: " + responseBody.Actors);
            console.log("  ");
        }
    });
}

function getTweets() {
    var twitter = new Twitter(keys.twitterKeys);
    twitter.get('statuses/user_timeline', function (error, tweets, response) {
        if (!error) {
            tweets.forEach(function (tweet) {
                console.log("++++++++++");
                console.log("  ");
                console.log(tweet.text);
                console.log("  ");
                console.log(tweet.created_at);
                console.log("  ");
            });

        }
    });
}

function logger(option, args) {
    var inputs = "";
    args.forEach(function (arg) {
        inputs += arg + " ";
    })
    var command = option + " " + inputs;
    console.log(command);
    fs.appendFile("log.txt", ", " + command, function (error) {
        console.log(error);
    });
}

function handleInput(option, args) {
    logger(option, args)
    if (option === 'my-tweets') {
        getTweets();
    } else if (option === 'spotify-this-song') {
        searchSpotify(args);
    } else if (option === 'movie-this') {
        searchOmdb(args);
    } else if (option === "do-what-it-says") {
        fs.readFile("random.txt", "utf8", function (error, data) {
            if (error) {
                return console.log(error);
            }
            var args = [];
            var searchParam = data.substring(data.indexOf(",") + 1).trim().slice(1, -1);
            args = searchParam.split(" ");
            handleInput(data.substring(0, data.indexOf(",")), args);
        });
    } else {
        console.log("Command not recognized");
    }
}

var params = [];

for (var i = 3; i < process.argv.length; i++) {
    params.push(process.argv[i]);
}


handleInput(process.argv[2], params);