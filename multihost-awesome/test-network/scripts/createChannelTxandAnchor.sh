#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# imports
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
. scripts/envVar.sh
. scripts/utils.sh

CHANNEL_NAME="$1"
DELAY="$2"
MAX_RETRY="$3"
VERBOSE="$4"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="true"}

if [ ! -d "channel-artifacts" ]; then
  mkdir channel-artifacts
fi

createChannelTx() {
  set -x
  configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
  res=$?
  { set +x; } 2>/dev/null
  verifyResult $res "Failed to generate channel configuration transaction..."
}


# Source: https://www.udemy.com/course/learn-to-deploy-hyperledger-fabric-v22-on-multihost/?kw=hyperledger+fabric+mu&src=sac || https://www.tutorialspoint.com/deploy-hyperledger-fabric-v2-2-on-multihost/index.asp
createAnchorTX() {

  for orgmsp in Org1MSP Org2MSP Org3MSP; do

  infoln "Generating anchor peer update transaction for ${orgmsp}"
  set -x
  configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/${orgmsp}anchors.tx -channelID $CHANNEL_NAME -asOrg ${orgmsp}
  res=$?
  { set +x; } 2>/dev/null
  if [ $res -ne 0 ]; then
    fatalln "Failed to generate anchor peer update transaction for ${orgmsp}..."
  fi
  done
}

createChannelTx
createAnchorTX

