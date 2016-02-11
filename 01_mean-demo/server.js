var express           = require('express'),
    app               = express(),
    bodyParser        = require('body-parser'),
    mongoose          = require('mongoose'),
    meetupsController = require('./server/controllers/meetups-controller');
    
mongoose.connect('mongodb://localhost:27017/mean-demo');    

app.use(bodyParser());

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client/views/index.html');
});

//Mounts the middleware function(s) at the path. If path is not specified, it defaults to “/”.
//The only built-in middleware function in Express is express.static. This function is based on serve-static, and is responsible for serving the static assets of an Express application.
//The root argument specifies the root directory from which to serve static assets.
app.use('/js', express.static(__dirname + '/client/js'));

//REST API
app.get('/api/meetups', meetupsController.list);
app.post('/api/meetups', meetupsController.create);

app.listen(3000, function() {
    console.log('I\'m Listening...');
})