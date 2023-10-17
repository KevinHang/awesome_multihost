#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0

# This script allows for the setup of the organization 1
# This script is also responsible for committing the chaincode

# The commands of this script are taken from the following source: https://hyperledger-fabric.readthedocs.io/en/release-2.2/tutorial/commercial_paper.html

echo Starting setup for Org 1

# Where am I? - source: https://raw.githubusercontent.com/hyperledger/fabric-samples/release-2.2/commercial-paper/network-starter.sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Move to the correct directory
cd "${DIR}/organization/org1/"

# Run monitordocker.sh in a new Terminal window
directory_monitor="cd '${DIR}/organization/org1/'"
osascript -e "tell application \"Terminal\" to do script \"$directory_monitor && ./configuration/cli/monitordocker.sh fabric_test\""

# Source the org1.sh script
source org1.sh

# Package the chaincode
peer lifecycle chaincode package cp.tar.gz --lang node --path ./../../contract --label cp_0

# Install the chaincode
peer lifecycle chaincode install cp.tar.gz

echo "Querying installed chaincode..."

# Query the installed chaincodes
OUTPUT=$(peer lifecycle chaincode queryinstalled)

# Extract the Package ID from the output
PACKAGE_ID=$(echo "$OUTPUT" | grep -o 'Package ID:.*, Label:' | sed 's/Package ID: //' | sed 's/, Label://')

# Export the Package ID as an environment variable
export PACKAGE_ID

# Print the Package ID
echo "Package ID: $PACKAGE_ID"

# Approve the chaincode for the organization
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name awesome -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA

# Install necessary npm modules
cd application
npm install

echo Completed setup for Org 1
