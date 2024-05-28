package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Fingerprint Chaincode implementation
type FingerprintChaincode struct {
}

// Fingerpring describes the print and part details
type Fingerprint struct {
	id             string `json:"ID"`
	value          string `json:"value"` // print cloud
}

func (t *FingerprintChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Init method gets called")

	return shim.Success(nil)
}

func (t *FingerprintChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("Invoke method gets called")
	function, args := stub.GetFunctionAndParameters()
	if function == "store" {
		// Create a register to a fingerprint
		return t.store(stub, args)
	} else if function == "query" {
		// Query a fingerprint from ID
		return t.query(stub, args)
	}
	return shim.Error("Invalid invoke function name. Expecting \"store\" or \"query\"")
}

func (s *FingerprintChaincode) store(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	var id = args[0]

	exists := fingerprintExists(stub, id)
	if exists {
		jsonResp := "{\"Error\":\"the fingerprint " + id + " already exists\"}"
		return shim.Error(jsonResp)
	}

	fingerprint := Fingerprint {
	  id:  	        args[0],
	  value:	    args[1],
	}

	fingerprintJSON := structToJson(fingerprint)

	err = stub.PutState(id, []byte(fingerprintJSON))
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
	Fingerprintbytes, err := stub.GetState(id)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + id + "\"}"
		return shim.Error(jsonResp)
	}

	if Fingerprintbytes == nil {
		jsonResp := "{\"Error\":\"Nil fingerprint for " + id + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(Fingerprintbytes)
}

// Auxiliar functions
func structToJson (fingerprint Fingerprint) string {
	var json = "{id:" + fingerprint.id + ",value:" + fingerprint.value + "}"
	return json
}

// FingerprintExists returns true when transfer with given ID exists in world state
func fingerprintExists (stub shim.ChaincodeStubInterface, id string) bool {
	fingerprintJSON, err := stub.GetState(id)
	if err != nil {
	  	return false
	}
  
	return fingerprintJSON != nil
}

func main() {
	err := shim.Start(new(FingerprintChaincode))
	if err != nil {
		fmt.Printf("Error starting Fingerprint chaincode: %s", err)
	}
}
