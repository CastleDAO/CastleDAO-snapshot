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
        console.log('Storing unique owners and buyers');
        const uniqueOwners = []
        const uniqueBuyers = []
        result.forEach(nftCollection => {
            nftCollection.owners.forEach(owner => {
                if (!uniqueOwners.includes(owner.owner)) {
                    uniqueOwners.push(owner.owner)
                }

                if (!uniqueBuyers.includes(owner.buyer)) {
                    uniqueBuyers.push(owner.buyer)
                }
            })
        })
        console.log('TOTAL UNIQUE OWNERS: ' , uniqueOwners.length)
        console.log('TOTAL UNIQUE BUYERS: ', uniqueBuyers.length)
        fs.writeFileSync('./uniqueOwners.json', JSON.stringify(uniqueOwners, null, 2));
        fs.writeFileSync('./uniqueBuyers.json', JSON.stringify(uniqueBuyers, null, 2));



        // CSV of the mappings
        const csvWriter = createCsvWriter({
            path: './output.csv',
            header: [
                { id: 'collection', title: 'COLLECTION' },
                { id: 'address', title: 'ADDRESS' },
                { id: 'tokenId', title: 'TOKENID' },
                { id: 'buyer', title: 'BUYER'}
            ]
        });

        const records = []
        result.forEach(nftCollection => {
            nftCollection.owners.forEach(owner => {
                records.push({
                    collection: nftCollection.name,
                    address: owner.owner,
                    tokenId: owner.tokenId,
                    buyer: owner.buyer
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