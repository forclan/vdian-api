const https = require('https');
/**
 * const values
 */
// 用于获取items地址，在函数generateVdianItemInListURL中有使用
const VDIAN_ITEM_URL = 'https://wd.api.weidian.com/wd/cate/getItemsForBuyer';
// 用于获取店铺所有分类号的地址，在generateVdianListURL中使用
const VDIAN_LIST_URL = 'https://wd.api.weidian.com/wd/cate/getList';

function getAllItemInShop(userID) {
  var promise = new Promise((resolve, reject) => {
    let result = [];
    const listsInShop = getListsInShop(userID)
      .then(listArray => {
        let len = listArray.length;
        let promiseContainer = [];
        listArray.map(list => {
          var itemsInList =  getItemsInList(userID, list.cate_id, list.cate_item_num)
            .then(val => {
              val.cateInfo = list;
              return val;
            })
          promiseContainer.push(itemsInList);
          // return itemsInList;
        });
        Promise.all(promiseContainer).then(resolve).catch(reject);
      })
  })
  return promise;
}

getAllItemInShop(1686060).then(console.log);
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

/**
 * 返回一个用于获取List中包含Item信息的URL
 * @param  {int} userID        店家的ID
 * @param  {int} listNum       店家的分类号（List号）
 * @param  {int} itemNumInList 该分类下的item数目，默认值为10
 * @return {string}               一个URL地址，返回值为分类下的item地址
 */
function generateVdianItemInListURL(userID, listNum, itemNumInList) {
  return generateCommodityURL(VDIAN_ITEM_URL, userID, listNum, 0, itemNumInList);
}

/**
 * 生成一个用于获取店铺下所有分类的URL地址
 * @param  {int} userID 店铺的ID（店家的ID）
 * @return {string}        用于获取所有分类号的URL地址
 */
function generateVdianListURL(userID) {
  return generateCommodityURL(VDIAN_LIST_URL, userID);
}

/**
 * 生成一个用于获取item详细信息的URL地址
 * @param  {int} itemID 想要获取的item号
 * @return {string}        item的URL地址
 */
function generateVdianItemURL(itemID) {
  return 'https://weidian.com/item.html?itemID=' + itemID + '&p=-1';
}
/**
 * test URLs
 */

const itemsInListTestString = 'https://wd.api.weidian.com/wd/cate/getItemsForBuyer?param={"userID":"1686060","cate_id":"72843023","limitStart":0,"limitNum":70}';
const itemDetailTestURL = generateVdianItemURL(1848302313);

/**
 * 用于发起https请求，并将结果保持在Promise中
 * @param  {string} requestOptions 请求的URL地址
 * @return {Promise}                包含有请求结果的Promise对象
 */
function httpsRequest(requestOptions) {
  var promise = new Promise((resolve, rejece) => {
    var results = '';
    var req = https.request(requestOptions, res => {
      res.setEncoding('utf8');
      console.log('https request received, url is' + requestOptions);
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

// const item = 'https://weidian.com/item.html?itemID=1860126149&p=-1';
// var re = httpsRequest(listURL);


function getListsInShop(userID) {
  var requestURL = generateVdianListURL(userID);
  var promise = httpsRequest(requestURL).then(getListInfoFromString);
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

function getItemsInList(userID, listID, itemNum) {
  var requestURL = generateVdianItemInListURL(userID, listID, itemNum);
  // console.log(requestURL);
  var promise = httpsRequest(requestURL)
        .then(extractItemsInListDetail);
  return promise;
}

function extractItemsInListDetail(str) {
  var obj = JSON.parse(str);
  // console.log(obj);
  return obj.result.map(simplifyItemsInfoInList)
}

function simplifyItemsInfoInList(val) {
  return {
    itemID: val.itemID,
    itemDescription: val.itemName,
    itemPrice: val.price,
    itemNumInStock: val.stock,
    itemImg: imgDeleteParam(val.img),
    itemCategory: val.cates
  };
}
function getItemDetailFromURL(itemID) {
  var requestURL = generateVdianItemURL(itemID);
  var promise = httpsRequest(requestURL)
        .then(getItemInfoFromHtmlString)
  return promise;
}

function getItemInfoFromHtmlString(htmlInString) {
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
  return itemSimpleInfo;
}

// 用于将服务器上获取的item详细信息进行简化，删除不需要的键值
function simplifItemInfo(itemInfo) {
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

function imgDeleteParam(URL) {
  const URLReg = /https:\/\/[\w\.\-\/]*/ig;
  return URL.match(URLReg)[0];
}

module.exports = {
  getItemDetail: getItemDetailFromURL,
  getListsInShop: getListsInShop,
  getItemsInList: getItemsInList,
};
