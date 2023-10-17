#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# package the chaincode:
# "--lang node" specifies that the chaincode language is JavaScript
peer lifecycle chaincode package ${CC_PATH}/contract.tar.gz --lang node --path ${CC_PATH}/contract --label cp_0
# install chaincode:
peer lifecycle chaincode install ${CC_PATH}/contract.tar.gz 
# Query the installed chaincodes
OUTPUT=$(peer lifecycle chaincode queryinstalled)
# Extract the Package ID from the output
PACKAGE_ID=$(echo "$OUTPUT" | grep -o 'Package ID:.*, Label:' | sed 's/Package ID: //' | sed 's/, Label://')
# Export the Package ID as an environment variable
export PACKAGE_ID
# Print the Package ID
echo "Package ID: $PACKAGE_ID"
# Approve the chaincode
peer lifecycle chaincode approveformyorg --orderer orderer.example.com:7050 --channelID mychannel --name awesome -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
# Check which orgs have approved the cc
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name awesome --version 0 --sequence 1 --output json --tls --cafile $ORDERER_CA