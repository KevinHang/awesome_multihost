#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0

function _exit(){
    printf "Exiting:%s\n" "$1"
    exit -1
}

# Exit on first error, print all commands.
set -ev
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export FABRIC_CFG_PATH="${DIR}/../config"

cd "${DIR}/../test-network/"

docker kill cliCustomer cliPrivateProvider cliWitness logspout || true
./network.sh down

# remove any stopped containers
docker rm $(docker ps -aq)

#!/bin/bash


rm "${DIR}/organization/org2/cp.tar.gz"
rm "${DIR}/organization/org2/gateway/connection-org2.yaml"
rm "${DIR}/organization/org1/cp.tar.gz"
rm "${DIR}/organization/org1/gateway/connection-org1.yaml"
rm "${DIR}/organization/org3/cp.tar.gz"
rm "${DIR}/organization/org3/gateway/connection-org3.yaml"
rm -r "${DIR}/organization/org2/identity"
rm -r "${DIR}/organization/org1/identity"
rm -r "${DIR}/organization/org3/identity"

