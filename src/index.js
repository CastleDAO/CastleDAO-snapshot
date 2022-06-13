require('dotenv').config();
const fs = require('fs');
const { getPoc } = require('./poc');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


async function execute() {
    try {
        console.log('Extracting addresses for CastleDAO Snapshot')

        const result = await getPoc()

        // Raw results
        fs.writeFileSync('./output.json', JSON.stringify(result, null, 2));

        // Unique addresses:
        console.log('Storing unique owners and owners');
        const uniqueOwners = []
        const uniqueowners = []
        result.forEach(nftCollection => {
            nftCollection.owners.forEach(owner => {
                if (!uniqueOwners.includes(owner.owner)) {
                    uniqueOwners.push(owner.owner)
                }

                if (!uniqueowners.includes(owner.owner)) {
                    uniqueowners.push(owner.owner)
                }
            })
        })
        console.log('TOTAL UNIQUE OWNERS: ' , uniqueOwners.length)
        console.log('TOTAL UNIQUE ownerS: ', uniqueowners.length)
        fs.writeFileSync('./uniqueOwners.json', JSON.stringify(uniqueOwners, null, 2));
        fs.writeFileSync('./uniqueowners.json', JSON.stringify(uniqueowners, null, 2));



        // CSV of the mappings
        const csvWriter = createCsvWriter({
            path: './output.csv',
            header: [
                { id: 'collection', title: 'COLLECTION' },
                { id: 'address', title: 'ADDRESS' },
                { id: 'tokenId', title: 'TOKENID' },
                { id: 'owner', title: 'owner'}
            ]
        });

        const records = []
        result.forEach(nftCollection => {
            nftCollection.owners.forEach(owner => {
                records.push({
                    collection: nftCollection.name,
                    address: owner.owner,
                    tokenId: owner.tokenId,
                    owner: owner.owner
                })
            })
        })

        console.log('Writing csv')

        csvWriter.writeRecords(records)       // returns a promise
            .then(() => {
                console.log('Finished, check the file output.json and output.csv')
            });



    } catch (e) {
        console.log('Error generating POC', e.message, e);
    }
}


execute()