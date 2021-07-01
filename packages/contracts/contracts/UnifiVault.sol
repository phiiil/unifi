//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "hardhat/console.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";
import "@uniswap/v3-periphery/contracts/interfaces/external/IWETH9.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

/**
 * Unifi Vault is the main contract.
 *
 * It offers
 */

contract UnifiVault {
    IUniswapV3Factory factory;
    INonfungiblePositionManager nonfungiblePositionManager;
    IUniswapV3Pool pool;
    IQuoter quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    ISwapRouter router =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IWETH9 weth9 = IWETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    //    IERC20Minimal token0;
    //    IERC20Minimal token1;

    uint128 public totalLiquidity;
    uint256 public vaultTokenId;
    uint256 public priceToken0;
    uint256 public requiredAmount0;
    uint256 public requiredAmount1;
    uint256 public ethPrice;

    // keep a structure containing all tokens and position nfts
    struct assets {
        // mapping from token address to amount in the vault
        mapping(address => uint256) tokens;
    }

    // mapping of liquidity providers (lps) to assets they own in the UnifiVault
    mapping(address => assets) lps;

    /**
     * Deploy the UnifiVault
     * Currently only handle the WETH-USDC pool.
     */
    constructor(
        IUniswapV3Factory _factory,
        INonfungiblePositionManager _nonfungiblePositionManager,
        IUniswapV3Pool _pool
    ) {
        console.log("Deploying LiquitidyPro");
        factory = _factory;
        nonfungiblePositionManager = _nonfungiblePositionManager;
        pool = _pool;
    }

    // call this func from front end, and send ether along with tx.
    function addLiquidityEth(uint256 amountIn) public payable {
        weth9.deposit{value: msg.value}();
        weth9.approve(address(router), amountIn);
        ISwapRouter.ExactInputSingleParams memory swapParams = ISwapRouter
        .ExactInputSingleParams({
            tokenIn: pool.token1(),
            tokenOut: pool.token0(),
            fee: pool.fee(),
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });
        // so far this is token0 amount.
        uint256 amountOut = router.exactInputSingle(swapParams);
        console.log("swapped ", amountIn, "eth");
        console.log("received ", amountOut, "usdc");


            INonfungiblePositionManager.IncreaseLiquidityParams
                memory increaseParams
         = INonfungiblePositionManager.IncreaseLiquidityParams({
            tokenId: vaultTokenId,
            amount0Desired: amountOut,
            amount1Desired: getWethBalance(),
            amount0Min: 0,
            amount1Min: 0,
            deadline: block.timestamp
        });

        // called addLiquidity
        addLiquidity(increaseParams);
    }

    function zapToken(address tokenAddress, uint256 amountIn) public {
        weth9.approve(address(router), amountIn);
        ISwapRouter.ExactInputSingleParams memory swapParams = ISwapRouter
        .ExactInputSingleParams({
            tokenIn: tokenAddress,
            tokenOut: tokenAddress == address(weth9)
                ? pool.token0()
                : pool.token1(),
            fee: pool.fee(),
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });
        // so far this is token0 amount.
        uint256 amountOut = router.exactInputSingle(swapParams);
        console.log(amountOut);


            INonfungiblePositionManager.IncreaseLiquidityParams
                memory increaseParams
         = INonfungiblePositionManager.IncreaseLiquidityParams({
            tokenId: vaultTokenId,
            amount0Desired: amountOut,
            amount1Desired: getWethBalance(),
            amount0Min: 0,
            amount1Min: 0,
            deadline: block.timestamp
        });

        // called addLiquidity
        addLiquidity(increaseParams);
    }

    // call it addLiquidity to differentiate from the increaseLiquidity from NFT PM
    function addLiquidity(
        INonfungiblePositionManager.IncreaseLiquidityParams memory params
    )
        public
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        (liquidity, amount0, amount1) = nonfungiblePositionManager
        .increaseLiquidity(params);

        // (, , , , , , , liquidity, , , , ) = nonfungiblePositionManager.positions(vaultTokenId);

        totalLiquidity += liquidity;
    }

    function updateWethPrice() public {
        // (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
        uint256 amountIn = 1 ether;
        uint24 fee = pool.fee();
        uint160 sqrtPriceLimitX96 = 0;

        ethPrice = quoter.quoteExactInputSingle(
            pool.token1(),
            pool.token0(),
            fee,
            amountIn,
            sqrtPriceLimitX96 // unSafeMath for slippage
        );
        // console.log("eth price sol", ethPrice);
    }

    function mintPosition(INonfungiblePositionManager.MintParams memory params)
        public
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        // https://etherscan.io/tx/0xae3cd10be22debaf04f6e2e0d490ad633632705b10b6c76300228ecc2af4f050#eventlog

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
        requiredAmount0 = amount0; // used to calc ratio of required amounts.
        requiredAmount1 = amount1;

        // console.log("-----console in solidity------");
        // console.log("amount0", amount0);
        // console.log("amount1", amount1);
        // console.log("-----console in solidity------");
    }

    //  withdraw all the LP liquidity from NFT position manager
    function withdraw() public {
        console.log("vaultTokenId", vaultTokenId);
        console.log("total Liquidity", totalLiquidity);

            INonfungiblePositionManager.DecreaseLiquidityParams memory params
         = INonfungiblePositionManager.DecreaseLiquidityParams({
            tokenId: vaultTokenId,
            liquidity: totalLiquidity,
            amount0Min: 0,
            amount1Min: 0,
            deadline: block.timestamp
        });
        (uint256 amount0, uint256 amount1) = nonfungiblePositionManager
        .decreaseLiquidity(params);

        totalLiquidity = 0;


            INonfungiblePositionManager.CollectParams memory cparams
         = INonfungiblePositionManager.CollectParams({
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
        address tokenAddress = pool.token0() ==
            0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
            ? pool.token1()
            : pool.token0();
        uint256 tokenBalance = IERC20Minimal(tokenAddress).balanceOf(
            address(this)
        );
        return tokenBalance;
    }

    // Return the ETH balance of this contract.
    function getEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * Get the grand total balance of WETH held by the UnifiVault.
     */
    function getWethBalance() public view returns (uint256) {
        return weth9.balanceOf(address(this));
    }

    /**
     * Get the Vault balance for a token address
     */
    function getVaultBalance(address tokenAddress)
        public
        view
        returns (uint256)
    {
        return IERC20Minimal(tokenAddress).balanceOf(address(this));
    }

    /**
     * Get the balance for a lp for a specific token address.
     * @return tokenAmount uint amount of token in the UnifiVault for this lp
     */
    function getBalance(address tokenAddress)
        public
        view
        returns (uint256 tokenAmount)
    {
        return lps[msg.sender].tokens[tokenAddress];
    }

    event TokenDeposit(address token, uint256 amount);

    /**
     * Receive ETH from a lp.
     * 1. The ETH is wrapped in WETH and deposited under
     * the UnifiVault's address in the WETH contract.
     * 2. Store the value in the internal lp mapping
     */
    receive() external payable {
        weth9.deposit{value: msg.value}();
        lps[msg.sender].tokens[address(weth9)] += msg.value;
        // this event emit does not seem to work
        emit TokenDeposit(address(weth9), msg.value);
    }

    /**
     * Receive token into the UnifVault
     */
    function deposit(address _tokenAddress, uint256 _amount) external {
        console.log("deposit");
        console.log(_tokenAddress);
        console.log(_amount);
        IERC20Minimal token = IERC20Minimal(_tokenAddress);
        // todo check allowance
        token.transferFrom(msg.sender, address(this), _amount);
        lps[msg.sender].tokens[_tokenAddress] += _amount;
        //emit DepositSuccessful(from_, to_, amount_);
        emit TokenDeposit(_tokenAddress, _amount);
    }
}
