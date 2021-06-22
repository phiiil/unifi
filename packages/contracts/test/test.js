const { expect } = require("chai");
const { ethers } = require("hardhat");
const usdcAbi = require('../abi/MockERC20.json').abi;
const nftAbi = require('../abi/NonfungiblePositionManager.json');
const poolAbi = require('../abi/IUniswapV3Pool.json').abi;


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

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x3630220f243288E3EAC4C5676fC191CFf5756431"]}
    )

    const signer = await ethers.provider.getSigner("0x3630220f243288E3EAC4C5676fC191CFf5756431")
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
    const pm = new ethers.Contract(NFTPM, nftAbi, signer);
    const pool = new ethers.Contract(usdcWethPoolAddress, poolAbi, signer);
    let usdcBal = await usdc.balanceOf(impersonAddress);


    await usdc.transfer(lp.address, usdcBal);

    let ethBal = await signer.getBalance();

    await signer.sendTransaction({
      to: lp.address,
      value: ethers.utils.parseEther('200')
    });

    console.log("LPcontract eth bal", ethers.utils.formatEther(await lp.getWethBalance()));
    console.log("LPcontract token bal", ethers.utils.formatUnits(await lp.getTokenBalance(), '6'));
    const {sqrtPriceX96, tick} = await pool.slot0();
    // console.log(sqrtPriceX96.toString())
    // console.log(tick)
    const fee = await pool.fee()
    // INonfungiblePositionManager.MintParams memory params =
    //         INonfungiblePositionManager.MintParams({
    //             token0: pool.token0(),
    //             token1: pool.token1(),
    //             fee: pool.fee(),
    //             tickLower: 196260,
    //             tickUpper: 199920,
    //             amount0Desired: 310555940140,
    //             amount1Desired: 125608504651217967263,
    //             amount0Min: 0,
    //             amount1Min: 0,
    //             recipient: address(this),
    //             deadline: block.timestamp + 1 days
    //         });
    let params = {
      token0: usdcAddress,
      token1: wethAddress,
      fee,
      tickLower: '196260',
      tickUpper: '199920',
      amount0Desired: '310555940140',
      amount1Desired: '125608504651217967263',
      amount0Min: '0',
      amount1Min: '0',
      recipient: lp.address,
      deadline: Math.floor(Date.now()/1000 + 60*60)
    }

    // console.log(params)
    // usdcBal = await usdc.balanceOf(impersonAddress);
    await lp.mintPosition(params);


    console.log("LPcontract eth bal", ethers.utils.formatEther(await lp.getWethBalance()));
    console.log("LPcontract token bal", ethers.utils.formatUnits(await lp.getTokenBalance(), '6'));

    // // console.log(Number(await lp.getTotalLiquidity()));
    await lp.withdraw();
    // // console.log("liquidity", liquidity);
    // console.log((await pm.balanceOf(lp.address)).toString());
    const tokenId = (await pm.tokenOfOwnerByIndex(lp.address, 0)).toString();

    console.log("after withdraw from NFT");
    console.log("LPcontract weth bal", ethers.utils.formatEther(await lp.getWethBalance()));
    console.log("LPcontract token bal", ethers.utils.formatUnits(await lp.getTokenBalance(), '6'));


    params = {
      token0: usdcAddress,
      token1: wethAddress,
      fee,
      tickLower: String(196260+60*2),
      tickUpper: String(199920-60*2),
      amount0Desired: '310555940140',
      amount1Desired: '125608504651217967263',
      amount0Min: '0',
      amount1Min: '0',
      recipient: lp.address,
      deadline: Math.floor(Date.now()/1000 + 60*60)
    }
    await lp.mintPosition(params);

    console.log('----- minting new position -----')
    console.log("LPcontract eth bal", ethers.utils.formatEther(await lp.getWethBalance()));
    console.log("LPcontract token bal", ethers.utils.formatUnits(await lp.getTokenBalance(), '6'));




    // const position = await pm.positions(tokenId);
    // console.log(position.liquidity);

    
  });
});
