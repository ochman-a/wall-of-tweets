const express = require('express');
const path = require('path');

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Twit = require('twit');

let twit = new Twit({
    consumer_key: 'QwHnUXfbGkEAn0Q0vy5GTtCP7',
    consumer_secret: 'WZmWMCGWVEiWFEpdUm5U4UYgSh7cF8vPL2kVzY0aukAFeHef5N',
    access_token: '359847562-Z3Q56EzbMu6GXwGkRefDkI0A9IzavzdKHy8KjGtC',
    access_token_secret: 'SrTuuj2N6SZNET7kbldRRi5lTOqv617biGZGWVuAjOSc3'
});

let allTweets = [];
twit.get('search/tweets', { q: '#startups', count: 30, result_type: 'recent'  }, function(err, data, response) {
    allTweets = data;
});

io.on('connection', function(client) {
    console.log('Client connected...');
    client.emit('allTweets', allTweets);

    client.on('getTweetDetails', function(id) {
        twit.get('statuses/show', { id: id.toString() }, function(err, data, response) {
            client.emit('tweetDetails', data);
        });
    });
});

let stream = twit.stream('statuses/filter', {track: '#startups'});
stream.on('tweet', function(tweet) {
    console.log('New tweet received --> emit it to all clients !');
    io.sockets.emit('newTweet', tweet);
});

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

module.exports = server;
