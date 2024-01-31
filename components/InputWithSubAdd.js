import React,{useEffect, useState} from "react";
import { NumericFormat } from "react-number-format";
import { TextField } from "@mui/material";
import {
  ButtonGroup,
  Card,
  Checkbox,
  Dialog,
  IconButton,
  InputAdornment,
} from "@mui/material";
// import RemoveIcon from "@mui/icons-material/Remove";
// import AddIcon from "@mui/icons-material/Add";
// import { useWeb3React } from "@web3-react/core";
import {accAdd,accSub}from "./calculate"
 
function handleUpdateBuyUSDC(value, addValue = 0) {
  console.log("handleUpdateBuyUSDC inputValue","event.target.value",value)

  // const inputValue = parseFloat(event.target.value) || 0;
  // const newValue = USDCInput + addValue;
  // if (newValue < 0) {
  //   setUSDCInput(0);
  // } else {
  //   if (addValue == 0) {
  //     setUSDCInput(value);
  //   } else {
  //     setUSDCInput(Number(newValue.toFixed(1)));
  //   }
  // }
  // console.log("handleUpdateBuyUSDC newValue", newValue);
  // setIsUSDCBuy(newValue > 0);
}

export default function InputWithSubAdd({ inputValueParam= 0 ,handleValueChange,validCompareValue=0,type= 'default', orderbookRow={} }) {
  console.log("0126InputWithSubAdd inputValueParam",inputValueParam)
  console.log("validCompareValue inputValue",inputValueParam)
  // console.log("handleClickOrderbookRow",handleClickOrderbookRow)
  // console.log("setClickOrderbookRowCustom",setClickOrderbookRowCustom)
  console.log("orderbookRow",orderbookRow)
  // const {active} = useWeb3React()
  const [isInputFocused, setInputFocused] = useState(false);
  // inputValueParam=Big(inputValueParam);
  // let inputValue= inputValueParam&&new Big(inputValueParam);
  let inputValue= inputValueParam;

const handleFocus = () => {
  setInputFocused(true);
};
const handleBlur = () => {
  setInputFocused(false);
};

  const handleUpdate = (newValue ) => {
    //  handleValueChange(parseFloat(newValue.toFixed(2)))
    // setClickOrderbookRowCustom(false);
     handleValueChange( newValue );
    console.log("New Value:", newValue);
  };

  const handleSubtract = () => {
    console.log("InputWithSubAdd inputValue",inputValue,Number(inputValue) <= 0.1)

  if(inputValue>0.1){
    const newValue = accSub(inputValue,0.1);
    handleUpdate(newValue);
  }else if(Number(inputValue) <= 0.1){
    const newValue = 0;
    handleUpdate(newValue);
  }
  };

  const handleAdd = () => {
    // Increase the value by 0.1
    const newValue = accAdd(inputValue,0.1);
    handleUpdate(newValue);
  };

 const handleClickMax =()=>{
  inputValue = 1
  handleUpdate(validCompareValue);
 }
  const materialUITextFieldProps = {
    id: "filled-multiline-flexible",
    error:isInputFocused &&  inputValue ==0?true:false,//||isInputFocused&&active&& validCompareValue === 0 
  //  error:true,
    // helperText:isInputFocused &&(validCompareValue < inputValue )  ?"Insufficient balance":null,//|| isInputFocused&&active&& validCompareValue === 0
    value: 
      //    tabName == "buy"
      // ? viteProjectState?.netType == "Testnet"
      //   ? USDCInput
      //   : USDCInput
      // : USDCSharesInput
      inputValue
      // ?.toFixed(5)
      ,
    sx:{ 
      "& .MuiInputBase-input": {
        textAlign: "center",
        height: "48px",
      },
      "& .MuiInputBase-root": {
        height: "48px",
      },
      "&.MuiFormControl-root": {
        width: "350px",
        height: "48px",
      },
     },
    InputProps:{
      // inputProps: {
      //   inputMode: "numeric",
      //   pattern: "[0-9]*",
      // },
      // inputProps: {
      //     inputComponent: CustomNumberFormat
      // },
      startAdornment: (
        <InputAdornment position="start">
          <IconButton
            aria-label="subtract"
            onClick={(event) =>
              // tabName == "buy"
              //   ? viteProjectState?.netType == "Testnet"
              //     ? handleUpdateBuyUSDC(event, -0.1)
              //     : handleUpdateBuyUSDC(event, -0.1)
              //   : handleUpdateSellUSDC(event, -0.1)
              handleSubtract( )
            }
            sx={{
              background: "pink",
              borderRadius: "10%",
              width: "25px",
              height: "25px",
            }}
          >
            {/* <RemoveIcon /> */}
            -
          </IconButton>
        </InputAdornment>
      ),
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="add"
            onClick={(event) =>
              // tabName == "buy"
              //   ? viteProjectState?.netType == "Testnet"
              //     ? handleUpdateBuyUSDC(event, 0.1)
              //     : handleUpdateBuyUSDC(event, 0.1)
              //   : handleUpdateSellUSDC(event, 0.1)
              handleAdd( )

            }
            sx={{
              background: "pink",
              borderRadius: "10%",
              width: "25px",
              height: "25px",
            }}
          >
            {/* <AddIcon /> */}
            +
          </IconButton>
        </InputAdornment>
      ),
    }
  };
  console.log("1225type",type)

  useEffect(()=>{
      handleUpdate(orderbookRow.price)
  },[orderbookRow.price])
  return (
    <div className="App">
      
      
        {type=='feeRange'?  
        <NumericFormat
          value={ 
            inputValue 
        }
        suffix = "%" 
          thousandSeparator
          customInput={TextField}
          {...materialUITextFieldProps}
          onValueChange={(values, sourceInfo) => {
            // setValuesObj(values.floatValue);
            // tabName == "buy"
            // ? viteProjectState?.netType == "Testnet"
            //   ? handleUpdateBuyUSDC(values.floatValue)
            //   : handleUpdateBuyUSDC(values.floatValue)
            // : handleUpdateSellUSDC(values.floatValue)
           handleValueChange( values.floatValue)
          }}
          onFocus={handleFocus}
          allowNegative={false}
          // decimalScale={6}
        />:  
        type=='default'?(
          <NumericFormat
          value={ 
            inputValue 
        }
        // suffix = "%" 
          thousandSeparator
          customInput={TextField}
          {...materialUITextFieldProps}
          onValueChange={(values, sourceInfo) => {
            // setValuesObj(values.floatValue);
            // tabName == "buy"
            // ? viteProjectState?.netType == "Testnet"
            //   ? handleUpdateBuyUSDC(values.floatValue)
            //   : handleUpdateBuyUSDC(values.floatValue)
            // : handleUpdateSellUSDC(values.floatValue)
           handleValueChange( values.floatValue)
          }}
     
          allowNegative={false}
          onFocus={handleFocus}

          decimalScale={6}
        />
        ):(
         ( type=='dollar'||type =='dollarWithoutBalance') &&  <NumericFormat
          value={ 
            inputValue 
        }
          suffix="$"//BUG$
          thousandSeparator
          customInput={TextField}
          {...materialUITextFieldProps}
          onValueChange={(values, sourceInfo) => {
            // setValuesObj(values.floatValue);
            // tabName == "buy"
            // ? viteProjectState?.netType == "Testnet"
            //   ? handleUpdateBuyUSDC(values.floatValue)
            //   : handleUpdateBuyUSDC(values.floatValue)
            // : handleUpdateSellUSDC(values.floatValue)
           handleValueChange( values.floatValue)
          }}
          onFocus={handleFocus}
          allowNegative={false}
          decimalScale={6}
        />
        )
        }
      {  type!=='feeRange'&&type!=='dollarWithoutBalance'&& <div style={{  textAlign:"right"}}>
        <p style={{display:"inline-flex"}}>
        Balance: {validCompareValue}$
        {/* BUG */}
        </p>
        <span onClick={handleClickMax} style={{color:"pink",fontWeight:"700",marginLeft:"0.4rem",cursor:"pointer"}}>
          MAX
        </span>
        </div>}
    </div>
  );
}
