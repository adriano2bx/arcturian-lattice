import test from 'node:test';import assert from 'node:assert/strict';
import {OpenMeteoProvider} from '../src/providers/openmeteo.js';
import {CrossrefProvider} from '../src/providers/crossref.js';
import {RipeStatProvider,PeeringDbProvider} from '../src/providers/network-intel.js';
import {QueridoDiarioProvider} from '../src/providers/querido-diario.js';
import {GdeltProvider} from '../src/providers/gdelt.js';
const enabled=process.env.LIVE_TEST==='1';

test('live Open-Meteo', {skip:!enabled}, async()=>{const r=await new OpenMeteoProvider().forecast({latitude:-23.1791,longitude:-45.8872,days:1});assert.equal(r.ok,true,JSON.stringify(r));});
test('live Crossref', {skip:!enabled}, async()=>{const r=await new CrossrefProvider().searchWorks({query:'artificial intelligence',limit:1});assert.equal(r.ok,true,JSON.stringify(r));assert.ok(r.works.length>=1);});
test('live RIPEstat', {skip:!enabled}, async()=>{const r=await new RipeStatProvider().networkInfo('1.1.1.1');assert.equal(r.ok,true,JSON.stringify(r));});
test('live PeeringDB', {skip:!enabled}, async()=>{const r=await new PeeringDbProvider().networkByAsn(13335);assert.equal(r.ok,true,JSON.stringify(r));});
test('live Querido Diario company info', {skip:!enabled}, async()=>{const r=await new QueridoDiarioProvider().company('00000000000191');assert.ok(r.ok||r.reason==='not_found',JSON.stringify(r));});
test('live GDELT', {skip:!enabled}, async()=>{const r=await new GdeltProvider().search({query:'telecom',timespan:'1week',limit:1});assert.equal(r.ok,true,JSON.stringify(r));});
