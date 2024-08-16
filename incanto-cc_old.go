package main

import (
  "encoding/json"
  "fmt"
  "log"

  "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an PartAsset
type SmartContract struct {
  contractapi.Contract
}

// PartAsset represents a part
type PartAsset struct {
  // Asset identification
  ID                string `json:"ID"`
  Date		          string `json:"Date"`
  Printer           string `json:"Printer"`
  Service           string `json:"Service"`
  Owner             string `json:"Owner"`
  // Printing characteristics
  PrintDuration     float32  `json:"PrintDuration"`
  NozzleTemperature float32  `json:"NozzleTemperature"`
  PlateTemperature  float32  `json:"PlateTemperature"`
  LayerHeight       float32  `json:"LayerHeight"`
  Resolution        string `json:"Resolution"`
  InfillDensity     float32  `json:"InfillDensity"`
  // Part characteristics
  Material          string `json:"Material"`
  Weight            float32  `json:"Weight"`
  FilamentSpent     float32  `json:"FilamentSpent"`
  // Sensors data (Fingerprint)
  XYZCloud          string `json:"XYZCloud"`
  TemperaturePoints string `json:"TemperaturePoints"`
  FilamentExtrusion string `json:"FilamentExtrusion"`
  TimelapsedVideo   string `json:"TimelapsedVideo"`
}

// CreatePartAsset issues a new part asset to the world state with given details.
func (s *SmartContract) CreatePartAsset(
    ctx contractapi.TransactionContextInterface, 
    id string, 
    date string, 
    printer string,
    service string,
    owner string,
    printDuration float32,
    nozzleTemperature float32,
    plateTemperature float32,
    layerHeight float32,
    resolution string,
    infillDensity float32,
    material string,
    weight float32,
    filamentSpent float32,
    xyzCloud string,
    temperaturePoints string,
    filamentExtrusion string,
    timelapsedVideo string) error {

  exists, err := s.PartAssetExists(ctx, id)
  if err != nil {
    return err
  }
  if exists {
    return fmt.Errorf("the part asset %s already exists", id)
  }

  partAsset := PartAsset{
    ID: id,
    Date: date,
    Printer: printer,
    Service: service,
    Owner: owner,
    PrintDuration: printDuration,
    NozzleTemperature: nozzleTemperature,
    PlateTemperature: plateTemperature,
    LayerHeight: layerHeight,
    Resolution: resolution,
    InfillDensity: infillDensity,
    Material: material,
    Weight: weight,
    FilamentSpent: filamentSpent,
    XYZCloud: xyzCloud,
    TemperaturePoints: temperaturePoints,
    FilamentExtrusion: filamentExtrusion,
    TimelapsedVideo: timelapsedVideo,
  }

  partAssetJSON, err := json.Marshal(partAsset)
  if err != nil {
    return err
  }

  return ctx.GetStub().PutState(id, partAssetJSON)
}

// ReadPartAsset returns the part asset stored in the world state with given id.
func (s *SmartContract) ReadPartAsset(ctx contractapi.TransactionContextInterface, id string) (*PartAsset, error) {
  partAssetJSON, err := ctx.GetStub().GetState(id)
  if err != nil {
    return nil, fmt.Errorf("failed to read from world state: %v", err)
  }
  if partAssetJSON == nil {
    return nil, fmt.Errorf("the asset %s does not exist", id)
  }

  var partAsset PartAsset
  err = json.Unmarshal(partAssetJSON, &partAsset)
  if err != nil {
    return nil, err
  }

  return &partAsset, nil
}

// PartAssetExists returns true when the part asset with given ID exists in world state
func (s *SmartContract) PartAssetExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
  partAssetJSON, err := ctx.GetStub().GetState(id)
  if err != nil {
    return false, fmt.Errorf("failed to read from world state: %v", err)
  }

  return partAssetJSON != nil, nil
}

// GetAllPartAssets returns all part assets found in world state
func (s *SmartContract) GetAllPartAssets(ctx contractapi.TransactionContextInterface) ([]*PartAsset, error) {
  resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
  if err != nil {
    return nil, err
  }
  defer resultsIterator.Close()

  var partAssets []*PartAsset
  for resultsIterator.HasNext() {
    queryResponse, err := resultsIterator.Next()
    if err != nil {
      return nil, err
    }

    var partAsset PartAsset
    err = json.Unmarshal(queryResponse.Value, &partAsset)
    if err != nil {
      return nil, err
    }
    partAssets = append(partAssets, &partAsset)
  }

  return partAssets, nil
}

// GetPartAssetsOwner return all transfers found with from owner
func (s *SmartContract) GetPartAssetsID(ctx contractapi.TransactionContextInterface, owner string) ([]*PartAsset, error) {
  //queryString := fmt.Sprintf(`{"selector":{"from":"Refiner"}}`)
  //resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
  resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
  if err != nil {
    return nil, err
  }
  defer resultsIterator.Close()

  var partAssets []*PartAsset
  for resultsIterator.HasNext() {
    queryResponse, err := resultsIterator.Next()
    if err != nil {
      return nil, err
    }

    var partAsset PartAsset
    err = json.Unmarshal(queryResponse.Value, &partAsset)
    if err != nil {
      return nil, err
    }
    if partAsset.Owner == owner {
    	partAssets = append(partAssets, &partAsset)
    }
  }

  return partAssets, nil
}

func main() {
  incantoChaincode, err := contractapi.NewChaincode(&SmartContract{})
  if err != nil {
    log.Panicf("Error creating incanto chaincode: %v", err)
  }

  if err := incantoChaincode.Start(); err != nil {
    log.Panicf("Error starting incanto chaincode: %v", err)
  }
}
