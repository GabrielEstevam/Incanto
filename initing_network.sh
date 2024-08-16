#!/bin/bash
if [ ! -d "fabric-samples/" ]
then
	echo "=== Downloading Fabric Samples ==="
	curl -sSL https://bit.ly/2ysbOFE | bash -s
fi

if [ ! -d "fabric-samples/incanto/" ]
then
	echo "=== Copying files ==="
	mkdir fabric-samples/incanto/
	cp -r chaincode-go fabric-samples/incanto/chaincode-go
	cd fabric-samples/incanto/chaincode-go/
	go mod init main.go
	go mod tidy
	cd ../../..
fi

echo "=== Entering the Directory ==="
cd fabric-samples/test-network/

echo "=== Network down ==="
./network.sh down

echo "=== Start up network and create a channel ==="
./network.sh up createChannel -ca

echo "=== Deploying the chaincode ==="
#sudo ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go/ -ccl go
sudo ./network.sh deployCC -ccn incanto -ccp ../incanto/chaincode-go/ -ccl go
#echo "=== Running application ==="
#cd ../..
#cd asset-transfer-basic/application-javascript/
#cd application-server/
#if [ -d "wallet/" ]
#then
#	sudo rm -r wallet/
#fi
#if [ ! -d "node-modules/" ]
#then
#	npm install
#fi
#node app.js


