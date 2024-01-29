const config = {
  // token0Address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  // token1Address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  // poolAddress: '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
  // managerAddress: '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9',
  // quoterAddress: '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9',
  token0Address: '0x86F37D4B3c96bE4d898Cb61De520D0E2812Da2C3',
  token1Address: '0xaDfEcE47796a02245AeE3f65F39318986f946a66',
  poolAddress: '0xe40897Ec3d45486EFd5E2722a40f50C20628eeda',
  managerAddress: '0x7452F4B21a85E9e3590c68982E92A150108faefE',
  quoterAddress: '0xE97E4f4bF4E698cA316aab4353Eb6C2AcC0be8AC',
  ABIs: {
    'ERC20': require('./abi/ERC20.json'),
    'Pool': require('./abi/Pool.json'),
    'Manager': require('./abi/Manager.json'),
    'Quoter': require('./abi/Quoter.json')
  }
};

export default config;