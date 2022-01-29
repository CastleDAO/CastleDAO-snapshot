
const { contracts } = require('../contracts');
const web3 = require('../web3');

async function fetchBatch(contract, current, lastBlock, acc = [], name) {
    const lastCurrentBlock = current + 100 > lastBlock ? lastBlock : current + 100;
    const options = {
        fromBlock: current,                  //Number || "earliest" || "pending" || "latest"
        toBlock: lastCurrentBlock
    };

    const results = await contract.getPastEvents('Transfer', options);

    acc = [...acc, ...results]
    console.log('Fetched  batch of items  from block', lastCurrentBlock, 'new items', results.length, name);

    if (lastCurrentBlock >= lastBlock) {
        return acc
    } else {
        return await fetchBatch(contract, lastCurrentBlock, lastBlock, acc, name)
    }
}


async function getPoc() {


    return await Promise.all(contracts.map(async contract => {
        const lastBlock = await web3[contract.network].eth.getBlockNumber()

        console.log('Fetching info for ' + contract.name, 'Last block number' , lastBlock);
        try {
            const items = await fetchBatch(contract.contract, contract.firstBlock, lastBlock, [], contract.name)
            console.log('Finished batch for ', contract.name, 'with items', items.length)
            const tokenIds = items.map(i => {
               return {
                tokenId: i.returnValues.tokenId,
                buyer: i.returnValues.from === '0x0000000000000000000000000000000000000000' ? i.returnValues.to : null
               }
            });

            const reducedIds = {}
            tokenIds.forEach(item => {
                if (!reducedIds[item.tokenId]) {
                    reducedIds[item.tokenId] = item
                }
            })
            console.log('Getting owners for ', contract.name, tokenIds.length, 'unique tokens')
            
            const owners = await Promise.all(Object.values(reducedIds).map(async item => {
                const tokenId = item.tokenId;
                const buyer = item.buyer;

                try {
                    const owner = await contract.contract.methods.ownerOf(tokenId).call()
                    return {
                        owner,
                        tokenId,
                        buyer
                    }
                } catch (e) {
                    console.log(e)
                   
                    return {
                        tokenId,
                        owner: 'Not found'
                    }
                }
            }))

            console.log('End fetching info for ' + contract.name);
            return {
                name: contract.name,
                owners
            }
        } catch (e) {
            console.log('error for', contract.name, e)
            throw e
        }
    }))
}

module.exports = {
    getPoc
}