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
const org1UserId = 'appUser'

const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const { maxHeaderSize } = require('http')
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
	  cb(null, file.originalname)
	}
  })
  
const upload = multer({ storage })
//const upload = multer({ dest: 'uploads/' })

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
//app.use(upload.array())
//app.use(express.json())
//app.use(express.urlencoded({ extended: true }))
const port = 3000

let ccp
let caClient
let wallet
let gateway

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

async function main() {
	//base64str = base64_encode('files/incanto.jpg')
	//base64str = base64_encode('files/incanto_36_fingerprint.txt')
	/*base64str = base64_encode('files/incanto_36_timelapsed.mp4')
	console.log(base64str)*/

	/*fs.writeFile('image.png', base64str, {encoding: 'base64'}, function(err) {
		console.log('File created');
	});*/

	console.log('----------------------------------')

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

async function sendTransaction(req) {
	let result
	let params = req.body
	let files = req.files
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
				params.id, 
				params.date,
				params.printer,
				params.service,
				params.owner,
				base64_encode(files['image'][0].path),
				base64_encode(files['stlfile'][0].path),
				params.printduration,
				params.nozzletemperature,
				params.platetemperature,
				params.layerheight,
				params.resolution,
				params.infilldensity,
				params.material,
				params.weight,
				params.filamentspent,
				base64_encode(files['fingerprintcloud'][0].path),
				base64_encode(files['timelapsedvideo'][0].path)
			)

			result = "Transação enviada com sucesso"
		} catch (error) {
			console.log(error)
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
			//console.log(result)
			//console.log(JSON.parse(result).value)

			/*fs.writeFile('image_result2.png', JSON.parse(result).value, {encoding: 'base64'}, function(err) {
				console.log('File created');
			});*/

			/*fs.writeFile('files/csv_result.txt', JSON.parse(result).value, {encoding: 'base64'}, function(err) {
				console.log('File created');
			});*/

			/*fs.writeFile('files/timelapsed_result.mp4', JSON.parse(result).value, {encoding: 'base64'}, function(err) {
				console.log('File created');
			});*/
		} catch (error){
			console.log(error)
			result = "Registro não encontrado"
		}

	} finally {
		gateway.disconnect();
	}
	return result
}

app.post('/sendTransaction', 
	upload.fields([
		{name: 'image', maxCount: 1}, 
		{name: 'stlfile', maxCount: 1},
		{name: 'fingerprintcloud', maxCount: 1},
		{name: 'timelapsedvideo', maxCount: 1}
	]
	), function (req, res) {
	console.log("==== new request ====")
	let result = sendTransaction(req)
  	result.then(res.send.bind(res))
})

app.post('/receiveFile', 
	upload.fields([
		{name: 'image', maxCount: 1}, 
		{name: 'stlfile', maxCount: 1}]
	), (req, res) => {
	
	console.log("==== receive file ====")
	//let result = sendTransaction(req.body)
  	//result.then(res.send.bind(res))
	console.log(req.files)
	res.json(req.files['image'][0].path)
})

app.post('/getRegister', upload.none(), (req, res) => {
	console.log("==== new request ====")
	let result = getRegister(req.body)
  	result.then(res.send.bind(res))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

main()
