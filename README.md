
# unifi
Unifi is a vault-like liquidity manager for Uniswap v3. The aim is to provide a launching pad for deploying liquidity strategies on Uniswap v3.

The vault adjusts marker-making strategies (price, ranges, size) over time as the market levels change.

Our target users are Liquidity Providers.

# Minimum Viable Product
The aim to deliver a first version which is both usable and provide a minimal functionality. The first version will be composed of:

- A front end for user to deposit funds (ETH and USDC for the MVP)
    - support depositing/withdrawing ETH and an ERC20 token
    - support depositing/withdrawing any two ERC20 tokens 
    - approve individual ERC20 token; then deposit;
    - withdraw with current reserve ratio of the curent two assets
    - dashboard data: 
        - current total liquidity
        - individual token liquidity
        - accrued fees in each token
        - an APR?
- A fixed strategy vault. A simple delegate contract.
    - preset position params (price range, fees)
    - auto calculate token amounts based on user input (which means not to accept arbitrary amount0 and amount1) from users.
    - would be an advanced feature to accept any user inputs of amount0 and amount1
    - mint new position. 
    - increase liquidity.
    - decrease liquidity.

# Todos
- Write some tests
- Call uniswap v3 to provide liquidity
- Write more tests
- Call uniswap to remove liquidity
- Whitelist the contract for security and testing
- React: Display Pool information for ETH-USDC
- React: Update Wallet display on change

# Done
- Create repo
- Look into a well organised defi project for folder structure (Maybe the Chainshot Escrow repo)
- Create a react app
- npm i libraries (uniswap sdk, open zeppelin)
- Connect Wallet on Front-end
- React: Display wallet balance

# Simple First Strategy
- Select Pair
- Select Range 

# Platforms and languages
- React
- [Create React App](https://github.com/facebook/create-react-app) (to get started?)
- [Solidity 0.7.6](https://docs.soliditylang.org/en/v0.7.6/)
- [Uniswap SDK](https://docs.uniswap.org/SDK/)

# Infinite Possibilities (idea dump)
- ERC20 tokenize the vault.
- Customizable strategy manageable by another contract.
- Provider simple templates that automatically follow the market ranges
- Use bollinger bands to re-target liquidity ranges
- Allow providers to express a market view while being makers

# Realted projects
- [Defi Lab: Uniswap V3 Strategy Simulator](https://defi-lab.xyz/uniswapv3simulator)
- [Visor: Liquidity Management on Uniswap v3](https://www.visor.finance/)