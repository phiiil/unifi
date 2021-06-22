require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */


//  module.exports = {
//   solidity: "0.7.6",
//   networks: {
//     beacon: {
//       url: "https://rpc.tenderly.co/fork/3c9e60b7-fe55-4ca6-a173-e0b34a13223f",
//       blockNumber: 12631015, 
//       accounts: [process.env.PRIVATE_KEY]
//     }
//   }
// };


module.exports = {
  solidity: "0.7.6",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
        blockNumber: 12631015
      }
    }
  }
};

