const hre = require("hardhat");

const NFTPM = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const usdcWethPoolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

async function main() {

  const LiquidityPro = await hre.ethers.getContractFactory("LiquidityPro");
  const lp = await LiquidityPro.deploy(FACTORY_ADDRESS, NFTPM, usdcWethPoolAddress);
    
  await lp.deployed();
  console.log("LPPro deployed to:", lp.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
