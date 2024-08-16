'use strict'

const { Gateway, Wallets } = require('fabric-network')
const FabricCAServices = require('fabric-ca-client')
const path = require('path')
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../fabric-samples/test-application/javascript/CAUtil.js')
const { buildCCPOrg1, buildWallet } = require('../fabric-samples/test-application/javascript/AppUtil.js')

const fs = require('fs')

const channelName = 'mychannel'
const chaincodeName = 'incanto'
const mspOrg1 = 'Org1MSP'
const walletPath = path.join(__dirname, 'wallet')
const org1UserId = 'appUser2'

let pathFiles = './files/asset_'

let ccp
let caClient
let wallet
let gateways = []
let nGateways = 1
let txs = 1

let base64str

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2)
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

// function to read json from file
function read_json(file) {
	// read binary data
	let bitmap = fs.readFileSync(file)
	// convert binary data to json
	return JSON.parse(bitmap)
}

async function main() {

	try {
		ccp = buildCCPOrg1()

		caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com')

		wallet = await buildWallet(Wallets, walletPath)

		await enrollAdmin(caClient, wallet, mspOrg1)

		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1')

		for (let i = 0; i < nGateways; i++)
			gateways.push(new Gateway())
		
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`)
	}

	console.log('Initial time: ' + Date.now())
	routine()
}

async function routine() {
	
	for (let i = 0; i < nGateways; i++) {
		workload(gateways[i], txs, i)
	}
}

async function workload(gateway, txs, workload) {
	let response_time = 0
	let initial_time = Date.now() // milisseconds
	
	for (let j = 0; j < txs; j++) {
		
		await sendTransaction(gateway).then(function(result){
			console.log('result:' + result)
		})
		/*await getRegister(gateway, '59756270756').then(function(result){
			console.log('result:')
		})*/

	}
	response_time = (Date.now() - initial_time)/txs
	console.log('Workload ' + workload + ' : ' + response_time)
	console.log('Final time:' + Date.now())
}

async function sendTransaction(gateway) {
	let result

	let id = Math.floor(Math.random() * 99999999999).toString()
	let assertID = '37'
	let params = read_json(pathFiles + assertID +'/params.json')
	let image = base64_encode(pathFiles + assertID + '/image.jpg')
	let stl = base64_encode(pathFiles + assertID + '/stl.stl')
	let fingerprint = base64_encode(pathFiles + assertID + '/fingerprint.csv')
	let video = base64_encode(pathFiles + assertID + '/video.mp4')

	try {
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true }
		})

		const network = await gateway.getNetwork(channelName)

		const contract = network.getContract(chaincodeName)

		// Submit a Transaction
		console.log('\n--> Submit Transaction: store, creates new part asset with ID and value arguments')
		try {
			result = await contract.submitTransaction('store', 
				id, 
				params.Date,
				params.Printer,
				params.Service,
				params.Owner,
				image,
				stl,
				params.PrintDuration,
				params.NozzleTemperature,
				params.PlateTemperature,
				params.LayerHeight,
				params.Resolution,
				params.InfillDensity,
				params.Material,
				params.Weight,
				params.FilamentSpent,
				fingerprint,
				video
			)
			result = "Asset created: " + Buffer.from(result).toString()
		} catch (error) {
			console.log(error)
			result = "Ocorreu um erro ao enviar a transação"
		}

	} finally {
		gateway.disconnect()
	}
	return result
}

async function getRegister(gateway, id) {
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
		console.log(id)
		try {
			result = await contract.evaluateTransaction('query', id)
			console.log(result)
		} catch (error){
			console.log(error)
			result = "Registro não encontrado"
		}

	} finally {
		gateway.disconnect();
	}
	return result
}

main()
//sleep(1000)

console.log('now:' + Date.now())
