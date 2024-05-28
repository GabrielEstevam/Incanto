'use strict'

const { Gateway, Wallets } = require('fabric-network')
const FabricCAServices = require('fabric-ca-client')
const path = require('path')
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../fabric-samples/test-application/javascript/CAUtil.js')
const { buildCCPOrg1, buildWallet } = require('../fabric-samples/test-application/javascript/AppUtil.js')

const channelName = 'mychannel'
const chaincodeName = 'incanto'
const mspOrg1 = 'Org1MSP'
const walletPath = path.join(__dirname, 'wallet')
const org1UserId = 'appUser'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
const port = 3000

let ccp
let caClient
let wallet
let gateway

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2)
}

async function main() {
	try {
		ccp = buildCCPOrg1()

		caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com')

		wallet = await buildWallet(Wallets, walletPath)

		await enrollAdmin(caClient, wallet, mspOrg1)

		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1')

		gateway = new Gateway()
		
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`)
	}

}

/*async function getAll() {
	let result
	try {

		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		})

		const network = await gateway.getNetwork(channelName)

		const contract = network.getContract(chaincodeName)

		// Get all gas tranfers
		console.log('\n--> Evaluate Transaction: GetAllGasTransfers, function returns all the current gas transfer on the ledger')
		try {
			result = await contract.evaluateTransaction('GetAllGasTransfers')
			result = `${prettyJSONString(result.toString())}`
		} catch {
			result = "Ocorreu um erro ao consultar os dados"
		}
	} finally {
		gateway.disconnect()
	}
	return result;
}*/

async function sendTransaction(params) {
	let result
	try {
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		})

		const network = await gateway.getNetwork(channelName)

		const contract = network.getContract(chaincodeName)

		// Submit a Transaction
		console.log('\n--> Submit Transaction: store, creates new part asset with ID and value arguments');
		try {
			result = await contract.submitTransaction('store', params.id, params.value);
			result = "Transação enviada com sucesso"
		} catch {
			result = "Ocorreu um erro ao enviar a transação"
		}

	} finally {
		gateway.disconnect()
	}
	return result
}

async function getRegister(params) {
	let result
	try {

		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		})

		const network = await gateway.getNetwork(channelName)

		const contract = network.getContract(chaincodeName)

		// Query the ledger
		console.log('\n--> Evaluate Transaction: query, function returns a part asset with a given ID')
		console.log(params.id)
		try {
			result = await contract.evaluateTransaction('query', params.id)
			console.log(result)
			//result = `${prettyJSONString(result.toString())}`
		} catch (error){
			console.log(error)
			result = "Registro não encontrado"
		}

	} finally {
		gateway.disconnect();
	}
	return result
}

/*async function getRegistersFromID(params) {
	let result
	try {

		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		})

		const network = await gateway.getNetwork(channelName)

		const contract = network.getContract(chaincodeName)

		// Query the ledger
		console.log('\n--> Evaluate Transaction: GetGasTransfersFromID, function returns all gas transfers with from id')
		try {

			result = await contract.evaluateTransaction('GetGasTransfersFromID', params.fromID)
			result = `${prettyJSONString(result.toString())}`
		} catch {
			result = "Registro não encontrado"
		}

	} finally {
		gateway.disconnect();
	}
	return result
}

async function getRegistersToID(params) {
	let result
	try {

		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		})

		const network = await gateway.getNetwork(channelName)

		const contract = network.getContract(chaincodeName)

		// Query the ledger
		console.log('\n--> Evaluate Transaction: GetGasTransfersToID, function returns all gas transfers with to id')
		try {

			result = await contract.evaluateTransaction('GetGasTransfersToID', params.fromID)
			result = `${prettyJSONString(result.toString())}`
		} catch {
			result = "Registro não encontrado"
		}

	} finally {
		gateway.disconnect();
	}
	return result
}*/

/*app.post('/getAll', (req, res) => {
	console.log("==== new request ====")
	let result = getAll()
  	result.then(res.send.bind(res))
})*/

app.post('/sendTransaction', (req, res) => {
	console.log("==== new request ====")
	let result = sendTransaction(req.body)
  	result.then(res.send.bind(res))
})

app.post('/getRegister', (req, res) => {
	console.log("==== new request ====")
	let result = getRegister(req.body)
  	result.then(res.send.bind(res))
})

/*app.post('/getRegistersFromID', (req, res) => {
	console.log("==== new request ====")
	let result = getRegistersFromID(req.body)
  	result.then(res.send.bind(res))
})

app.post('/getRegistersToID', (req, res) => {
	console.log("==== new request ====")
	let result = getRegistersToID(req.body)
  	result.then(res.send.bind(res))
})*/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

main()
