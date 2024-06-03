package main

import (
	"fmt"

	//"github.com/hyperledger/fabric/core/chaincode/shim"
	//pb "github.com/hyperledger/fabric/protos/peer"
	"github.com/hyperledger/fabric-chaincode-go/shim"
   	pb "github.com/hyperledger/fabric-protos-go/peer"
)

// Fingerprint Chaincode implementation
type FingerprintChaincode struct {
	// Asset identification
	ID                string `json:"ID"`
	Date		      string `json:"Date"`
	Printer           string `json:"Printer"`
	Service           string `json:"Service"`
	Owner             string `json:"Owner"`
	Image		      string `json:"Image"`
	// Original Design
	STLfile			  string `json:"STLfile"`
	// Printing characteristics
	PrintDuration     string `json:"PrintDuration"`
	NozzleTemperature string `json:"NozzleTemperature"`
	PlateTemperature  string `json:"PlateTemperature"`
	LayerHeight       string `json:"LayerHeight"`
	Resolution        string `json:"Resolution"`
	InfillDensity     string `json:"InfillDensity"`
	// Part characteristics
	Material          string `json:"Material"`
	Weight            string `json:"Weight"`
	FilamentSpent     string `json:"FilamentSpent"`
	// Sensors data (Fingerprint)
	FingerprintCloud  string `json:"FingerprintCloud"`
	TimelapsedVideo   string `json:"TimelapsedVideo"`
}

func (t *FingerprintChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Init method gets called")

	return shim.Success(nil)
}

func (t *FingerprintChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Invoke method gets called")
	function, args := stub.GetFunctionAndParameters()
	if function == "store" {
		// Create a register to a asset
		return t.store(stub, args)
	} else if function == "query" {
		// Query a asset from ID
		return t.query(stub, args)
	}
	return shim.Error("Invalid invoke function name. Expecting \"store\" or \"query\"")
}

func (s *FingerprintChaincode) store(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	var id = args[0]

	exists := assetExists(stub, id)
	if exists {
		jsonResp := "{\"Error\":\"the asset " + id + " already exists\"}"
		return shim.Error(jsonResp)
	}

	asset := FingerprintChaincode {
	  	ID: args[0],
		Date: args[1],
		Printer: args[2],
		Service: args[3],
		Owner: args[4],
		Image: args[5],
		STLfile: args[6],
		PrintDuration: args[7],
		NozzleTemperature: args[8],
		PlateTemperature: args[9],
		LayerHeight: args[10],
		Resolution: args[11],
		InfillDensity: args[12],
		Material: args[13],
		Weight: args[14],
		FilamentSpent: args[15],
		FingerprintCloud: args[16],
		TimelapsedVideo: args[17],
	}

	assetJSON := structToJson(asset)

	err = stub.PutState(id, []byte(assetJSON))
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success([]byte(id))
}

// query callback representing the query of a chaincode
func (t *FingerprintChaincode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("query method gets called")
	var id = args[0]

	// Get the state from the ledger
	Assetbytes, err := stub.GetState(id)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + id + "\"}"
		return shim.Error(jsonResp)
	}

	if Assetbytes == nil {
		jsonResp := "{\"Error\":\"Nil fingerprint for " + id + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(Assetbytes)
}

// Auxiliar functions
func structToJson (partAsset FingerprintChaincode) string {
	//var json = "{\"ID\": \"" + partAsset.ID + "\", \"Date\": \"" + partAsset.Date + "\"}"
	var json = "{\"ID\": \"" + partAsset.ID + "\", \"Date\": \"" + partAsset.Date + "\", \"Printer\": \"" + partAsset.Printer + "\", \"Service\": \"" + partAsset.Service + "\", \"Owner\": \"" + partAsset.Owner + "\", \"Image\": \"" + partAsset.Image + "\", \"STLfile\": \"" + partAsset.STLfile + "\", \"PrintDuration\": \"" + partAsset.PrintDuration + "\", \"NozzleTemperature\": \"" + partAsset.NozzleTemperature + "\", \"PlateTemperature\": \"" + partAsset.PlateTemperature + "\", \"LayerHeight\": \"" + partAsset.LayerHeight + "\", \"Resolution\": \"" + partAsset.Resolution + "\", \"InfillDensity\": \"" + partAsset.InfillDensity + "\", \"Material\": \"" + partAsset.Material + "\", \"Weight\": \"" + partAsset.Weight + "\", \"FilamentSpent\": \"" + partAsset.FilamentSpent + "\", \"FingerprintCloud\": \"" + partAsset.FingerprintCloud + "\", \"TimelapsedVideo\": \"" + partAsset.TimelapsedVideo + "\"},"
	return json
}

// AssetExists returns true when transfer with given ID exists in world state
func assetExists (stub shim.ChaincodeStubInterface, id string) bool {
	assetJSON, err := stub.GetState(id)
	if err != nil {
	  	return false
	}
  
	return assetJSON != nil
}

func main() {
	err := shim.Start(new(FingerprintChaincode))
	if err != nil {
		fmt.Printf("Error starting Fingerprint chaincode: %s", err)
	}
}
