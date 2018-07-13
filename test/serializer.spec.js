/*
   Copyright 2018 Smart-Tech Controle e Automação

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
/*jshint esversion: 6, node: true, mocha: true */
'use strict';

const {
    expect
} = require('chai');
const ISOOnTCPSerializer = require('../src/serializer.js');
const constants = require('../src/constants.json');
const Stream = require('stream');

describe('ISO-on-TCP Serializer', () => {

    it('should be a stream', () => {
        expect(new ISOOnTCPSerializer()).to.be.instanceOf(Stream);
    });

    it('should create a new instance', () => {
        expect(new ISOOnTCPSerializer).to.be.instanceOf(Stream); //jshint ignore:line
    });

    it('should throw if object has no type', (done) => {
        let serializer = new ISOOnTCPSerializer();
        serializer.on('error', (err) => {
            expect(err).to.be.an('error');
            done();
        });

        serializer.write({
            //type: constants.tpdu_type.DT,
            last_data_unit: true,
            payload: Buffer.from('32010000000000080000f0000008000803c0', 'hex')
        });
    });

    it('should throw if a payload is not a Buffer', (done) => {
        let serializer = new ISOOnTCPSerializer();
        serializer.on('error', (err) => {
            expect(err).to.be.an('error');
            done();
        });

        serializer.write({
            type: constants.tpdu_type.DT,
            last_data_unit: true,
            //payload: Buffer.from('32010000000000080000f0000008000803c0', 'hex')
            payload: '32010000000000080000f0000008000803c0'
        });
    });

    it('should encode a Data (DT) message', (done) => {
        let serializer = new ISOOnTCPSerializer();
        serializer.on('data', (data) => {
            // TPKT + COTP + Payload
            expect(data.toString('hex')).to.be.equal('03000019' + '02f080' + '32010000000000080000f0000008000803c0');
            done();
        });

        serializer.write({
            type: constants.tpdu_type.DT,
            last_data_unit: true,
            payload: Buffer.from('32010000000000080000f0000008000803c0', 'hex')
        });
    });

    it('should encode a Connection Request (CR) message', (done) => {
        let serializer = new ISOOnTCPSerializer();
        serializer.on('data', (data) => {
            // TPKT + COTP + Payload
            expect(data.toString('hex')).to.be.equal('03000016' + '11e00000000200c0010ac1020100c2020102');
            done();
        });

        serializer.write({
            type: 0x0e, //CR
            destination: 0,
            source: 2,
            //class: 0,
            //extended_format: false,
            //no_flow_control: false,
            tpdu_size: 1024,
            srcTSAP: 0x0100,
            dstTSAP: 0x0102
        });
    });

    it('should encode a Connection Confirm (CC) message', (done) => {
        let serializer = new ISOOnTCPSerializer();
        serializer.on('data', (data) => {
            // TPKT + COTP + Payload
            expect(data.toString('hex')).to.be.equal('03000016' + '11d00002443100c0010ac1020100c2020102');
            done();
        });

        serializer.write({
            type: 0x0d, //CC
            destination: 2,
            source: 0x4431,
            //class: 0,
            //extended_format: false,
            //no_flow_control: false,
            tpdu_size: 1024,
            srcTSAP: 0x0100,
            dstTSAP: 0x0102
        });
    });
});