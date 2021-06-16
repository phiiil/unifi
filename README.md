
# unifi
Unifi is a vault-like liquidity manager for Uniswap v3. The aim is to provide a launching pad for deploying liquidity strategies on Uniswap v3.

The vault adjusts marker-making strategies (price, ranges, size) over time as the market levels change.

Our target users are Liquidity Providers.

# Minimum Viable Product
The aim to deliver a first version which is both usable and provide a minimal functionality. The first version will be composed of:

- A front end for user to deposit funds
- A fixed strategy vault. A simple delegate contract.


# Todos
- Look into a well organised defi project for folder structure (Maybe the Chainshot Escrow repo)
- Create a react app
- npm i libraries (uniswap sdk, open zeppelin)
- Write some tests
- Call uniswap v3 to provide liquidity
- Write more tests
- Call uniswap to remove liquidity

# Done
- Create repo

# Simple First Strategy
- Select Pair
- Select Range 

# Platforms and languages
- React
- [Create React App](https://github.com/facebook/create-react-app) (to get started?)
- [Solidity 0.8.5](https://docs.soliditylang.org/en/v0.8.5/)
- [Uniswap SDK](https://docs.uniswap.org/SDK/)

# Infinite Possibilities (idea dump)
- ERC20 tokenize the vault.
- Customizable strategy manageable by another contract.
- Provider simple templates that automatically follow the market ranges
- Use bollinger bands to re-target liquidity ranges
- Allow providers to express a market view while being makers