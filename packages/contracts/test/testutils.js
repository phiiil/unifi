
const { ethers } = require("hardhat");


TestUtils = {

    ONE_ETH: ethers.utils.parseEther('1'),
    FOUR_ETH: ethers.utils.parseEther('4'),

    TWO_USDC: ethers.utils.parseUnits('2', "mwei"),

    FACTORY_ADDR: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    WETH_ADDR: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    NFTPM_ADDR: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    USDC_ADDR: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    IMP_ADDR: "0x3630220f243288E3EAC4C5676fC191CFf5756431",
    POOL_ADDR: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",

}

module.exports = TestUtils;