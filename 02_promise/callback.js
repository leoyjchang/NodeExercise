var fs = require('fs');

console.log('---- example of callback-based functions ----');

//Leo: Syntax 1
// fs.readFile('d:/jstest.txt', 'utf8', (err, data) => {
//     if (err) throw err;
//     console.log(data);
// });

//Leo: Syntax 2
fs.readFile('d:/jstest.txt', 'utf8', function (err, data){
    if (err) throw err;
    console.log(data);
});

console.log('Am I invoked first or second?');

console.log('---- example of promised-based functions ----');


function readLine(file, line, callback) {
    fs.readFile(file, function process(err, content) {
        if (err) return callback(err);
        callback(null, content.toString().split('\n')[line]);
    });
}

readLine('d:/jstest.txt', 2, function(err, line) {
    console.log(line);
});

// var fs = require('fs');
// var path = require('path');
 
// var imgPath = path.resolve(process.argv[2]);
// var imgExt = path.extname(imgPath);
// var imgData = fs.readFileSync(imgPath);
// console.log('data:image'+ imgExt.replace('.', '/') +';base64,' + imgData.toString('base64'));
