//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "hardhat/console.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";

// this is just a work in progress test contract.

contract LiquidityPro {
    // address public factoryAddress;
    // address public nonfungiblePositionManagerAddress;
    IUniswapV3Factory factory;
    INonfungiblePositionManager nonfungiblePositionManager;
    IUniswapV3Pool pool;
    IERC20Minimal token0;
    IERC20Minimal token1;
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint128 amount;
        uint256 amount0Max;
        uint256 amount1Max;
        address recipient;
        uint256 deadline;
    }

    constructor(
        IUniswapV3Factory _factory,
        INonfungiblePositionManager _nonfungiblePositionManager,
        IUniswapV3Pool _pool
    ) {
        // console.log("Deploying a Greeter with greeting:", _greeting);
        factory = _factory;
        nonfungiblePositionManager = _nonfungiblePositionManager;
        pool = _pool;
    }

    function createPosition()
        external
        view
        returns (uint160 sqrtPriceX96, int24 tick)
    {
        (sqrtPriceX96, tick, , , , , ) = pool.slot0();

        return (sqrtPriceX96, tick);
        // console.log(sqrtPriceX96);
        // console.log(tick);
    }

    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
