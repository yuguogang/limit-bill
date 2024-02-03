import { ethers } from "ethers";
import Web3 from "@artela/web3";
import { useContext, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Interface } from "@ethersproject/abi";
import { Button } from "@mui/material";
import { uint256Max } from "../lib/constants";
import { MetaMaskContext } from "../contexts/MetaMask";
import debounce from "../lib/debounce";
import LiquidityForm from "./LiquidityForm";
import InputWithSubAdd from "./InputWithSubAdd";
import BuySellSwitchTabs from "./BuySellSwitchTabs.tsx";
import styles from "./SwapForm.module.css";
import { OrdersHistoriesTable } from "./OrderHistory";
import factoryABI from "../abi/Swap/AspectEnabledSimpleAccountFactory.json";
import { packLbParams, rmPrefix,parseLbData } from "./contractLogic.js";
import MetaMask from "./MetaMask";
import message from "./Message"
const factoryAddress = "0x7b20970624Cd01582Cd01385B67B969446AC5110";
const factoryAbi = factoryABI.abi; 

const pairs = [{ token0: "WETH", token1: "USDC" }];

const swap = (
  zeroForOne,
  amountIn,
  account,
  priceAfter,
  slippage,
  { tokenIn, manager, token0, token1 }
) => {
  const amountInWei = ethers.utils.parseEther(amountIn);
  const limitPrice = priceAfter
    .mul((100 - parseFloat(slippage)) * 100)
    .div(10000);
  const extra = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address"],
    [token0.address, token1.address, account]
  );

  tokenIn
    .allowance(account, config.managerAddress)
    .then((allowance) => {
      if (allowance.lt(amountInWei)) {
        return tokenIn
          .approve(config.managerAddress, uint256Max)
          .then((tx) => tx.wait());
      }
    })
    .then(() => {
      return manager
        .swap(config.poolAddress, zeroForOne, amountInWei, limitPrice, extra)
        .then((tx) => tx.wait());
    })
    .then(() => {
      alert("Swap succeeded!");
    })
    .catch((err) => {
      console.error(err);
      alert("Failed!");
    });
};

const SwapInput = ({ token, amount, setAmount, disabled, readOnly }) => {
  return (
    <fieldset className="SwapInput" disabled={disabled}>
      <input
        type="text"
        id={token + "_amount"}
        placeholder="0.0"
        value={amount}
        onChange={(ev) => setAmount(ev.target.value)}
        readOnly={readOnly}
      />
      <label htmlFor={token + "_amount"}>{token}</label>
    </fieldset>
  );
};

const ChangeDirectionButton = ({ zeroForOne, setZeroForOne, disabled }) => {
  return (
    <button
      className="ChangeDirectionBtn"
      onClick={(ev) => {
        ev.preventDefault();
        setZeroForOne(!zeroForOne);
      }}
      disabled={disabled}
    >
      🔄
    </button>
  );
};

const SlippageControl = ({ setSlippage, slippage, priceAfter }) => {
  // 在组件内部维护处理后的价格状态
  const [processedPriceAfter, setProcessedPriceAfter] = useState(
    ethers.BigNumber.from(0)
  );

  useEffect(() => {
    // 在 priceAfter 发生变化时，执行除以 2^96 并平方的计算
    const calculateProcessedPriceAfter = () => {
      if (priceAfter) {
        let processedValue = priceAfter.div(ethers.BigNumber.from(2).pow(96));
        processedValue = processedValue.mul(processedValue);
        setProcessedPriceAfter(processedValue);
      }
    };

    // 调用计算函数
    calculateProcessedPriceAfter();
  }, [priceAfter]); // 当 priceAfter 发生变化时触发 useEffect

  return (
    <fieldset className="SlippageControl">
      <label htmlFor="slippage">
        Price after slippage: {processedPriceAfter.toString()}
      </label>
      <label htmlFor="slippage">Slippage tolerance, %</label>
      <input
        type="text"
        value={slippage}
        onChange={(ev) => setSlippage(ev.target.value)}
      />
    </fieldset>
  );
};

