const { expect } = require("chai");
const { BigNumber, ethers, utils } = require("hardhat");
const usdcAbi = require('../abi/MockERC20.json').abi;
const nftAbi = require('../abi/NonfungiblePositionManager.json');
const poolAbi = require('../abi/IUniswapV3Pool.json').abi;

const NFTPM = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const impersonAddress = "0x3630220f243288E3EAC4C5676fC191CFf5756431";
const usdcWethPoolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

const deadline = Math.floor(Date.now() / 1000 + 60 * 60);
const TICK_SPACINGS = {
  LOW: 10,
  MEDIUM: 60,
  HIGH: 200
}

describe("UnifiVault", function () {
  it("check balance", async function () {
    // deploy contract
    const UnifiVault = await ethers.getContractFactory("UnifiVault");
    const vault = await UnifiVault.deploy(FACTORY_ADDRESS, NFTPM, usdcWethPoolAddress);
    await vault.deployed();
    console.log(vault.address);
    console.log(TICK_SPACINGS.MEDIUM)

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x3630220f243288E3EAC4C5676fC191CFf5756431"]
    }
    )
    const signer = await ethers.provider.getSigner("0x3630220f243288E3EAC4C5676fC191CFf5756431")
    const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
    const pm = new ethers.Contract(NFTPM, nftAbi, signer);
    const pool = new ethers.Contract(usdcWethPoolAddress, poolAbi, signer);
    let usdcBal = await usdc.balanceOf(impersonAddress);

    let allowance = await usdc.allowance("0x3630220f243288E3EAC4C5676fC191CFf5756431", vault.address);
    console.log(`USDC allowance for vault: ${allowance}`);
    // transfer USDC to the UnifiVault
    await usdc.transfer(vault.address, usdcBal);

    let ethBal = await signer.getBalance();

    await signer.sendTransaction({
      to: vault.address,
      value: ethers.utils.parseEther('200')
    });

    console.log("LPcontract token bal", ethers.utils.formatUnits(await vault.getTokenBalance(), '6'));
    console.log("LPcontract eth bal", ethers.utils.formatEther(await vault.getWethBalance()));

    const { sqrtPriceX96, tick } = await pool.slot0();
    // console.log(sqrtPriceX96.toString())
    // console.log(tick)
    const fee = await pool.fee()
    const amount0Desired = await vault.getTokenBalance();
    const amount1Desired = await vault.getWethBalance();
    // unit with params we know would work from mainnet fork.
    let params = {
      token0: usdcAddress,
      token1: wethAddress,
      fee,
      tickLower: '196260',
      tickUpper: '199920',
      amount0Desired,
      // amount1Desired: '125608504651217967263',
      amount1Desired,
      amount0Min: '0',
      amount1Min: '0',
      recipient: vault.address,
      deadline
    }

    console.log("Minting...")
    //console.log(JSON.stringify(params));
    // usdcBal = await usdc.balanceOf(impersonAddress);
    let tx = await vault.mintPosition(params);
    await tx.wait();

    const requiredAmount0 = ethers.utils.formatUnits((await vault.requiredAmount0()).toString(), '6');
    const requiredAmount1 = ethers.utils.formatEther((await vault.requiredAmount1()).toString());

    // this is the ratio of USDC/WETH amounts required to add liquidity to current NFT position
    let requiredRatio = requiredAmount0 / (requiredAmount1);

    console.log("required amount0", requiredAmount0);
    console.log("required amount1", requiredAmount1);
    console.log("required ratio", requiredRatio);

    const wethBalance = Number(await vault.getWethBalance());
    console.log("LPcontract token bal", (await vault.getTokenBalance()).toString());
    console.log("LPcontract weth bal", wethBalance.toString());

    await vault.updateWethPrice();
    const ethPrice = ethers.utils.formatUnits((await vault.ethPrice()), '6');
    console.log("eth price js", ethPrice.toString());

    // normalize the ratio on same token price level. this ratio reflects the true value ratio of the two tokens. here convert it to eth value ratio.
    requiredRatio = requiredRatio / ethPrice;
    console.log(requiredRatio);
    // calculate the amount of weth to swap into USDC.
    let wethToSwap = wethBalance * requiredRatio / (1 + requiredRatio);
    console.log("eth to swap", wethToSwap);


    console.log("----zapping weth-----")
    await vault.zapToken(wethAddress, wethToSwap.toString());
    // await vault.withdraw();
    console.log("LPcontract token bal", ethers.utils.formatUnits(await vault.getTokenBalance(), '6'));
    console.log("LPcontract weth bal", ethers.utils.formatEther(await vault.getWethBalance()));

    console.log("----add liquidity ETH-----")
    let signerEthBalance = await signer.getBalance();
    console.log("signer eth balance", ethers.utils.formatEther(signerEthBalance));

    // say we want to zap 30 eth on front end.
    const ethToZap = ethers.utils.parseEther('30');
    wethToSwap = ethToZap * requiredRatio / (1 + requiredRatio);

    await vault.connect(signer).addLiquidityEth(wethToSwap.toString(), { value: ethToZap });
    signerEthBalance = await signer.getBalance();
    console.log("signer eth balance", ethers.utils.formatEther(signerEthBalance));
    // const tokenId = (await pm.tokenOfOwnerByIndex(vault.address, 0)).toString();

    // console.log("after withdraw from NFT");
    // console.log("LPcontract weth bal", ethers.utils.formatEther(await vault.getWethBalance()));
    // console.log("LPcontract token bal", ethers.utils.formatUnits(await vault.getTokenBalance(), '6'));

    // rebalance with new params
    // params = {
    //   token0: usdcAddress,
    //   token1: wethAddress,
    //   fee,
    //   tickLower: String(196260 + TICK_SPACINGS.MEDIUM * 2),
    //   tickUpper: String(199920 - TICK_SPACINGS.MEDIUM * 2),
    //   amount0Desired: '310555940140',
    //   amount1Desired: '125608504651217967263',
    //   amount0Min: '0',
    //   amount1Min: '0',
    //   recipient: vault.address,
    //   deadline
    // }
    // await vault.mintPosition(params);

    // console.log('----- minting new position -----')
    // console.log("LPcontract eth bal", ethers.utils.formatEther(await vault.getWethBalance()));
    // console.log("LPcontract token bal", ethers.utils.formatUnits(await vault.getTokenBalance(), '6'));


    // const position = await pm.positions(tokenId);
    // console.log(position.liquidity);


  });
});
