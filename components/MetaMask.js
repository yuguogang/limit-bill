import { useContext } from 'react';
import { Button } from "@mui/material";

import { MetaMaskContext } from '../contexts/MetaMask';
import './MetaMask.module.css';

const chainIdToChain = (chainId) => {
  console.log("chainId",chainId )
  switch (chainId) {
    case '0x1':
      return 'Mainnet';

    case '0x2e2e':
      return 'Artela'

    default:
      return 'unknown chain';
  };
}

const shortAddress = address => (address.slice(0, 6) + "..." + address.slice(-4))

const statusConnected = (account, chain) => {
  return (
    <span>Connected to {chainIdToChain(chain)} as {shortAddress(account)}</span>
  );
}

const statusNotConnected = (connect) => {
  return (
    <span>
      <Button   sx={{
                color: "#ffc0cb",
                border: "#ffc0cb",
                width: "100%",
                background: "rgba(255, 192, 203,.1)",
                backgroundColor: "rgba(255, 192, 203,.1)",
                marginY: "8px",
                "&.MuiButtonBase-root:hover": {
                  backgroundColor: "rgba(255, 192, 203,.1)",
                },
              }} onClick={connect}  variant="contained">Connect</Button>
    </span>
  )
}

const renderStatus = (status, account, chain, connect) => {
  switch (status) {
    case 'connected':
      return statusConnected(account, chain)

    case 'not_connected':
      return statusNotConnected(connect)

    case 'not_installed':
      return <span>MetaMask is not installed.</span>

    default:
      return;
  }
}

const MetaMask = () => {
  const context = useContext(MetaMaskContext);

  return (
    <section className="MetaMaskContainer">
      {renderStatus(context.status, context.account, context.chain, context.connect)}
    </section>
  );
}

export default MetaMask;