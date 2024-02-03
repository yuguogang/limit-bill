const ethers = require('ethers');

// // 连接到你的以太坊节点
// const privateKey = "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6";
const privateKey = "0x8a178d1129aeb399c801810ef303a10dcd8020207ac956b729beec42b91ec489";
const provider = new ethers.providers.JsonRpcProvider('https://betanet-rpc1.artela.network');
const wallet = new ethers.Wallet(privateKey, provider);
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
const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

// 调用 quote 函数
const callQuote = async () => {
  try {
    // const result = await contract.quote({
    //     pool: '0xe40897Ec3d45486EFd5E2722a40f50C20628eeda',
    //     amountIn: ethers.utils.parseEther('0.1'),
    //     sqrtPriceLimitX96: 0,
    //     zeroForOne: true,
    //   }
    // );

    // console.log('Amount Out:', result.amountOut.toString());
    // console.log('Sqrt Price X96 After:', result.sqrtPriceX96After.toString());
    // console.log('Tick After:', result.tickAfter.toString());


    const result = await contract.quote({
        pool: '0xe40897Ec3d45486EFd5E2722a40f50C20628eeda',
        amountIn: ethers.utils.parseEther('0.1'),
        sqrtPriceLimitX96: 0,
        zeroForOne: true,
      });
  
      if (result && result.amountOut !== undefined && result.sqrtPriceX96After !== undefined && result.tickAfter !== undefined) {
        console.log('Amount Out:', result.amountOut.toString());
        console.log('Sqrt Price X96 After:', result.sqrtPriceX96After.toString());
        console.log('Tick After:', result.tickAfter.toString());
      } else {
        console.error('Invalid result:', result);
      }


  } catch (error) {
    console.error('Error calling quote:', error.message);
  }
};

// 执行调用
callQuote();

// const ethers = require('ethers');

// // 连接到你的以太坊节点
// const provider = new ethers.providers.JsonRpcProvider('https://betanet-rpc1.artela.network');

// // 合约地址和 ABI
// const contractAddress = '0xE97E4f4bF4E698cA316aab4353Eb6C2AcC0be8AC';
// const contractAbi = [
//   // 合约 ABI 信息，需要替换成你的 ABI
//   {
//     "inputs": [
//       {
//         "components": [
//           {
//             "internalType": "address",
//             "name": "pool",
//             "type": "address"
//           },
//           {
//             "internalType": "uint256",
//             "name": "amountIn",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint160",
//             "name": "sqrtPriceLimitX96",
//             "type": "uint160"
//           },
//           {
//             "internalType": "bool",
//             "name": "zeroForOne",
//             "type": "bool"
//           }
//         ],
//         "internalType": "struct UniswapV3Quoter.QuoteParams",
//         "name": "params",
//         "type": "tuple"
//       }
//     ],
//     "name": "quote",
//     "outputs": [
//       {
//         "internalType": "uint256",
//         "name": "amountOut",
//         "type": "uint256"
//       },
//       {
//         "internalType": "uint160",
//         "name": "sqrtPriceX96After",
//         "type": "uint160"
//       },
//       {
//         "internalType": "int24",
//         "name": "tickAfter",
//         "type": "int24"
//       }
//     ],
//     "stateMutability": "nonpayable",
//     "type": "function"
//   },
//   // 添加其他函数的 ABI 信息...
// ];

// // 创建合约实例
// const contract = new ethers.Contract(contractAddress, contractAbi, provider);

// // 调用 quote 函数
// const callQuote = async () => {
//   try {
//     const result = await contract.quote({
//                 pool: '0xe40897Ec3d45486EFd5E2722a40f50C20628eeda',
//                 amountIn: ethers.utils.parseEther('0.1'),
//                 sqrtPriceLimitX96: 0,
//                 zeroForOne: true,
//               }
//     );

//     console.log('Amount Out:', result.amountOut.toString());
//     console.log('Sqrt Price X96 After:', result.sqrtPriceX96After.toString());
//     console.log('Tick After:', result.tickAfter.toString());
//   } catch (error) {
//     console.error('Error calling quote:', error.message);
//   }
// };

// // 执行调用
// callQuote();
