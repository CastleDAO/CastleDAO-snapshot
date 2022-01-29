 const NETWORKS = {
    arbitrum: {
        name: 'arbitrum',
        rpc: process.env.RPC_PROVIDER_ARBITRUM
    },
    mainnet: {
        name: 'mainnet',
        rpc: process.env.RPC_PROVIDER_MAINNET
    }
}

module.exports = {
    NETWORKS
}