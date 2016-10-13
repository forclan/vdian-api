var jsdom = require('jsdom');
var request = require('./https');
var fs = require('fs');
var jquery = fs.readFileSync('./node_modules/jquery/dist/jquery.min.js', 'utf-8');

// console.log(jquery);
// jsdom.env('https://www.baidu.com/', ["http://code.jquery.com/jquery.js"], (err, window) => {
    // console.log(window.$('body')[0]);
// })
const item = 'https://weidian.com/item.html?itemID=1860126149';
const item2 = 'https://weidian.com/item.html?itemID=1860126149&p=-1';
    jsdom.env({
    url: item2,
    src: [jquery],
    done: (err, window) => {
        var re = window.$('itemSliderBox');
        // console.log(JSON.stringify(re));
        var str = re.map(val => val.innerHTML);
        console.log(JSON.stringify(str));
        console.log(window.$('#detail_wrap')[0]);
    }
})

// jsdom.env(
//   "https://iojs.org/dist/",
//   ["http://code.jquery.com/jquery.js"],
//   function (err, window) {
//     console.log("there have been", window.$("a").length - 4, "io.js releases!");
//      console.log(window.$('body')[0]);
//   }
// );
