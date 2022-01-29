const Web3 = require("web3");
const web3Arb = new Web3(new Web3.providers.HttpProvider(process.env.RPC_PROVIDER_ARBITRUM));
const web3Main = new Web3(new Web3.providers.HttpProvider(process.env.RPC_PROVIDER_MAINNET));

module.exports  = {
    arbitrum: web3Arb,
    mainnet: web3Main
}