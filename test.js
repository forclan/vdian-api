var getItemDetail = require('./https.js').getItemDetail;
var getListsInShop = require('./https.js').getListsInShop;
var getItemsInList = require('./https.js').getItemsInList;
var getAllItemInfo = require('./https.js').getAllItemInfo;
// getListsInShop(1686060).then(console.log);
// getItemsInList(1686060, 71527374, 19).then(console.log);
// getItemDetail(1848302313).then(console.log).catch(console.log)
// getAllItemInfo(1686060).then(console.log).catch(console.log);
getAllItemInfo(1686060).then(val => console.log(val[0]));
