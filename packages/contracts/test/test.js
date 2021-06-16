const { expect } = require("chai");
const { ethers } = require("hardhat");
const usdcAbi = require('../abi/MockERC20.json').abi;
const nftAbi = require('../abi/NonfungiblePositionManager.json');

const NFTPM = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const impersonAddress = "0x3630220f243288E3EAC4C5676fC191CFf5756431";
const usdcWethPoolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

describe("LiquidityPro", function() {
  it("check balance", async function() {
    const LiquidityPro = await ethers.getContractFactory("LiquidityPro");
    const lp = await LiquidityPro.deploy(FACTORY_ADDRESS, NFTPM, usdcWethPoolAddress);
    
    await lp.deployed();

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x3630220f243288E3EAC4C5676fC191CFf5756431"]}
    )

    const signer = await ethers.provider.getSigner("0x3630220f243288E3EAC4C5676fC191CFf5756431")
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
    const pm = new ethers.Contract(NFTPM, nftAbi, signer);
    let usdcBal = await usdc.balanceOf(impersonAddress);
    await usdc.transfer(lp.address, usdcBal);

    let ethBal = await signer.getBalance();

    signer.sendTransaction({
      to: lp.address,
      value: ethers.utils.parseEther('200')
    });

    const lpUsdcBal = await usdc.balanceOf(lp.address);
    // usdcBal = await usdc.balanceOf(impersonAddress);
    const [sqrtPriceX96, tick] = await lp.createPosition();
    console.log(ethers.utils.formatEther(sqrtPriceX96));
    console.log(tick);
    // console.log("LPcontract eth bal", ethers.utils.formatEther(await lp.getEthBalance()));
    // console.log("LPcontract usdc bal", ethers.utils.formatUnits(lpUsdcBal, '6'))
    // console.log("person usdc bal", ethers.utils.formatUnits(usdcBal, '6'))
    // expect(await lp.greet()).to.equal("Hello, world!");

  });
});
