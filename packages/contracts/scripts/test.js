const hre = require("hardhat");

const usdcAbi = require('../abi/MockERC20.json').abi;
const nftAbi = require('../abi/NonfungiblePositionManager.json');

const NFTPM = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const impersonAddress = "0x3630220f243288E3EAC4C5676fC191CFf5756431";
const usdcWethPoolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

const lpAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
async function main() {

  // const LiquidityPro = await hre.ethers.getContractFactory("LiquidityPro");
  // const lp = await LiquidityPro.deploy(FACTORY_ADDRESS, NFTPM, usdcWethPoolAddress);
    
  // await lp.deployed();
  // console.log("LPPro deployed to:", lp.address);
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x3630220f243288E3EAC4C5676fC191CFf5756431"]}
  )

  const signer = await hre.ethers.provider.getSigner("0x3630220f243288E3EAC4C5676fC191CFf5756431")
  const lp = await hre.ethers.getContractAt("LiquidityPro", lpAddress)
  const usdc = new hre.ethers.Contract(usdcAddress, usdcAbi, signer);
  const pm = new hre.ethers.Contract(NFTPM, nftAbi, signer);
  let usdcBal = await usdc.balanceOf(impersonAddress);




  console.log(hre.ethers.utils.formatEther(usdcBal))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
