const { contracts } = require("../contracts");
const web3 = require("../web3");

// Gets all the owners based on transfer events
async function fetchBatchFromTransferEvents(
  contract,
  current,
  lastBlock,
  acc = [],
  name
) {
  const lastCurrentBlock =
    current + 100 > lastBlock ? lastBlock : current + 100;
  const options = {
    fromBlock: current, //Number || "earliest" || "pending" || "latest"
    toBlock: lastCurrentBlock,
  };

  const results = await contract.getPastEvents("Transfer", options);

  acc = [...acc, ...results];
  console.log(
    "Fetched  batch of items  from block",
    lastCurrentBlock,
    "new items",
    results.length,
    name
  );

  if (lastCurrentBlock >= lastBlock) {
    console.log("Finished batch for ", contract.name, "with items", acc.length);
    const tokenIds = acc.map((i) => {
      return {
        tokenId: i.returnValues.tokenId,
        buyer:
          i.returnValues.from === "0x0000000000000000000000000000000000000000"
            ? i.returnValues.to
            : null,
      };
    });
    // We reduce ids because there can be repeated token ids when listening to transfer events
    const reducedIds = {};
    tokenIds.forEach((item) => {
      if (!reducedIds[item.tokenId]) {
        reducedIds[item.tokenId] = item;
      }
    });
    // Get the current owner of each nft minted
    const owners = await Promise.all(
      Object.values(reducedIds).map(async (item) => {
        const tokenId = item.tokenId;
        const buyer = item.buyer;

        try {
          const owner = await contract.contract.methods.ownerOf(tokenId).call();
          return {
            owner,
            tokenId,
            buyer,
          };
        } catch (e) {
          console.log(e);

          return {
            tokenId,
            owner: "Not found",
          };
        }
      })
    );
    return owners;
  } else {
    return await fetchBatchFromTransferEvents(
      contract,
      lastCurrentBlock,
      lastBlock,
      acc,
      name
    );
  }
}

// Gets all the owners based on ownerOf
async function fetchBatchFromTotalSupply(
  contract,
  totalSupply,
  current,
  acc = [],
  name
) {
  const lastIndex = current + 100 > totalSupply ? totalSupply : current + 100;
  const results = [];
  for (var i = current; i <= lastIndex; i++) {
    try {
      const owner = await contract.methods.ownerOf(i).call();
      results.push({
        tokenId: i,
        owner,
      });
    } catch (e) {
        //console.log(e);
      //
    }
  }

  acc = [...acc, ...results];
  console.log(
    "Fetched  batch of items for owners",
    lastIndex,
    "new items",
    results.length,
    name
  );

  if (lastIndex >= totalSupply) {
    console.log("Finished batch for ", contract.name, "with items", acc.length);
    return acc;
  } else {
    return await fetchBatchFromTotalSupply(
      contract,
      totalSupply,
      lastIndex,
      acc,
      name
    );
  }
}

async function getPoc() {
  return await Promise.all(
    contracts.map(async (contract) => {
      const lastBlock = await web3[contract.network].eth.getBlockNumber();

      console.log(
        "Fetching info for " + contract.name,
        "Last block number",
        lastBlock
      );
      try {
        // const tokenIds = await fetchBatch(
        //   contract.contract,
        //   contract.firstBlock,
        //   lastBlock,
        //   [],
        //   contract.name
        // );

        const owners = await fetchBatchFromTotalSupply(
          contract.contract,
          contract.totalSupply,
          0,
          [],
          contract.name
        );

        console.log(
          "Getting owners for ",
          contract.name,
          owners.length,
          "unique tokens"
        );

        console.log("End fetching info for " + contract.name);
        return {
          name: contract.name,
          owners: owners,
        };
      } catch (e) {
        console.log("error for", contract.name, e);
        throw e;
      }
    })
  );
}

module.exports = {
  getPoc,
};
