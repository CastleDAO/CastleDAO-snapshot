const abiCastleDAO = require('./abis/castledao.json');
const abiCastleDAOETH = require('./abis/castledaoeth.json');
const abiBattlefly = require('./abis/battlefly.json');

const web3 = require('../web3')
const { NETWORKS } = require('../networks')

const contractAddresses = [{
    name: 'CastleDAO',
    address: '0x71f5C328241fC3e03A8c79eDCD510037802D369c',
    // Used to count transfer events since
    network: NETWORKS.arbitrum.name,
    rpc: NETWORKS.arbitrum.rpc,
    firstBlock: '386564',
    abi: abiCastleDAO,
    totalSupply: 10000
}, {
    name: 'CastleDAO Ethereum',
    address: '0x90e9da69c4c77c6123e54d9e0e51c1603b3d09e4',
    // Used to count transfer events since
    network: NETWORKS.mainnet.name,
    rpc: NETWORKS.mainnet.rpc,
    firstBlock: '13177266',
    abi: abiCastleDAOETH,
    totalSupply: 10000
}
, {
    name: 'Battlefly Special',
    address: '0xc43104775bd9f6076808b5f8df6cbdbeac96d7de',
    // Used to count transfer events since
    network: NETWORKS.arbitrum.name,
    rpc: NETWORKS.arbitrum.rpc,
    firstBlock: '7292242',
    abi: abiBattlefly,
    totalSupply: 2325
}
]

const contracts = contractAddresses.map(c => {

    const contract = new web3[c.network].eth.Contract(c.abi, c.address);
    return {
        ...c,
        contract
    }
});

module.exports = {
    contracts
}