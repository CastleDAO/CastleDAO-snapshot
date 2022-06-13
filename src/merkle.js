const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const whiteList = require('../uniqueowners.json');

const leafNodes = whiteList.map(add => keccak256(add))

const merkletree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })

const rootHash = merkletree.getRoot()

console.log(rootHash.toString())