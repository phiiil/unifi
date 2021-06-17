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

    await signer.sendTransaction({
      to: lp.address,
      value: ethers.utils.parseEther('200')
    });

    console.log("LPcontract eth bal", ethers.utils.formatEther(await lp.getWethBalance()));
    console.log("LPcontract token bal", ethers.utils.formatUnits(await lp.getTokenBalance(), '6'));
    // usdcBal = await usdc.balanceOf(impersonAddress);
    await lp.createPosition();
    // await lp.createPosition();


    console.log("LPcontract eth bal", ethers.utils.formatEther(await lp.getWethBalance()));
    console.log("LPcontract token bal", ethers.utils.formatUnits(await lp.getTokenBalance(), '6'));

    // console.log(Number(await lp.getTotalLiquidity()));
    await lp.withdraw();
    // console.log("liquidity", liquidity);
    console.log((await pm.balanceOf(lp.address)).toString());
    const tokenId = (await pm.tokenOfOwnerByIndex(lp.address, 0)).toString();

    console.log("after withdraw from NFT");
    console.log("LPcontract weth bal", ethers.utils.formatEther(await lp.getWethBalance()));
    console.log("LPcontract token bal", ethers.utils.formatUnits(await lp.getTokenBalance(), '6'));
    const position = await pm.positions(tokenId);
    console.log(position.liquidity);

    // console.log("amount0", ethers.utils.formatEther(amount0));
    // console.log("amount1", ethers.utils.formatEther(amount1));
    // console.log(tick);
    // console.log("token0", token0);
    // console.log("token1", token1);
    // console.log("LPcontract eth bal", ethers.utils.formatEther(await lp.getEthBalance()));
    // console.log("LPcontract usdc bal", ethers.utils.formatUnits(lpUsdcBal, '6'))
    // console.log("person usdc bal", ethers.utils.formatUnits(usdcBal, '6'))
    // expect(await lp.greet()).to.equal("Hello, world!");

  });
});
