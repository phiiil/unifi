const { expect } = require("chai");
const { ethers } = require("hardhat");

const { TWO_USDC, FOUR_ETH } = require("./testutils.js");
const { FACTORY_ADDR, USDC_ADDR, WETH_ADDR, NFTPM_ADDR, POOL_ADDR, IMP_ADDR } = require("./testutils.js");
const usdcAbi = require('../abi/MockERC20.json').abi;
const nftAbi = require('../abi/NonfungiblePositionManager.json');
const poolAbi = require('../abi/IUniswapV3Pool.json').abi;

let lp = null;
let signer = null;

describe("Deposits should", function () {

    before(async () => {
        console.log("before...")
        // deploy contract
        const UnifiVault = await ethers.getContractFactory("UnifiVault");
        lp = await UnifiVault.deploy(FACTORY_ADDR, NFTPM_ADDR, POOL_ADDR);
        await lp.deployed();

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x3630220f243288E3EAC4C5676fC191CFf5756431"]
        }
        )
        signer = await ethers.provider.getSigner("0x3630220f243288E3EAC4C5676fC191CFf5756431")
        const usdc = new ethers.Contract(USDC_ADDR, usdcAbi, signer);
        const pm = new ethers.Contract(NFTPM_ADDR, nftAbi, signer);
        const pool = new ethers.Contract(POOL_ADDR, poolAbi, signer);
        let usdcBal = await usdc.balanceOf(IMP_ADDR);
        // connect on lp as signer
        lp = lp.connect(signer);
    });

    it("Wrap ETH into WETH token", async function () {
        let tx = await signer.sendTransaction({ to: lp.address, value: FOUR_ETH });
        let receipt = await tx.wait();
        const wethBalance = await lp.getBalance(WETH_ADDR);
        console.log(wethBalance.toString());
        expect(wethBalance).to.equal(FOUR_ETH, "balance should be in UnifiVault");
        // no events from recive function it seems...
    });

    it("Accept USDC tokens", async function () {
        const testAmount = TWO_USDC;
        // allowance
        const usdc = new ethers.Contract(USDC_ADDR, usdcAbi, signer);
        (await usdc.approve(lp.address, testAmount)).wait();
        // deposit
        let tx = await lp.deposit(USDC_ADDR, testAmount);
        let receipt = await tx.wait();
        const b = await lp.getBalance(USDC_ADDR);
        console.log(b.toString());
        expect(b).to.equal(testAmount, "balance should be in UnifiVault");
        // event
        console.log(receipt.events);
        const event = receipt.events.find(x => x.event === "TokenDeposit");
        expect(event.args.token).to.equal(USDC_ADDR);
        expect(event.args.amount).to.equal(TWO_USDC);
    });
});