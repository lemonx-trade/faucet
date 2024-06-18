const express = require('express')
const { ethers } = require('ethers')
require('dotenv').config()

const app = express()
const infuraProjectId = process.env.INFURA_PROJECT_ID
const arbitrumSepoliaRpcUrl = `https://arbitrum-sepolia.infura.io/v3/${infuraProjectId}`
const arbitrumSepoliaProvider = new ethers.providers.JsonRpcProvider(arbitrumSepoliaRpcUrl)
const wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, arbitrumSepoliaProvider)
const contractAddress = process.env.LEMONXUSDC_CONTRACT_ADDRESS
const abi = [
    {
        type: 'function',
        name: 'mint',
        inputs: [
            {
                name: '_account',
                type: 'address',
                internalType: 'address',
            },
            {
                name: '_amount',
                type: 'uint256',
                internalType: 'uint256',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
]

const contract = new ethers.Contract(contractAddress, abi, wallet)

app.get('/faucet', async (req, res) => {
    const userAddress = req.query.wallet // Update to match the URL parameter
    const chainID = req.query.chainId // Update to match the URL parameter

    console.log(`Received request: userAddress=${userAddress}, chainID=${chainID}`)

    try {
        const tx = await contract.mint(userAddress, ethers.utils.parseUnits('1.0', 18)) // Adjust amount as needed
        await tx.wait()
        res.status(200).send({ txHash: tx.hash })
    } catch (error) {
        console.error('Error in /faucet route:', error)
        res.status(500).send({ errorMessage: error.message, errorStack: error.stack })
    }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
