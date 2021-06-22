// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // manually to make sure everything is compiled
  await hre.run('compile');

  const NFTPM = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
  const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  // const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  // const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  // const impersonAddress = "0x3630220f243288E3EAC4C5676fC191CFf5756431";
  const usdcWethPoolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

  // // We get the contract to deploy
  const LiquidityPro = await ethers.getContractFactory("LiquidityPro");
  const lp = await LiquidityPro.deploy(FACTORY_ADDRESS, NFTPM, usdcWethPoolAddress);
  await lp.deployed();
  console.log("LiquidityPro deployed to:", lp.address);

  // contract does not verify for some reason on tenderly...
  await hre.tenderly.verify({
    name: "LiquidityPro",
    address: lp.address,
  })

  // MOVE TO OTHER SCRIPT
  // const address = "0x81B380dC754309F09a7f9eF7b64F7cfB07eE3a88";
  // const lp = await ethers.getContractAt("LiquidityPro", address);
  // let totalLiquidity = await lp.getTotalLiquidity();
  // console.log(totalLiquidity);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