// const SlippageControl = ({ setSlippage, slippage, priceAfter }) => {
//   return (
//     <fieldset className="SlippageControl">
//       <label htmlFor="slippage">Price after slippage:{priceAfter?.toString()}</label>
//       <label htmlFor="slippage">Slippage tolerance, %</label>
//       <input type="text" value={slippage} onChange={(ev) => setSlippage(ev.target.value)} />
//     </fieldset>
//   );
// }

const SwapForm = (props) => {
  const metamaskContext = useContext(MetaMaskContext);
  const enabled = metamaskContext?.status === "connected";
if(enabled){
  const provider =new  ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner();
  const factoryContract = new ethers.Contract(
    factoryAddress,
    new Interface(factoryAbi),
    signer
  );
  console.log(
    "provider,signer,factoryContract",
    provider,
    signer,
    factoryContract
  );
  const nonce = provider.getTransactionCount(metamaskContext.account);
  console.log(nonce);

}
 

  
const config = {
  node: "https://betanet-inner2.artela.network",
  nodes: [
    "https://betanet-inner2.artela.network",
    "https://betanet-inner3.artela.network",
    "https://betanet-inner4.artela.network",
  ],
};
// const web3 =enabled&& new Web3(window.ethereum);
const web3 = new Web3(config.node);
const aspectCore = web3.atl.aspectCore();
const aspectAddress = "0x0aE605Af48A29121bE45a123C11b090065795550";
const aspect = new web3.atl.Aspect(aspectAddress);

  console.log("  metamaskContext.account ", metamaskContext.account )



  const addLmtBill = async (amount, price, buyOrSell) => {
    console.log(`add limit bill`,amount, price, buyOrSell);
    let op = "0x0002";
    let params = rmPrefix(packLbParams(amount, price, buyOrSell));
    let calldata = aspect.operation(op + params).encodeABI();
    const chainId = await web3.eth.getChainId();
    const gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(
      metamaskContext.account
    );
    // console.log("  metamaskContext.account", metamaskContext.account)
    let tx = {
      from: metamaskContext.account,
      nonce: nonce++,
      gasPrice,
      gas: 8000000,//8000000
      data: calldata,
      to: aspectCore.options.address,
      chainId,
    };
    console.log("chainId, gasPrice,nonce",chainId, gasPrice,nonce)
    //  signedTx
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const result = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
        from: accounts[0],
      });
if(result){
message.success(`Transaction:${result}`)
}
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

const [limBillHistory,setLimBillHistory] = useState()
const [tabSwitchValue, setTabSwitchValue] = useState(0);
const [limitPrice, setLimitPrice] = useState(0);
const [amount, setAmount] = useState(0);
  const getLmtBills=async()=>{
    try {
      let op = "0x1002";
      let params = "";
      let calldata = aspect.operation(op + params).encodeABI();
      console.log("op: ", op);
      console.log("params: ", params);

      // Make a read-only call to the smart contract using MetaMask provider
      const ret = await window.ethereum.request({
          method: 'eth_call',
          params: [
              {
                  to: aspectCore.options.address,
                  data: calldata,
              },
              'latest',  
          ],
      });
//0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000

      console.log("ret", ret);
      
      let decodedRet = web3.eth.abi.decodeParameter('string', ret);
      console.log("decodedRet", decodedRet);

      if (decodedRet.length > 0) {
          const lbm = parseInt(decodedRet.substring(0, 4), 16);
          console.log("limit bill number:", lbm);
          const resArray = parseLbData(decodedRet.substring(4));
          console.log("resArray",resArray)
          setLimBillHistory(resArray)
          return resArray;
      }
  } catch (error) {
      console.error('Error fetching limit bills:', error);
  }
  }
 
