"use strict"

//todo modify it

const Web3 = require('@artela/web3');
const fs = require("fs");
const { numberToHex } = require("@artela/web3-utils");
const BigNumber = require('bignumber.js');
const configJson = JSON.parse(fs.readFileSync('./project.config.json', "utf-8").toString());
const web3 = new Web3(configJson.node);
const sk = fs.readFileSync("privateKey.txt", 'utf-8');
const account = web3.eth.accounts.privateKeyToAccount(sk.trim());
// let nonce = await web3.eth.getTransactionCount(account.address);
const aspectCore = web3.atl.aspectCore();
const aspectAddress = '0xd522a20EC4ccaC92986957dBF13712154a715987';
const aspect = new web3.atl.Aspect(aspectAddress);
const factoryABI = JSON.parse(fs.readFileSync('./tests/jit-aa-abi/AspectEnabledSimpleAccountFactory.abi', "utf-8"));
const factoryAddress = "0x7b20970624Cd01582Cd01385B67B969446AC5110";

function rmPrefix(data) {
    if (data.startsWith('0x')) {
        return data.substring(2, data.length);
    } else {
        return data;
    }
}
async function f() {
    
    console.log('start running params');
    
    await addLmtBill(0.03,4978,0);
    await addLmtBill(0.04,4978,0);
    await addLmtBill(0.05,4978,0);
    console.log(await getLmtBills());
    await removeLmtBill(2);
    console.log(await getLmtBills());
}
const addLmtBill = async (amount, price, buyOrSell) => {
    console.log(`add limit bill`);
   let op = "0x0002";
   let params = rmPrefix(packLbParams(amount,price,buyOrSell));
   let calldata = aspect.operation(op + params).encodeABI();
   const chainId = await web3.eth.getChainId();
   const gasPrice = await web3.eth.getGasPrice();
   let nonce = await web3.eth.getTransactionCount(account.address);
   let tx = {
       from: account.address,
       nonce: nonce++,
       gasPrice,
       gas: 8000000,
       data: calldata,
       to: aspectCore.options.address,
       chainId
   }

   let signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
   let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
const removeLmtBill = async (index) => {
    console.log(`remove limit bill in index `+ index);
    let op = "0x0003";
    let params = rmPrefix(index.toString(16).padStart(4,'0'));
   console.log("op: ", op);
   console.log("params: ", params);
   const chainId = await web3.eth.getChainId();
   const gasPrice = await web3.eth.getGasPrice();
   let calldata = aspect.operation(op + params).encodeABI();
   let nonce = await web3.eth.getTransactionCount(account.address);
   let tx = {
       from: account.address,
       nonce: nonce++,
       gasPrice,
       gas: 8000000,
       data: calldata,
       to: aspectCore.options.address,
       chainId
   }

   let signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
   let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

   console.log('remove limit bill result: sucess');
   console.log(receipt)
}
const getLmtBills = async () => {
    let op = "0x1002";
    let params = "";
    let calldata = aspect.operation(op + params).encodeABI();
    console.log("op: ", op);
    console.log("params: ", params);
    let ret = await web3.eth.call({
        to: aspectCore.options.address, // contract address
        data: calldata
    });
    console.log("ret",ret);
    let decodedRet = web3.eth.abi.decodeParameter('string', ret);
    console.log("decodedRet",decodedRet);
    if(decodedRet.length > 0) {
        const lbm = parseInt(decodedRet.substring(0, 4), 16);
        console.log("limit bill number:", lbm);
        const resArray = parseLbData(decodedRet.substring(4));
        return resArray;
    }
}

const packLbParams = (amount, price, buyOrSell) => {
    const l_price = new BigNumber(price);
    const amount_towei = amount * 10 ** 18;
    const param_amount = amount_towei.toString(16).padStart(64, '0'); 
    const sqrtPriceLimitX96 = l_price.squareRoot().times(new BigNumber(2).pow(96));
    const uint160Value = sqrtPriceLimitX96.mod(new BigNumber(2).pow(160)).integerValue(BigNumber.ROUND_FLOOR);
    const param_sqrtPriceLimitX96 = uint160Value.toString(16).padStart(40, '0');
    const param_buyOrSell = buyOrSell.toString(16).padStart(2, '0');
    const params = param_amount + param_sqrtPriceLimitX96 + param_buyOrSell;
    return params;
};

const parseLbData=(data)=> {
    const result = [];
  
    while (data.length >= 106) {
      const uint256Amount = parseInt(data.substring(0, 64), 16);
      const uint160ValueB = new BigNumber(data.substring(64, 104), 16).div(new BigNumber(2).pow(96));
      const price=uint160ValueB.times(uint160ValueB).toString();
      const buyOrSell = parseInt(data.substring(104, 106), 16);
  
      result.push({
        uint256Amount,
        price,
        buyOrSell,
      });
  
      // 剩余数据
      data = data.substring(106);
    }
  
    return result;
}

f().then();