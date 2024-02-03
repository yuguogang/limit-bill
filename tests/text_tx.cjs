"use strict"

//todo modify it

const Web3 = require('@artela/web3');
const fs = require("fs");
const { numberToHex } = require("@artela/web3-utils");
const BigNumber = require('bignumber.js');

// const contractBin = fs.readFileSync('./contracts/build/contract/Royale.bin', "utf-8");
const abi = JSON.parse(fs.readFileSync('./contracts/Manager.json', "utf-8"));
const contractAddress = "0x7452F4B21a85E9e3590c68982E92A150108faefE";
// const contractABI = JSON.parse(abi);
// const EthereumTx = require('ethereumjs-tx').Transaction;

const walletABI = JSON.parse(fs.readFileSync('./tests/jit-aa-abi/AspectEnabledSimpleAccount.abi', "utf-8"));
const factoryABI = JSON.parse(fs.readFileSync('./tests/jit-aa-abi/AspectEnabledSimpleAccountFactory.abi', "utf-8"));
const factoryAddress = "0x7b20970624Cd01582Cd01385B67B969446AC5110";

// const demoContractOptions = {
//     data: contractBin
// };
function rmPrefix(data) {
    if (data.startsWith('0x')) {
        return data.substring(2, data.length);
    } else {
        return data;
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
    const params = '0x'+param_amount + param_sqrtPriceLimitX96 + param_buyOrSell;
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
// function getOriginalV(hexV, chainId_) {
//     const v = new BigNumber(hexV, 16);
//     const chainId = new BigNumber(chainId_);
//     const chainIdMul = chainId.multipliedBy(2);

//     const originalV = v.minus(chainIdMul).minus(8);

//     const originalVHex = originalV.toString(16);

//     return originalVHex;
// }

async function f() {
    console.log('start running demo');

    // ******************************************
    // init web3 and private key
    // ******************************************
    const configJson = JSON.parse(fs.readFileSync('./project.config.json', "utf-8").toString());
    const web3 = new Web3(configJson.node);

    let sk = fs.readFileSync("privateKey.txt", 'utf-8');
    const account = web3.eth.accounts.privateKeyToAccount(sk.trim());
    web3.eth.accounts.wallet.add(account.privateKey);

    let gasPrice = await web3.eth.getGasPrice();
    let chainId = await web3.eth.getChainId();
    let nonce = await web3.eth.getTransactionCount(account.address);
    let aspectCore = web3.atl.aspectCore();


    let factoryConract = new web3.eth.Contract(factoryABI, factoryAddress)
    // ******************************************
    // prepare 1. load swap Maganer contract
    // ******************************************
    let contract = new web3.eth.Contract(abi, contractAddress);
    
    // ******************************************
    // prepare 2. deploy aspect
    // ******************************************

    // load aspect code and deploy
    let aspectCode = fs.readFileSync('./build/release.wasm', {
        encoding: "hex"
    });

    // instantiate an instance of aspect
    let aspect = new web3.atl.Aspect();
    let aspectDeployData = aspect.deploy({
        data: '0x' + aspectCode,
        properties: [],
        joinPoints:["PostContractCall"],
        paymaster: account.address,
        proof: '0x0'
    }).encodeABI();

    let tx = {
        from: account.address,
        nonce: nonce++,
        gasPrice,
        gas: 4000000,
        to: aspectCore.options.address,
        data: aspectDeployData,
        chainId
    }

    console.log('signed Aspect deploy Tx');
    let signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
    console.log('send Aspect deploy Tx');
    let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    aspect.options.address = receipt.aspectAddress;
    console.log('aspect address is: ', aspect.options.address);

    // ******************************************
    // prepare 3. binding contract to aspect
    // ******************************************

    // console.log(`binding contract`);
    // // binding with smart contract
    // let contractBindingData = await contract.bind({
    //     priority: 1,
    //     aspectId: aspect.options.address,
    //     aspectVersion: 1,
    // }).encodeABI();

    // tx = {
    //     from: account.address,
    //     nonce: nonce++,
    //     gasPrice,
    //     gas: 4000000,
    //     data: contractBindingData,
    //     to: aspectCore.options.address,
    //     chainId
    // }

    // signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
    // receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    // console.log(`binding contract result:`);
    // console.log(receipt);

    // ******************************************
    // prepare 4. create jit AA
    // ******************************************
    
        await factoryConract.methods.createAccount(account.address, nonce + 1).send({
            from: account.address,
            gas: 4000000,
            gasPrice: gasPrice,
            nonce: nonce++
        }).on('transactionHash', (txHash) => {
            console.log('aa wallet create tx: ', txHash);
        }).on('receipt', function (receipt) {
            console.log('aa wallet create receipt: ', receipt);
        }).on('error', function (error) {
            console.log('aa wallet create error: ', error);
        });

        let walletAddr = await factoryConract.methods.getAddress(account.address, nonce).call();
        console.log('wallet address: ', walletAddr);
        let walletContract = new web3.eth.Contract(walletABI, walletAddr);

        console.log('tranfer balance to aa');
        let amount = 0.001;
        tx = {
            from: account.address,
            nonce: nonce++,
            gasPrice,
            gas: 210000,
            value: web3.utils.toWei(amount.toString(), 'ether'),
            to: walletAddr,
            chainId
        }

        signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
        receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log('tranfer balance to aa success');
        console.log(receipt)

        // ******************************************
        // step 1. approve aa to aspect
        // ******************************************

        await walletContract.methods.approveAspects([aspect.options.address]).send({
            from: account.address,
            gas: 20000000,
            gasPrice: gasPrice,
            nonce: nonce++
        }).on('transactionHash', (txHash) => {
            console.log('aa wallet approve aspect tx: ', txHash);
        }).on('receipt', function (receipt) {
            console.log('aa wallet approve aspect receipt: ', receipt);
        }).on('error', function (error) {
            console.log('aa wallet approve aspect error: ', error);
        });

        // ******************************************
        // step 2. register sys player
        // ******************************************

        let op = "0x0001";
        let params = rmPrefix(walletAddr);

        console.log("op: ", op);
        console.log("params: ", params);

        let calldata = aspect.operation(op + params).encodeABI();

        tx = {
            from: account.address,
            nonce: nonce++,
            gasPrice,
            gas: 8000000,
            data: calldata,
            to: aspectCore.options.address,
            chainId
        }

        signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
        receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log('register sys player result: sucess');
        console.log(receipt)

        op = "0x1001";
        params = "";
        calldata = aspect.operation(op + params).encodeABI();

        console.log("op: ", op);
        console.log("params: ", params);

        let ret = await web3.eth.call({
            to: aspectCore.options.address, // contract address
            data: calldata
        });

        console.log("ret ", ret);
        console.log("get sys player ret  ", web3.eth.abi.decodeParameter('string', ret));
       
    
    // ******************************************
    // step 3. call add limit bill
    // ******************************************
     console.log(`add limit bill`);
     op = "0x0002";
     //a limit bill composed by amount uint256,price square and div 2^96 uint160, buyOrSell bool
    //  params = rmPrefix("0x00000000000000000000000000000000000000000000000000000000000000AA000000000000000000000000000000000000000B01");

    console.log("op: ", op);
    params = rmPrefix(packLbParams(0.01,4884,1));
    console.log("params: ", params);

    calldata = aspect.operation(op + params).encodeABI();

    tx = {
        from: account.address,
        nonce: nonce++,
        gasPrice,
        gas: 124000000,
        data: calldata,
        to: aspectCore.options.address,
        chainId
    }

    signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
    receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log('add limit bill result: sucess');
    console.log(receipt)

    op = "0x1002";
    params = "";
    calldata = aspect.operation(op + params).encodeABI();

    console.log("op: ", op);
    console.log("params: ", params);

    ret = await web3.eth.call({
        to: aspectCore.options.address, // contract address
        data: calldata
    });
    
    console.log("ret ", ret);
    let decodedRet = web3.eth.abi.decodeParameter('string', ret);
    if(decodedRet.length > 0) {
        const lbm = parseInt(decodedRet.substring(0, 4), 16);
        console.log("limit bill number:", lbm);
        const resArray = parseLbData(decodedRet.substring(4));
        console.log(resArray);
    }
    console.log(`retrieve limit bills`);


    console.log(`remove limit bill in index 1`);
    op = "0x0003";
    params = rmPrefix("0x0001");

   console.log("op: ", op);
   console.log("params: ", params);

   calldata = aspect.operation(op + params).encodeABI();

   tx = {
       from: account.address,
       nonce: nonce++,
       gasPrice,
       gas: 124000000,
       data: calldata,
       to: aspectCore.options.address,
       chainId
   }

   signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
   receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

   console.log('remove limit bill result: sucess');
   console.log(receipt)


   op = "0x1002";
   params = "";
   calldata = aspect.operation(op + params).encodeABI();

   console.log("op: ", op);
   console.log("params: ", params);

   ret = await web3.eth.call({
       to: aspectCore.options.address, // contract address
       data: calldata
   });

    decodedRet = web3.eth.abi.decodeParameter('string', ret);
   if(decodedRet.length > 0) {
       const lbm = parseInt(decodedRet.substring(0, 4), 16);
       console.log("limit bill number:", lbm);
       const resArray = parseLbData(decodedRet.substring(4));
       console.log(resArray);
   }
   console.log(`retrieve limit bills`);


   op = "0x1003";
   params = "";
   calldata = aspect.operation(op + params).encodeABI();

   console.log("op: ", op);
   console.log("params: ", params);

   ret = await web3.eth.call({
       to: aspectCore.options.address, // contract address
       data: calldata
   });
    console.log(ret);
    decodedRet = web3.eth.abi.decodeParameter('string', ret);
    console.log( decodedRet);
    // const decimalValue = parseInt(decodedRet, 16);
    // console.log(decimalValue/10**18);
    console.log(`quote success`);

   
//    ret = await web3.eth.call({
//        to: aspectCore.options.address, // contract address
//        data: calldata
//    });
//    console.log("quote ret :",ret);
//    decodedRet = web3.eth.abi.decodeParameter('string', ret);
//    console.log(decodedRet);
//    console.log(`retrieve quote`);

    // ******************************************
    // step 4. call contract
    // ******************************************

    // call fisrt, if success then send tx
    // let calldata = contract.methods.move(1, 2).encodeABI();
    // tx = {
    //     from: account.address,
    //     data: calldata,
    //     to: contract.options.address,
    //     gas: 20000000,
    // }

    // console.log("call move : ", tx);
    // let ret = await web3.eth.call(tx);
    // console.log("ret ", ret);

    // // send tx
    // await contract.methods.move(1, 2).send({
    //     from: account.address,
    //     gas: 20000000,
    //     gasPrice: gasPrice,
    //     nonce: nonce++
    // }).on('transactionHash', (txHash) => {
    //     console.log('move tx: ', txHash);
    // }).on('receipt', function (receipt) {
    //     console.log('move receipt: ', receipt);
    // }).on('error', function (error) {
    //     console.log('move error: ', error);
    // });

    // const game = await contract.methods.getGameStatus().call({
    //     from: account.address,
    //     gas: 20000000,
    //     gasPrice: gasPrice,
    // });

    // console.log(game.board);

    console.log(`all test cases pass`);

}

f().then();