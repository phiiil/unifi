//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "hardhat/console.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";
import "@uniswap/v3-periphery/contracts/interfaces/external/IWETH9.sol";

// this is just a work in progress test contract.

contract LiquidityPro {
    // address public factoryAddress;
    // address public nonfungiblePositionManagerAddress;
    IUniswapV3Factory factory;
    INonfungiblePositionManager nonfungiblePositionManager;
    IUniswapV3Pool pool;
    IERC20Minimal token0;
    IERC20Minimal token1;
    IWETH9 weth9 = IWETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    uint128 public totalLiquidity;
    uint256 public vaultTokenId;

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
        public
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = pool.slot0();

        // https://etherscan.io/tx/0xae3cd10be22debaf04f6e2e0d490ad633632705b10b6c76300228ecc2af4f050#eventlog
        INonfungiblePositionManager.MintParams memory params =
            INonfungiblePositionManager.MintParams({
                token0: pool.token0(),
                token1: pool.token1(),
                fee: pool.fee(),
                tickLower: 196260,
                tickUpper: 199920,
                amount0Desired: 310555940140,
                amount1Desired: 125608504651217967263,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp + 1 days
            });

        IERC20Minimal(getToken0()).approve(
            address(nonfungiblePositionManager),
            uint256(-1)
        );
        IERC20Minimal(getToken1()).approve(
            address(nonfungiblePositionManager),
            uint256(-1)
        );

        // (tokenId, liquidity, amount0, amount1) = nonfungiblePositionManager
        //     .mint{value: address(this).balance}(params);
        (tokenId, liquidity, amount0, amount1) = nonfungiblePositionManager
            .mint(params);
        totalLiquidity += liquidity;
        vaultTokenId = tokenId;

        // (bool success, bytes memory returnData) =
        //     address(nonfungiblePositionManager).call{
        //         value: 135.608504651217967263 ether
        //     }(abi.encodeWithSignature("mint(MintParams)", params));

        // console.log(returnData);
        // require(success, "failed mint");
        return (tokenId, liquidity, amount0, amount1);
        // console.log(sqrtPriceX96);
        // console.log(tick); hardhat console doesnt work for int
    }

    function withdraw() public {
        console.log("vaultTokenId", vaultTokenId);
        console.log("total Liquidity", totalLiquidity);
        INonfungiblePositionManager.DecreaseLiquidityParams memory params =
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: vaultTokenId,
                liquidity: totalLiquidity,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp + 1 days
            });
        (uint256 amount0, uint256 amount1) =
            nonfungiblePositionManager.decreaseLiquidity(params);

        INonfungiblePositionManager.CollectParams memory cparams =
            INonfungiblePositionManager.CollectParams({
                tokenId: vaultTokenId,
                recipient: address(this),
                amount0Max: uint128(amount0),
                amount1Max: uint128(amount1)
            });

        (amount0, amount1) = nonfungiblePositionManager.collect(cparams);
    }

    function getTotalLiquidity() public view returns (uint256) {
        return totalLiquidity;
    }

    function getToken0() public view returns (address) {
        return pool.token0();
    }

    function getToken1() public view returns (address) {
        return pool.token1();
    }

    // Return the counter-Token balance of this contract.
    function getTokenBalance() public view returns (uint256) {
        // get the non-WETH token address and balance on vault contract.
        // assuming the pool is always WETH + another token
        address tokenAddress =
            pool.token0() == 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
                ? pool.token1()
                : pool.token0();
        uint256 tokenBalance =
            IERC20Minimal(tokenAddress).balanceOf(address(this));
        return tokenBalance;
    }

    // Return the ETH balance of this contract.
    function getEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getWethBalance() public view returns (uint256) {
        return weth9.balanceOf(address(this));
    }

    receive() external payable {
        weth9.deposit{value: msg.value}();
    }
}
