/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Chaincode source (Author: Veno Ivankovic): https://raw.githubusercontent.com/venoivankovic/awesome_app/main/awesome_chaincode/javascript/lib/awesome.js
// Modifications and addition of Openstack components by: Kevin Hang (changes and additions marked with ±)

'use strict';

const {
    Contract
} = require('fabric-contract-api');

class Awesome extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        var witnesses = [];
        var customers = [];
        var providers = [];
        await ctx.stub.putState('witnessesPool', Buffer.from(JSON.stringify(witnesses)));
        await ctx.stub.putState('customersPool', Buffer.from(JSON.stringify(customers)));
        await ctx.stub.putState('providersPool', Buffer.from(JSON.stringify(providers)));
        console.info('============= END : Initialize Ledger ===========');
    }

    async registerCustomer(ctx) {
        const serviceAsBytes = await ctx.stub.getState('customersPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error('Customers pool does not exist'); // ± serviceNumber not defined, replaced with returning string message instead
        }
        const customersPool = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        for (var i = 0; i < customersPool.length; i++) {
            if (owner == customersPool[i].customerID) {
                // ± throw error that customer is already registered
                throw new Error(`Provider with id ${owner} is already registered`);
            }
        }
        let customer = {
            "customerID": owner,
            "state": "offline"
        }
        customersPool.push(customer);
        await ctx.stub.putState('customersPool', Buffer.from(JSON.stringify(customersPool)));
        var c = {
            "customerID": owner,
            "accountBalance": {
                "amount": "500",
                "currency": "euro"
            },
            "mySLAs": []
        }
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(c)));

        // ± return the registered customer
        return JSON.stringify(c);
    }

    async registerProvider(ctx) {
        const serviceAsBytes = await ctx.stub.getState('providersPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error('Providers pool does not exist'); // ± serviceNumber not defined, replaced with returning string message instead
        }
        const providersPool = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        for (var i = 0; i < providersPool.length; i++) {
            if (owner == providersPool[i].providerID) {
                // ± throw error that provider is already registered
                throw new Error(`Provider with id ${owner} is already registered`);
            }
        }
        let provider = {
            "providerID": owner,
            "state": "offline"
        }
        providersPool.push(provider);
        await ctx.stub.putState('providersPool', Buffer.from(JSON.stringify(providersPool)));
        var p = {
            "providerID": owner,
            "accountBalance": {
                "amount": "500",
                "currency": "euro"
            },
            "myAuctions": [],
            "mySLAs": []
        }
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(p)));

        // ± return the registered provider
        return JSON.stringify(p);
    }


    async registerWitness(ctx) {
        const serviceAsBytes = await ctx.stub.getState('witnessesPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error('Witnesses pool does not exist'); // ± serviceNumber not defined, replaced with returning string message instead
        }
        const witnessesPool = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        for (var i = 0; i < witnessesPool.length; i++) {
            if (owner == witnessesPool[i].witnessID) {
                // ± throw error that witness is already registered
                throw new Error(`Provider with id ${owner} is already registered`);
            }
        }
        let witness = {
            "witnessID": owner,
            "state": "offline"
        }
        witnessesPool.push(witness);
        await ctx.stub.putState('witnessesPool', Buffer.from(JSON.stringify(witnessesPool)));
        var w = {
            "witnessID": owner,
            "accountBalance": {
                "amount": "50",
                "currency": "euro"
            },
            "mySLAs": []
        }
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(w)));

        // ± return the registered witness
        return JSON.stringify(w);
    }

    // ± allow the provider to delete its profile
    async deleteProvider(ctx) {
        var providerId = ctx.clientIdentity.getID();

        // Get the providers pool from chaincode state
        const serviceAsBytes = await ctx.stub.getState('providersPool'); 
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error('Providers pool does not exist');
        }
        
        // Parse the providers pool
        const providersPool = JSON.parse(serviceAsBytes.toString());
        
        // Find the provider to delete
        const providerIndex = providersPool.findIndex(provider => provider.providerID === providerId);
        if (providerIndex === -1) {
            throw new Error(`Provider with id ${providerId} does not exist`);
        }
        
        // Remove the provider from the providers pool
        providersPool.splice(providerIndex, 1);
        
        // Update the providers pool in the chaincode state
        await ctx.stub.putState('providersPool', Buffer.from(JSON.stringify(providersPool)));
        
        // Delete the provider's specific state
        await ctx.stub.deleteState(providerId);
        
        return `Provider with id ${providerId} has been deleted`;
    }

    // ± allow the witness to delete its profile
    async deleteWitness(ctx) {
        var witnessId = ctx.clientIdentity.getID();

        // Get the witnesses pool from chaincode state
        const serviceAsBytes = await ctx.stub.getState('witnessesPool'); 
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error('Witnesses pool does not exist');
        }
        
        // Parse the witnesses pool
        const witnessesPool = JSON.parse(serviceAsBytes.toString());
        
        // Find the witness to delete
        const witnessIndex = witnessesPool.findIndex(witness => witness.witnessID === witnessId);
        if (witnessIndex === -1) {
            throw new Error(`Witness with id ${witnessId} does not exist`);
        }
        
        // Remove the witness from the witnesses pool
        witnessesPool.splice(witnessIndex, 1);
        
        // Update the witnesses pool in the chaincode state
        await ctx.stub.putState('witnessesPool', Buffer.from(JSON.stringify(witnessesPool)));
        
        // Delete the witness's specific state
        await ctx.stub.deleteState(witnessId);
        
        return `Witness with id ${witnessId} has been deleted`;
    }

    // ± allow the customer to delete its profile
    async deleteCustomer(ctx) {
        var customerId = ctx.clientIdentity.getID();

        // Get the customers pool from chaincode state
        const serviceAsBytes = await ctx.stub.getState('customersPool'); 
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error('Customers pool does not exist');
        }
        
        // Parse the customers pool
        const customersPool = JSON.parse(serviceAsBytes.toString());
        
        // Find the customer to delete
        const customerIndex = customersPool.findIndex(customer => customer.customerID === customerId);
        if (customerIndex === -1) {
            throw new Error(`Customer with id ${customerId} does not exist`);
        }
        
        // Remove the customer from the customers pool
        customersPool.splice(customerIndex, 1);
        
        // Update the customers pool in the chaincode state
        await ctx.stub.putState('customersPool', Buffer.from(JSON.stringify(customersPool)));
        
        // Delete the customer's specific state
        await ctx.stub.deleteState(customerId);
        
        return `Customer with id ${customerId} has been deleted`;
    }



    async queryUserData(ctx) {
        var user = ctx.clientIdentity.getID();
        const serviceAsBytes = await ctx.stub.getState(user); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${user} does not exist`);
        }
        console.log(serviceAsBytes.toString());
        return serviceAsBytes.toString();
    }

    async addBalance(ctx, plus) {
        var userID = ctx.clientIdentity.getID();
        const serviceAsBytes = await ctx.stub.getState(userID); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${user} does not exist`);
        }
        var user = JSON.parse(serviceAsBytes.toString());
        user.accountBalance.amount = parseInt(user.accountBalance.amount) + parseInt(plus);
        await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
    }

    async withdrawBalance(ctx, minus) {
        var userID = ctx.clientIdentity.getID();
        const serviceAsBytes = await ctx.stub.getState(userID); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${user} does not exist`);
        }
        var user = JSON.parse(serviceAsBytes.toString());
        user.accountBalance.amount = parseInt(user.accountBalance.amount) - parseInt(minus);
        await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
    }

    async addFunds(ctx, userID, plus) {
        const serviceAsBytes = await ctx.stub.getState(userID); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${user} does not exist`);
        }
        var user = JSON.parse(serviceAsBytes.toString());
        user.accountBalance.amount = parseFloat(user.accountBalance.amount) + parseFloat(plus);
        await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
    }

    async withdrawFunds(ctx, userID, minus) {
        const serviceAsBytes = await ctx.stub.getState(userID); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${user} does not exist`);
        }
        var user = JSON.parse(serviceAsBytes.toString());
        user.accountBalance.amount = parseInt(user.accountBalance.amount) - parseInt(minus);
        await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
    }

    async loginWitness(ctx) {
        const serviceAsBytes = await ctx.stub.getState('witnessesPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`Witness pool does not exist`); // ± serviceNumber not defined, replaced with returning string message instead
        }
        const witnessesPool = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        for (var i = 0; i < witnessesPool.length; i++) {
            if (owner == witnessesPool[i].witnessID) {
                witnessesPool[i].state = "online";
            }
        }
        await ctx.stub.putState('witnessesPool', Buffer.from(JSON.stringify(witnessesPool)));
        console.log(serviceAsBytes.toString());
    }

    async submitAuction(ctx, auctionNumber, auctionObject) {
        var owner = ctx.clientIdentity.getID();
        console.info('============= START : Create Auction ===========');
        const auction = {
            docType: 'auction',
            auctionObject,
            owner,
            bids: [],
            active: true
        };
        await ctx.stub.putState('auction' + auctionNumber, Buffer.from(JSON.stringify(auction)));
        const serviceAsBytes = await ctx.stub.getState(owner); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`User does not exist`); // ± serviceNumber not defined, replaced with returning string message instead
        }
        var user = JSON.parse(serviceAsBytes.toString());
        user.myAuctions.push('auction' + auctionNumber);
        await ctx.stub.putState(owner, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create Auction ===========');
    }

    // We added this function which only submits the auction object onto the ledger without updating the user data
    // This was necessary since when benchmarking the submitAuction, it would give ±
    async submitAuctionWithoutUserDataUpdate(ctx, auctionNumber, auctionObject) {
        var owner = ctx.clientIdentity.getID();
        const auction = {
            docType: 'auction',
            auctionObject,
            owner,
            bids: [],
            active: true
        };
        await ctx.stub.putState('auction' + auctionNumber, Buffer.from(JSON.stringify(auction)));
    }


    async submitBid(ctx, key, bid) {
        const serviceAsBytes = await ctx.stub.getState(key); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`Auction ID does not exist`); // ± serviceNumber not defined, replaced with returning string message instead
        }
        const auction = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        let bidItem = {
            "customerID": owner,
            "bid": bid
        }
        if (auction.active == true) {
            auction.bids.push(bidItem);
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(auction)));
        }
        console.log(serviceAsBytes.toString());
    }

    async queryService(ctx, serviceNumber) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        console.log(serviceAsBytes.toString());
        return serviceAsBytes.toString();
    }

    async queryAllServicesAsOwner(ctx) {
        var invokeID = ctx.clientIdentity.getID();
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.owner == invokeID) {
                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryServiceAsCustomer(ctx, serviceNumber) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());
        let auctionObject = JSON.parse(service.auctionObject);
        if (auctionObject.auctionRules.auctionType == 'fpsb' || auctionObject.auctionRules.auctionType == 'spsb') {
            service.bids = ['hidden'];
        }
        if (service.active == true) {
            return JSON.stringify(service);
        }
    }

    async queryAllServicesAsCustomer(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            let auctionObject;
            try {
                record = JSON.parse(strValue);
                auctionObject = JSON.parse(record.auctionObject);
                if (auctionObject.auctionRules.auctionType == 'fpsb' || auctionObject.auctionRules.auctionType == 'spsb') {
                    record.bids = ['hidden'];
                }
                //if (record.auctionInfo.hideReserve == true) {
                //  record.auctionInfo.pricing.pricingReserve = "hidden";
                //}
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.active == true) {
                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllSLAs(ctx) {
        var invokeID = ctx.clientIdentity.getID();
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla' && ((record.customer == invokeID) || (record.provider == invokeID))) {
                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryMySLAsAsWitness(ctx) {
        var invokeID = ctx.clientIdentity.getID();
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla') {
                for (var i = 0; i < record.witnesses.length; i++) {
                    if (record.witnesses[i].witnessID == invokeID) {
                        allResults.push({
                            Key: key,
                            Record: record
                        });
                    }
                }
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllActiveSLAs(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.docType == 'sla') {
                if (!record.ended) {
                    allResults.push({
                        Key: key,
                        Record: record
                    });
                }
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryAllServices(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {
            key,
            value
        } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({
                Key: key,
                Record: record
            });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async endAuction(ctx, serviceNumber, slaID) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());
        const auctionObject = JSON.parse(service.auctionObject);
        if (service.active == true && service.bids.length > 0) {
            if (auctionObject.auctionRules.auctionType == 'english' || auctionObject.auctionRules.auctionType == 'fpsb') {
                var biggest = 0;
                var biggestBid = {};
                var bid = {};
                for (var i = 0; i < service.bids.length; i++) {
                    bid = JSON.parse(service.bids[i].bid);
                    bid.owner = service.bids[i].customerID;
                    if (parseInt(bid.pricing.bidAmount) > biggest) {
                        biggest = parseInt(bid.pricing.bidAmount);
                        biggestBid = bid;
                    }
                }
                var provider = service.owner;
                var customer = biggestBid.owner;
                var sla = {
                    docType: 'sla',
                    biggestBid,
                    provider,
                    customer,
                    auctionObject,
                    witnesses: [],
                    ended: false
                };
                sla = await this.addWitnessesToSLA(ctx, sla);
                await this.addSLAToUsers(ctx, sla, slaID);
                sla = await this.setSLAdeadline(ctx, sla);
                await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));

                // auction end event ±
                let registerEvent = {
                    type: "auction has ended",
                    highestBid: biggestBid,
                    theprovider: provider,
                    thecustomer: customer,
                    auctobject: auctionObject

                };
                await ctx.stub.setEvent('auctionEnd', Buffer.from(JSON.stringify(registerEvent)));

                service.active = "awaiting provisioning";
                await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            } else if (auctionObject.auctionRules.auctionType == 'spsb') {
                var biggest = 0;
                var biggestBid = {};
                var bid = {};
                var sortBids = [];
                for (var i = 0; i < service.bids.length; i++) {
                    bid = JSON.parse(service.bids[i].bid);
                    bid.owner = service.bids[i].customerID;
                    sortBids.push(bid);
                }
                sortBids.sort(function(a, b) {
                    return parseFloat(b.pricing.bidAmount) - parseFloat(a.pricing.bidAmount);
                });
                biggestBid = sortBids[0];
                if (sortBids[1]) {
                    biggestBid.pricing.bidAmount = sortBids[1].pricing.bidAmount;
                }
                var provider = service.owner;
                var customer = biggestBid.owner;
                var sla = {
                    docType: 'sla',
                    biggestBid,
                    provider,
                    customer,
                    auctionObject,
                    ended: false
                };
                sla = await this.addWitnessesToSLA(ctx, sla);
                await this.addSLAToUsers(ctx, sla, slaID);
                sla = await this.setSLAdeadline(ctx, sla);
                await ctx.stub.putState('sla' + slaID, Buffer.from(JSON.stringify(sla)));

                // auction end event ±
                let registerEvent = {
                    type: "auction has ended",
                    highestBid: biggestBid,
                    theprovider: provider,
                    thecustomer: customer,
                    auctobject: auctionObject
                    
                };
                await ctx.stub.setEvent('auctionEnd', Buffer.from(JSON.stringify(registerEvent)));
                service.active = "awaiting provisioning";
                await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
            }
        } else { // this is wrong, this is bad logic, this is never called
            // auction end event ±
            let registerEvent = {
                type: "auction has ended",
                highestBid: biggestBid,
                theprovider: provider,
                thecustomer: customer,
                auctobject: auctionObject
            };
            await ctx.stub.setEvent('auctionEnd', Buffer.from(JSON.stringify(registerEvent)));
            service.active = "awaiting provisioning";
            await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));
        }
        return JSON.stringify(service);
    }

    // ± set auction to false
    async deactivateService(ctx, serviceNumber) {
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());

        if(service.active !== "pending") {
            throw new Error(`Service ${serviceNumber} is not in a pending state and cannot be deactivated.`);
        }

        service.active = false;
        await ctx.stub.putState(serviceNumber, Buffer.from(JSON.stringify(service)));

        return JSON.stringify(service);
    }

    async queryServiceActiveStatus(ctx, serviceNumber) { // ±
        const serviceAsBytes = await ctx.stub.getState(serviceNumber); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const service = JSON.parse(serviceAsBytes.toString());

        return service.active;
    }



    async setSLAdeadline(ctx, sla) {
        var dateTimestamp = ctx.stub.getDateTimestamp();
        var days = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.days);
        var hours = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.hours);
        var minutes = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.minutes);
        var seconds = parseInt(sla.auctionObject.service.witnessGlobalRules.witnessGamePeriod.seconds);
        dateTimestamp.setDate(dateTimestamp.getDate() + days);
        dateTimestamp.setHours(dateTimestamp.getHours() + hours);
        dateTimestamp.setMinutes(dateTimestamp.getMinutes() + minutes);
        dateTimestamp.setSeconds(dateTimestamp.getSeconds() + seconds);
        sla.auctionObject.service.witnessGlobalRules.slaDeadline = dateTimestamp;
        return sla;
    }

    async addSLAToUsers(ctx, sla, slaID) {
        //provider
        var serviceFee = sla.biggestBid.pricing.bidAmount;
        const serviceAsBytes = await ctx.stub.getState(sla.provider); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${sla.provider} does not exist`);
        }
        var provider = JSON.parse(serviceAsBytes.toString());
        provider.mySLAs.push('sla' + slaID);
        //await this.addFunds(ctx, sla.provider, serviceFee);
        provider.accountBalance.amount = parseInt(provider.accountBalance.amount) + parseInt(serviceFee);
        await ctx.stub.putState(sla.provider, Buffer.from(JSON.stringify(provider)));
        //customer
        const serviceAsBytes1 = await ctx.stub.getState(sla.customer); // get the service from chaincode state
        if (!serviceAsBytes1 || serviceAsBytes1.length === 0) {
            throw new Error(`${sla.customer} does not exist`);
        }
        var customer = JSON.parse(serviceAsBytes1.toString());
        customer.mySLAs.push('sla' + slaID);
        //await this.withdrawFunds(ctx, sla.customer, serviceFee);
        customer.accountBalance.amount = parseInt(customer.accountBalance.amount) - parseInt(serviceFee);
        await ctx.stub.putState(sla.customer, Buffer.from(JSON.stringify(customer)));
        //witnesses
        for (var i = 0; i < sla.witnesses.length; i++) {
            var witnessID = sla.witnesses[i].witnessID;
            await this.addSLAToWitness(ctx, witnessID, slaID)
        }
    }

    async addSLAToWitness(ctx, witnessID, slaID) {
        const serviceAsBytes = await ctx.stub.getState(witnessID); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${sla.provider} does not exist`);
        }
        var witness = JSON.parse(serviceAsBytes.toString());
        witness.mySLAs.push('sla' + slaID);
        await ctx.stub.putState(witnessID, Buffer.from(JSON.stringify(witness)));
    }

    async addWitnessesToSLA(ctx, sla) { //not defined for some reason
        const serviceAsBytes = await ctx.stub.getState('witnessesPool'); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`Witness pool does not exist`); // ± serviceNumber not defined, replaced with returning string message instead
        }
        const witnessesPool = JSON.parse(serviceAsBytes.toString());
        //sla.witnesses = witnessesPool
        sla.witnesses = await this.getRandomWitnesses(witnessesPool, parseInt(sla.auctionObject.service.witnessGlobalRules.n));
        var sloDeadline = ctx.stub.getDateTimestamp();
        var startTime = sloDeadline;
        sla.auctionObject.service.sloRulesAndFines.startTime = startTime;
        for (var i = 0; i < sla.auctionObject.service.sloRulesAndFines.length; i++) {
            sla.auctionObject.service.sloRulesAndFines[i].sloVotingBuckets = [];
            sla.auctionObject.service.sloRulesAndFines[i].sloDeadline = sloDeadline;
        }
        //sla.n = sla.auctionObject.service.witnessGlobalRules.n;
        //sla.test = (parseInt(sla.auctionObject.service.witnessGlobalRules.n) + 2).toString();
        return sla;
        //add math.random choose witnesses
    }

    //end SLO payout

    //end SLA payout
    async endSLA(ctx, slaKey) {
        const serviceAsBytes = await ctx.stub.getState(slaKey); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        var sla = JSON.parse(serviceAsBytes.toString());
        if (sla.ended == true) {
            return
        }
        sla.ended = true;
        var sloRulesAndFines = sla.auctionObject.service.sloRulesAndFines;
        var userPayouts = {
            provider: {
                id: sla.provider,
                payout: 0
            },
            customer: {
                id: sla.customer,
                payout: 0
            },
            witnesses: [],
            totalReward: 0
        };
        //console.log(sla.witnesses);
        for (var i = 0; i < sla.witnesses.length; i++) {
            var witnessID = sla.witnesses[i].witnessID;
            var witness = {
                id: witnessID,
                payout: 0
            };
            userPayouts.witnesses.push(witness);
        }
        var witnessGlobalRules = sla.auctionObject.service.witnessGlobalRules;
        for (var i = 0; i < sloRulesAndFines.length; i++) {
            var slo = sloRulesAndFines[i];
            for (var j = 0; j < slo.sloVotingBuckets.length; j++) {
                var bucket = slo.sloVotingBuckets[j];
                if (bucket.length >= witnessGlobalRules.m) {
                    //console.log(i+" "+bucket+" violated");
                    userPayouts = await this.sloViolated(slo, bucket, userPayouts);
                } else if (bucket.length < witnessGlobalRules.m) {
                    //console.log(i+" "+bucket+" not violated");
                    userPayouts = await this.sloNotViolated(slo, bucket, userPayouts);
                }
            }
        }
        userPayouts.customer.payout = parseFloat(userPayouts.customer.payout) - (parseFloat(sla.auctionObject.service.witnessGlobalRules.cFee) * 0.01 * parseFloat(userPayouts.totalReward));
        userPayouts.provider.payout = parseFloat(userPayouts.provider.payout) - (parseFloat(sla.auctionObject.service.witnessGlobalRules.pFee) * 0.01 * parseFloat(userPayouts.totalReward));
        sla.userPayouts = userPayouts;
        await this.addFunds(ctx, userPayouts.provider.id, userPayouts.provider.payout);
        await this.addFunds(ctx, userPayouts.customer.id, userPayouts.customer.payout);
        for (var i = 0; i < userPayouts.witnesses.length; i++) {
          await this.addFunds(ctx, userPayouts.witnesses[i].id, userPayouts.witnesses[i].payout);
        }
        await ctx.stub.putState(slaKey, Buffer.from(JSON.stringify(sla)));
        //await this.slaPayout(ctx, slaKey);
    }

    async sloViolated(slo, bucket, userPayouts) {
        userPayouts.provider.payout = parseFloat(userPayouts.provider.payout) - parseFloat(slo.ruleFine);
        userPayouts.customer.payout = parseFloat(userPayouts.customer.payout) + parseFloat(slo.ruleFine);
        var witnessArr = [];
        for (var i = 0; i < userPayouts.witnesses.length; i++) {
            witnessArr.push(userPayouts.witnesses[i].id);
        }
        var rewardArr = bucket;
        var punishmentArr = witnessArr.filter(x => !bucket.includes(x));
        for (var i = 0; i < rewardArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (rewardArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) + parseFloat(slo.sloWitnessConfig.rewardViolation);
                    userPayouts.totalReward = parseFloat(userPayouts.totalReward) + parseFloat(slo.sloWitnessConfig.rewardViolation);
                }
            }
        }
        for (var i = 0; i < punishmentArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (punishmentArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) - parseFloat(slo.sloWitnessConfig.punishmentViolation);
                    userPayouts.customer.payout = parseFloat(userPayouts.customer.payout) + parseFloat(slo.sloWitnessConfig.punishmentViolation);
                }
            }
        }
        return userPayouts;
    }

    async sloNotViolated(slo, bucket, userPayouts) {
        var witnessArr = [];
        for (var i = 0; i < userPayouts.witnesses.length; i++) {
            witnessArr.push(userPayouts.witnesses[i].id);
        }
        var punishmentArr = bucket;
        var rewardArr = witnessArr.filter(x => !bucket.includes(x));
        for (var i = 0; i < rewardArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (rewardArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) + parseFloat(slo.sloWitnessConfig.rewardNoViolation);
                    userPayouts.totalReward = parseFloat(userPayouts.totalReward) + parseFloat(slo.sloWitnessConfig.rewardNoViolation);
                }
            }
        }
        for (var i = 0; i < punishmentArr.length; i++) {
            for (var j = 0; j < userPayouts.witnesses.length; j++) {
                if (punishmentArr[i] == userPayouts.witnesses[j].id) {
                    userPayouts.witnesses[j].payout = parseFloat(userPayouts.witnesses[j].payout) - parseFloat(slo.sloWitnessConfig.punishmentNoViolation);
                    userPayouts.provider.payout = parseFloat(userPayouts.provider.payout) + parseFloat(slo.sloWitnessConfig.punishmentNoViolation);
                }
            }
        }
        return userPayouts;
    }

    async submitWitnessVote(ctx, slaKey, slo) {
        const serviceAsBytes = await ctx.stub.getState(slaKey); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        var sla = JSON.parse(serviceAsBytes.toString());
        var voteTimestamp = ctx.stub.getDateTimestamp();
        var sloDeadline = new Date(sla.auctionObject.service.sloRulesAndFines[slo].sloDeadline);
        var witness = ctx.clientIdentity.getID();
        //add check if witness is one of the monitoring witnesses -- still wip
        var falseWitness = true;
        for (var i = 0; i < sla.witnesses.length; i++) {
            if (sla.witnesses[i].witnessID == witness) {
                falseWitness = false;
            }
        }
        if (falseWitness) {
            return;
        }
        var distance = sloDeadline - voteTimestamp;
        var sloVotingBuckets = sla.auctionObject.service.sloRulesAndFines[slo].sloVotingBuckets;
        if (distance > 0) {
            for (var i = 0; i < sloVotingBuckets[sloVotingBuckets.length - 1].length; i++) {
                //if (sloVotingBuckets[sloVotingBuckets.length - 1][i].witness == witness) {
                if (sloVotingBuckets[sloVotingBuckets.length - 1][i] == witness) {
                    return;
                }
            }
        } else {
            sloVotingBuckets.push([]);
        }
        /*var vote = {
          witness,
          voteTimestamp
        }*/
        sloVotingBuckets[sloVotingBuckets.length - 1].push(witness);
        sla.auctionObject.service.sloRulesAndFines[slo].sloVotingBuckets = sloVotingBuckets;
        sla = await this.changeSloDeadline(ctx, voteTimestamp, sla, slo);
        await ctx.stub.putState(slaKey, Buffer.from(JSON.stringify(sla)));
    }

    async changeSloDeadline(ctx, voteTimestamp, sla, slo) {
        var hours = parseInt(sla.auctionObject.service.sloRulesAndFines[slo].sloWitnessConfig.tPeriod.hours);
        var minutes = parseInt(sla.auctionObject.service.sloRulesAndFines[slo].sloWitnessConfig.tPeriod.minutes);
        var seconds = parseInt(sla.auctionObject.service.sloRulesAndFines[slo].sloWitnessConfig.tPeriod.seconds);
        voteTimestamp.setHours(voteTimestamp.getHours() + hours);
        voteTimestamp.setMinutes(voteTimestamp.getMinutes() + minutes);
        voteTimestamp.setSeconds(voteTimestamp.getSeconds() + seconds);
        sla.auctionObject.service.sloRulesAndFines[slo].sloDeadline = voteTimestamp;
        return sla;
    }

    //https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
    //random elements from array
    async getRandomWitnesses(arr, n) {
        var result = new Array(n);
        var len = arr.length;
        var taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    async submitWitness(ctx, key) {
        /*here add 2 conditions
        1. witnesses can only be added if maximal number of witnesses not reached
        2. only witness not already added can be added
        */
        const serviceAsBytes = await ctx.stub.getState(key); // get the service from chaincode state
        if (!serviceAsBytes || serviceAsBytes.length === 0) {
            throw new Error(`${serviceNumber} does not exist`);
        }
        const sla = JSON.parse(serviceAsBytes.toString());
        var owner = ctx.clientIdentity.getID();
        var bool = true;
        //let auctionObject = JSON.parse(sla.auctionObject);
        /*  if(sla.witnesses.length >= parseInt(sla.auctionObject.service.witnessGlobalRules.n)){
            bool = false;
          }
          for (var i = 0; i < sla.witnesses.length; i++) {
            if(owner == witnesses[i]){
              bool = false;
            }
          }*/
        if (bool) {
            sla.witnesses.push(owner);
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
        }
        console.log(serviceAsBytes.toString());
    }

    // ± delete all auctions associated to the clientIdentity
    async deleteAllAuctions(ctx) {
        const ownerId = ctx.clientIdentity.getID();
        const userAsBytes = await ctx.stub.getState(ownerId);

        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User does not exist`);
        }

        const user = JSON.parse(userAsBytes.toString());
        
        if (!user.myAuctions || user.myAuctions.length === 0) {
            return; // there is no auction to be deleted
        }

        // go through all the auctions and delete them
        for (const auctionId of user.myAuctions) {
            const auctionAsBytes = await ctx.stub.getState(auctionId);
            if (auctionAsBytes && auctionAsBytes.length > 0) {
                await ctx.stub.deleteState(auctionId);
            }
        }

        user.myAuctions = [];
        await ctx.stub.putState(ownerId, Buffer.from(JSON.stringify(user)));
    }


    // ----------------- ± Openstack


    async updateOpenstackInstances(ctx, instancesJson) {
        const ownerId = ctx.clientIdentity.getID();
        const key = `${ownerId}:serverList`; // create key
        await ctx.stub.putState(key, Buffer.from(instancesJson));
        return JSON.stringify({result: 'SUCCESS'});
    }


    async queryOpenstackInstances(ctx) {
        const ownerId = ctx.clientIdentity.getID();
        const key = `${ownerId}:serverList`; // create composite key
        const instancesJson = await ctx.stub.getState(key);
        if (!instancesJson || instancesJson.length === 0) {
            throw new Error(`No instances found for ${key}`);
        }
        return instancesJson.toString();
    }

    // The encryptiona and decryption happens on the client side (node application)
    // Store encrypted SSH Credentials
    async storeSSHCredentials(ctx, uniqueKey, encryptedCredentials) {
        await ctx.stub.putState(uniqueKey, Buffer.from(encryptedCredentials));
        return JSON.stringify({result: 'SUCCESS'});
    }

    // Retrieve encrypted SSH Credentials
    async retrieveSSHCredentials(ctx, uniqueKey) {
        let encryptedCredentials = await ctx.stub.getState(uniqueKey);
        if (!encryptedCredentials || encryptedCredentials.length === 0) {
            throw new Error(`No SSH credentials found for ${uniqueKey}`);
        }
        return encryptedCredentials.toString();
    }



}

module.exports = Awesome;
