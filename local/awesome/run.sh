#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0

# Start the test network
./network-starter.sh

# Run setup for the Org 1 
./setupOrg1.sh

# Run setup for the Org 2
./setupOrg2.sh

# Run setup for the Org 3 
./setupOrg3.sh

# Move to the correct directory for installing chaincode npm modules
cd contract

# Install chaincode npm modules
npm install

# if you want to stop the test network and clean: ./network-clean.sh
