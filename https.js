const https = require('https');
var request = require('./https');


// const values
const VDIAN_ITEM_URL = 'https://wd.api.weidian.com/wd/cate/getItemsForBuyer';
const VDIAN_LIST_URL = 'https://wd.api.weidian.com/wd/cate/getList';

// 用于获取List分类下所有的商品信息
function generateCommodityURL(URL, userID, typeNum, start = 0, needNum = 10) {
  var param = {
    userID,
    cate_id: typeNum,
    limitStart: start,
    limitNum: needNum
  };
  const httpReg = /https:\/\//i;
  if (!httpReg.test(URL)) URL = 'https://' + URL;
  return URL + '?param=' + JSON.stringify(param);
}

const generateVdianItemInListURL = (userID, listNum, itemNumInList) => generateCommodityURL(VDIAN_ITEM_URL, userID, listNum, 0, itemNumInList);
// const generateVdianCommodityURL = (userID, typeNum) => generateCommodityURL(VDIAN_ITEM_URL, userID, typeNum);
const generateVdianListURL = userID => generateCommodityURL(VDIAN_LIST_URL, userID);
const generateVdianItemURL = itemID => 'https://weidian.com/item.html?itemID=' + itemID + '&p=-1';


const testString = 'https://wd.api.weidian.com/wd/cate/getItemsForBuyer?param={"userID":"1686060","cate_id":"72843023","limitStart":0,"limitNum":70}';
// const generatedString = generateCommodityURL('wd.api.weidian.com/wd/cate/getItemsForBuyer', 1686060, 72843023);
// const vdianItemsURL = generateVdianCommodityURL(1686060, 72843023);
// const listURL = generateVdianListURL(1686060);
const itemURL = generateVdianItemURL(1848302313);

function httpsRequest(requestOptions) {
  var promise = new Promise((resolve, rejece) => {
    var results = '';
    var req = https.request(requestOptions, res => {
      res.setEncoding('utf8');
      console.log('https request received');
      res.on('data', data => {
        results += data
      });
    })
    req.on('close', _ => resolve(results));
    req.on('end', _ => resolve(results))
    req.end();
    req.on('error', error => rejece(error));
  })
  return promise;
}



const item = 'https://weidian.com/item.html?itemID=1860126149&p=-1';
// var re = httpsRequest(listURL);
getListInShop(1686060).then(console.log);
// re.then(getListInfoFromString).then(console.log)

getItemsInList(1686060, 71527374, 19).then(console.log);
function getListInShop(userID) {
  var requestURL = generateVdianListURL(userID);
  var promise = httpsRequest(requestURL).then(getListInfoFromString);
  return promise;
}

function getItemsInList(userID, listID, itemNum) {
  var requestURL = generateVdianItemInListURL(userID, listID, itemNum);
  var promise = httpsRequest(requestURL);
  return promise;
}

function getListInfoFromString(str) {
  var obj = JSON.parse(str);
  var obj = obj.result;
  var result = obj.map(val => ({
    cate_id: val.cate_id,
    cate_name: val.cate_name,
    cate_item_num: val.cate_item_num,
    description: val.description,
    sort_num: val.sort_num,
  }));
  return result;
}

function getItemInfoFromHtml(htmlInString) {
  // if input is Buffer, transmit it to String;
  htmlInString += '';
  // extrace title
  var itemNameReg = /<title>(.*)<\/title>/i;
  var itemName = htmlInString.match(itemNameReg)[1];
  // 微店的数据是放在最下面的表达式中，将其提取出来
  var itemInfoReg = /(var itemInfo = {[\s\S]*?);/i;
  var itemInfo = htmlInString.match(itemInfoReg)[0];
  // get itemInfo;
  eval(itemInfo);;
  var itemSimpleInfo = simplifItemInfo(itemInfo);
  itemSimpleInfo.itemName = itemName;
  // delete unused information
  // console.log(itemSimpleInfo);
  return itemSimpleInfo;
}

// re.then(val => getItemInfoFromHtml(val)).then(val => console.log(val));

function simplifItemInfo(itemInfo) {
  const URLReg = /https:\/\/[\w\.\-\/]*/ig;
  const imgDeleteParam = URL => {
    return URL.match(URLReg)[0];
  }
  var result = itemInfo.result;
  var obj = {
    itemID: result.itemID,
    itemLogo: imgDeleteParam(result.itemLogo),
    itemDescription: result.itemName,
    itemPrice: result.price,
    remote_area: result.remote_area,
    itemImgs: result.thumbImgs.map(imgDeleteParam),
    itemImgsDescription: result.titles,
    sku: result.sku,
  };
  return obj;
}