// 将要移除的limit bill number 作为参数传入
const removeLmtBill = async (index) => {
  console.log(`remove limit bill in index `+ index);
  let op = "0x0003";
  let params = rmPrefix(index.toString(16).padStart(4,'0'));
 console.log("op: ", op);
 console.log("params: ", params);
 const chainId = await web3.eth.getChainId();
 const gasPrice = await web3.eth.getGasPrice();
 let calldata = aspect.operation(op + params).encodeABI();
 let nonce = await web3.eth.getTransactionCount(metamaskContext.account );
 let tx = {
     from: metamaskContext.account,
     nonce: nonce++,
     gasPrice,
     gas: 8000000,
     data: calldata,
     to: aspectCore.options.address,
     chainId
 }

 try {
  // const accounts = await window.ethereum.request({
  //   method: "eth_requestAccounts",
  // });
  const result = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [tx],
    from: metamaskContext.account,
  });
if(result){
  message.success(`Remove Limit Bill Success:${result}`)

}
  console.log("Transaction sent:", result);
} catch (error) {
  console.error("Error sending transaction:", error);
}


}



  const handleTabSwitchChange = (event, newValue) => {
    setTabSwitchValue(newValue);
  };
  const handleUpdateLimitPrice = (value) => {
    setLimitPrice(value);
  };
  const handleUpdateAmount = (value) => {
    setAmount(value);
  };
  const handleSell = ( ) => {
    console.log("handleSell",amount,limitPrice);
    if(amount ==0||limitPrice==0||!amount||!limitPrice){
      message.error("Please Fill In The Amount And Price")
    }else{
    try {
      let res = addLmtBill(amount,limitPrice,1);
      console.log("addLmtBill res", res);
    } catch (error) {
      console.error(error);
    }  
  }
  };
  const handleBuy = ( ) => {
    console.log("handleBuy",amount,limitPrice);
    if(amount ==0||limitPrice==0||!amount||!limitPrice){
      message.error("Please Fill In The Amount And Price")
    }else{
      try {
        let res = addLmtBill(amount,limitPrice,0);
        console.log("addLmtBill res", res);
      } catch (error) {
        console.error(error);
      }
    }
    
  };

  useEffect(()=>{
    getLmtBills()
  },[])

  return (
    <section className="SwapContainer flex flex-row gap-24" style={{color:"#ccc"}}>
      {/* { metamaskContext.account}111 */}
      <OrdersHistoriesTable limBillHistory={limBillHistory} removeLmtBill={removeLmtBill}/>
      <section>
        <BuySellSwitchTabs
          tabSwitchValue={tabSwitchValue}
          handleTabSwitchChange={handleTabSwitchChange}
        />
        <div className={styles.labelRow}>
          <div className={styles.label}>Amount</div>
        </div>
        <div className={styles.inputRow}>
          <InputWithSubAdd
            inputValueParam={amount}
            handleValueChange={handleUpdateAmount}
            type="dollarWithoutBalance"
          />
        </div>
        <div className={styles.labelRow}>
          <div className={styles.label}>Limit Price</div>
        </div>
        <div className={styles.inputRow}>
          <InputWithSubAdd
            inputValueParam={limitPrice}
            handleValueChange={handleUpdateLimitPrice}
            validCompareValue={0}
            type="dollarWithoutBalance"
          />
          
          {!enabled?<MetaMask/>:
          (tabSwitchValue == 0 ? (
            <Button
              sx={{
                color: "#ffc0cb",
                border: "#ffc0cb",
                width: "100%",
                background: "rgba(255, 192, 203,.1)",
                backgroundColor: "rgba(255, 192, 203,.1)",
                marginY: "8px",
                "&.MuiButtonBase-root:hover": {
                  backgroundColor: "rgba(255, 192, 203,.1)",
                },
              }}
              onClick={handleBuy}
              variant="contained"
            >
              Buy
            </Button>
          ) : (
            <Button
              sx={{
                color: "#ffc0cb",
                border: "#ffc0cb",
                width: "100%",
                background: "rgba(255, 192, 203,.1)",
                backgroundColor: "rgba(255, 192, 203,.1)",
                marginY: "8px",
                "&.MuiButtonBase-root:hover": {
                  backgroundColor: "rgba(255, 192, 203,.1)",
                },
              }}
              onClick={handleSell}
              variant="contained"
            >
              Sell
            </Button>
          ))}
        </div>
      </section>
    </section>
  );
};

export default SwapForm;
