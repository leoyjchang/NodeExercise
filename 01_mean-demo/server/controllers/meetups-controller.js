var Meetup = require('../models/meetup');

module.exports.create = function (req, res) {
    var meetup = new Meetup(req.body);
    meetup.save(function (err, result) {
        res.json(result);
    });
//    console.log(req.body);
}

module.exports.list = function (req, res) {
    Meetup.find({}, function (err, results) {
        res.json(results);
    });
}