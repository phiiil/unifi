require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("uniswap-v3-deploy-plugin");
require("@tenderly/hardhat-tenderly");


const ALCHEMY_KEY = process.env.ALCHEMY_KEY;


// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.6",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
        blockNumber: 12631015
      },
    },
    tenderly: {
      url: "https://rpc.tenderly.co/fork/390a3ebc-c5e6-4591-a1d6-d0901f7a891c",
      chainId: 1,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

