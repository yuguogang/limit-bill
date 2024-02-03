const Web3 = require('@artela/web3');
// 连接到你的以太坊节点
const fs = require("fs");
const configJson = JSON.parse(fs.readFileSync('./project.config.json', "utf-8").toString());
const web3 = new Web3(configJson.node);
// 合约地址和 ABI
const contractAddress = '0xE97E4f4bF4E698cA316aab4353Eb6C2AcC0be8AC';
const contractAbi = [
  // 合约 ABI 信息，需要替换成你的 ABI
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "pool",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint160",
            "name": "sqrtPriceLimitX96",
            "type": "uint160"
          },
          {
            "internalType": "bool",
            "name": "zeroForOne",
            "type": "bool"
          }
        ],
        "internalType": "struct UniswapV3Quoter.QuoteParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "quote",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "internalType": "uint160",
        "name": "sqrtPriceX96After",
        "type": "uint160"
      },
      {
        "internalType": "int24",
        "name": "tickAfter",
        "type": "int24"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 添加其他函数的 ABI 信息...
];

// 创建合约实例
const contract = new web3.eth.Contract(contractAbi, contractAddress);

// 调用 quote 函数
const callQuote = async () => {
  try {
    const calldata = contract.methods
    .quote({
      pool: '0xe40897Ec3d45486EFd5E2722a40f50C20628eeda',
      amountIn: '100000000000000000',
      sqrtPriceLimitX96: '0',
      zeroForOne: true,
    })
    .encodeABI();
    console.log("calldata:" ,calldata);
    const result = await contract.methods
      .quote({
        pool: '0xe40897Ec3d45486EFd5E2722a40f50C20628eeda',
        amountIn: '100000000000000000',
        sqrtPriceLimitX96: '0',
        zeroForOne: true,
      }
      )
      .call();

    console.log('Amount Out:', result.amountOut);
    console.log('Sqrt Price X96 After:', result.sqrtPriceX96After);
    console.log('Tick After:', result.tickAfter);
  } catch (error) {
    console.error('Error calling quote:', error.message);
  }
};

// 执行调用
callQuote();


// 0x482a3dc6000000000000000000000000e40897ec3d45486efd5e2722a40f50c20628eeda000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001
// 0x482a3dc6000000000000000000000000e40897ec3d45486efd5e2722a40f50c20628eeda000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001

// $ params='{"from":"0x21b167c217a41fb8cc8504af134ace904ee4f739","to":"0xE97E4f4bF4E698cA316aab4353Eb6C2AcC0be8AC","data":"0x482a3dc6000000000000000000000000e40897ec3d45486efd5e2722a40f50c20628eeda000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"}'
// $ curl -X POST -H 'Content-Type: application/json' \
//   --data '{"id":1,"jsonrpc":"2.0","method":"eth_call","params":['"$params"',"latest"]}' \
//   https://betanet-rpc1.artela.network
// {"jsonrpc":"2.0","id":1,"result":"0x00000000000000000000000000000000000000000000001af42db18bc885969e0000000000000000000000000000000000000046597d721e21a8bcc997d4afca0000000000000000000000000000000000000000000000000000000000014c51"}