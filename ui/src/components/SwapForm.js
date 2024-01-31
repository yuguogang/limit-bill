import './SwapForm.css';
import { ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { uint256Max } from '../lib/constants';
import { MetaMaskContext } from '../contexts/MetaMask';
import config from "../config.js";
import debounce from '../lib/debounce';
import LiquidityForm from './LiquidityForm';

const pairs = [{ token0: "WETH", token1: "USDC" }];

const swap = (zeroForOne, amountIn, account, priceAfter, slippage, { tokenIn, manager, token0, token1 }) => {
  const amountInWei = ethers.utils.parseEther(amountIn);
  const limitPrice = priceAfter.mul((100 - parseFloat(slippage)) * 100).div(10000);
  const extra = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address"],
    [token0.address, token1.address, account]
  );

  tokenIn.allowance(account, config.managerAddress)
    .then((allowance) => {
      if (allowance.lt(amountInWei)) {
        return tokenIn.approve(config.managerAddress, uint256Max).then(tx => tx.wait())
      }
    })
    .then(() => {
      return manager.swap(config.poolAddress, zeroForOne, amountInWei, limitPrice, extra).then(tx => tx.wait())
    })
    .then(() => {
      alert('Swap succeeded!');
    }).catch((err) => {
      console.error(err);
      alert('Failed!');
    });
}

const SwapInput = ({ token, amount, setAmount, disabled, readOnly }) => {
  return (
    <fieldset className="SwapInput" disabled={disabled}>
      <input type="text" id={token + "_amount"} placeholder="0.0" value={amount} onChange={(ev) => setAmount(ev.target.value)} readOnly={readOnly} />
      <label htmlFor={token + "_amount"}>{token}</label>
    </fieldset>
  );
}

const ChangeDirectionButton = ({ zeroForOne, setZeroForOne, disabled }) => {
  return (
    <button className='ChangeDirectionBtn' onClick={(ev) => { ev.preventDefault(); setZeroForOne(!zeroForOne) }} disabled={disabled}>🔄</button>
  )
}


const SlippageControl = ({ setSlippage, slippage, priceAfter }) => {
  // 在组件内部维护处理后的价格状态
  const [processedPriceAfter, setProcessedPriceAfter] = useState(ethers.BigNumber.from(0));

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
      <label htmlFor="slippage">Price after slippage: {processedPriceAfter.toString()}</label>
      <label htmlFor="slippage">Slippage tolerance, %</label>
      <input type="text" value={slippage} onChange={(ev) => setSlippage(ev.target.value)} />
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
  const enabled = metamaskContext.status === 'connected';
  const pair = pairs[0];

  const [zeroForOne, setZeroForOne] = useState(true);
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [token0, setToken0] = useState();
  const [token1, setToken1] = useState();
  const [manager, setManager] = useState();
  const [quoter, setQuoter] = useState();
  const [loading, setLoading] = useState(false);
  const [managingLiquidity, setManagingLiquidity] = useState(false);
  const [slippage, setSlippage] = useState(0.1);
  const [priceAfter, setPriceAfter] = useState();

  useEffect(() => {
    setToken0(new ethers.Contract(
      config.token0Address,
      config.ABIs.ERC20,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    ));
    setToken1(new ethers.Contract(
      config.token1Address,
      config.ABIs.ERC20,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    ));
    setManager(new ethers.Contract(
      config.managerAddress,
      config.ABIs.Manager,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    ));
    setQuoter(new ethers.Contract(
      config.quoterAddress,
      config.ABIs.Quoter,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    ));
  }, []);

  const swap_ = (e) => {
    e.preventDefault();
    swap(zeroForOne, zeroForOne ? amount0 : amount1, metamaskContext.account, priceAfter, slippage, { tokenIn: token1, manager, token0, token1 });
  }

  const updateAmountOut = debounce((amount) => {
    if (amount === 0 || amount === "0") {
      return;
    }

    setLoading(true);
    console.log("config.poolAddress",config.poolAddress);
    console.log("amountIn",ethers.utils.parseEther(amount));
    console.log("zeroForOne",zeroForOne);
    quoter.callStatic
      .quote({ pool: config.poolAddress, amountIn: ethers.utils.parseEther(amount), sqrtPriceLimitX96: 0, zeroForOne: zeroForOne })
      .then(({ amountOut, sqrtPriceX96After }) => {
        zeroForOne ? setAmount1(ethers.utils.formatEther(amountOut)) : setAmount0(ethers.utils.formatEther(amountOut));
        setPriceAfter(sqrtPriceX96After);
        console.log("priceAfter:" + sqrtPriceX96After);
        setLoading(false);
      })
      .catch((err) => {
        zeroForOne ? setAmount1(0) : setAmount0(0);
        setLoading(false);
        console.error(err);
      })
  })

  const setAmount_ = (setAmountFn) => {
    return (amount) => {
      amount = amount || 0;
      setAmountFn(amount);
      updateAmountOut(amount)
    }
  }

  const toggleLiquidityForm = () => {
    setManagingLiquidity(!managingLiquidity);
  }

  return (
    <section className="SwapContainer">
      {managingLiquidity && <LiquidityForm pair={pair} toggle={toggleLiquidityForm} />}
      <header>
        <h1>Swap tokens</h1>
        <button disabled={!enabled || loading} onClick={toggleLiquidityForm}>Add liquidity</button>
      </header>
      <form className="SwapForm">
        <SwapInput
          amount={zeroForOne ? amount0 : amount1}
          disabled={!enabled || loading}
          readOnly={false}
          setAmount={setAmount_(zeroForOne ? setAmount0 : setAmount1)}
          token={zeroForOne ? pair.token0 : pair.token1} />
        <ChangeDirectionButton zeroForOne={zeroForOne} setZeroForOne={setZeroForOne} disabled={!enabled || loading} />
        <SwapInput
          amount={zeroForOne ? amount1 : amount0}
          disabled={!enabled || loading}
          readOnly={true}
          token={zeroForOne ? pair.token1 : pair.token0} />
        <SlippageControl
          setSlippage={setSlippage}
          slippage={slippage} 
          priceAfter={priceAfter}
          />
        <button className='swap' disabled={!enabled || loading} onClick={swap_}>Swap</button>
      </form>
    </section>
  )
}

export default SwapForm;