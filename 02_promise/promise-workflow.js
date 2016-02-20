//Leo: This is just a function declaration
//Leo: When the callback (resolve, reject) get executed?

// function asyncFunction() {
//     return new Promise(function (resolve, reject) {
//         console.log("whether asyncFunction get executed?");
//         setTimeout(function () {
//             resolve('Async Hello world from Leo Zhang');
//         }, 1600);
//     });
// }

//Leo: This is function expression and will be executed immediately
(function(){console.log('I am function expression');})();

asyncFunction().then(function (value) {console.log(value);})

// asyncFunction();

// //Leo: using then ... and catch ... style
// asyncFunction().then(function (value) {
//     console.log(value);
// }).catch(function (error) {
//     console.log(error);
// });
// 
// //Leo: Or can use then (onFulfilled, onRejected) style
// asyncFunction().then(function (value) {
//     console.log(value);
// }, function (error) {
//     console.log(error);
// });

// function asyncFunction() {
//     
//     return new Promise(function (resolve, reject) {
//         setTimeout(function () {
//             resolve('Async Hello world');
//         }, 16);
//     });
// }
// 
// asyncFunction().then(function (value) {
//     console.log(value);    // => 'Async Hello world'
// }).catch(function (error) {
//     console.log(error);
// });