import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeCdx,WaybackProvider} from '../src/providers/wayback.js';
import {detectTechnologies} from '../src/providers/technology.js';
import {auditHtml} from '../src/providers/seo-audit.js';
import {SearxngProvider} from '../src/providers/searxng.js';
import {OpenAlexProvider} from '../src/providers/openalex.js';
import {CrossrefProvider} from '../src/providers/crossref.js';
import {GdeltProvider} from '../src/providers/gdelt.js';
import {QueridoDiarioProvider} from '../src/providers/querido-diario.js';
import {GleifProvider} from '../src/providers/gleif.js';
import {OpenMeteoProvider} from '../src/providers/openmeteo.js';
import {YouTubeProvider} from '../src/providers/youtube.js';
import {RedditProvider} from '../src/providers/reddit.js';
import {BcbProvider} from '../src/providers/bcb.js';
import {SecProvider} from '../src/providers/sec.js';
import {IbgeSidraProvider} from '../src/providers/ibge-sidra.js';
import {TrafficEstimatorService} from '../src/services/traffic-estimator.js';
import {MonitorService} from '../src/services/monitor.js';

const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json'}});

test('Wayback normalizes CDX rows and builds a domain wildcard query',async()=>{assert.equal(normalizeCdx([['timestamp','original','statuscode'],['20260101000000','https://x.test/', '200']])[0].status,200);let seen;const p=new WaybackProvider({fetchFn:async u=>{seen=new URL(u);return json([['timestamp','original','statuscode','mimetype','digest']]);}});await p.history('x.test',{limit:9});assert.equal(seen.searchParams.get('url'),'x.test/*');assert.equal(seen.searchParams.get('limit'),'9');});

test('technology detector identifies common marketing stack signatures',()=>{const h=new Headers({'server':'cloudflare'});const out=detectTechnologies('<script src="https://www.googletagmanager.com/gtm.js"></script><div>wp-content</div>',h);assert.ok(out.includes('WordPress'));assert.ok(out.includes('Google Tag Manager'));assert.ok(out.includes('Cloudflare'));});

test('SEO audit is deterministic and surfaces technical issues',()=>{const h=new Headers();const out=auditHtml('<html><head><title>X</title></head><body><h1>A</h1><img src="x"></body></html>',{status:200,headers:h},'https://x.test/');assert.ok(out.issues.includes('missing_meta_description'));assert.ok(out.issues.includes('missing_canonical'));assert.ok(out.issues.some(x=>x.startsWith('images_missing_alt')));assert.ok(out.score>=0&&out.score<=100);});

test('SearXNG explicitly reports not configured and constructs JSON search when configured',async()=>{assert.equal((await new SearxngProvider({baseUrl:null}).search({query:'x'})).reason,'not_configured');let seen;const p=new SearxngProvider({baseUrl:'https://search.test',fetchFn:async u=>{seen=new URL(u);return json({results:[{title:'A',url:'https://a.test',content:'B'}]});}});const r=await p.search({query:'telefonia',limit:1});assert.equal(r.results.length,1);assert.equal(seen.searchParams.get('format'),'json');});

test('research providers normalize OpenAlex and Crossref',async()=>{const oa=new OpenAlexProvider({fetchFn:async()=>json({meta:{count:1},results:[{id:'W1',display_name:'Paper',publication_year:2026,cited_by_count:3,authorships:[]} ]})});assert.equal((await oa.searchWorks({query:'ai'})).works[0].title,'Paper');const cr=new CrossrefProvider({fetchFn:async()=>json({message:{'total-results':1,items:[{DOI:'10/x',title:['Paper 2'],author:[]}]}})});assert.equal((await cr.searchWorks({query:'ai'})).works[0].doi,'10/x');});

test('GDELT builds artlist JSON query',async()=>{let seen;const p=new GdeltProvider({fetchFn:async u=>{seen=new URL(u);return json({articles:[]});}});await p.search({query:'acme',timespan:'1week'});assert.equal(seen.searchParams.get('mode'),'artlist');assert.equal(seen.searchParams.get('format'),'json');});

test('Querido Diario company endpoints strip CNPJ punctuation',async()=>{const urls=[];const p=new QueridoDiarioProvider({baseUrl:'https://qd.test',fetchFn:async u=>{urls.push(u);return json({});}});await p.company('00.000.000/0001-91');await p.partners('00.000.000/0001-91');assert.match(urls[0],/company\/info\/00000000000191$/);assert.match(urls[1],/company\/partners\/00000000000191$/);});

test('GLEIF uses legal-name filter',async()=>{let seen;const p=new GleifProvider({fetchFn:async u=>{seen=new URL(u);return json({data:[]});}});await p.searchByName('ACME',{limit:3});assert.equal(seen.searchParams.get('filter[entity.legalName]'),'ACME');assert.equal(seen.searchParams.get('page[size]'),'3');});

test('Open-Meteo requests forecast fields and clamps days',async()=>{let seen;const p=new OpenMeteoProvider({fetchFn:async u=>{seen=new URL(u);return json({});}});await p.forecast({latitude:-23,longitude:-45,days:30});assert.equal(seen.searchParams.get('forecast_days'),'16');assert.ok(seen.searchParams.get('current').includes('temperature_2m'));});

test('YouTube uses self-hosted transcript before any optional external fallback',async()=>{let seen;const p=new YouTubeProvider({transcriptBaseUrl:'https://yt.test',allowKomeFallback:false,fetchFn:async (u,init)=>{seen={u,body:JSON.parse(init.body)};return json({text:'ok'});}});const r=await p.transcript('https://youtube.com/watch?v=x');assert.equal(r.ok,true);assert.equal(r.source,'self_hosted_transcript');assert.equal(seen.u,'https://yt.test/transcript');});

test('YouTube transcript fails explicitly when no provider is configured',async()=>{const r=await new YouTubeProvider({allowKomeFallback:false}).transcript('https://youtube.com/watch?v=x');assert.equal(r.ok,false);assert.equal(r.reason,'transcript_provider_not_configured');});

test('Reddit public search normalizes posts',async()=>{const p=new RedditProvider({fetchFn:async()=>json({data:{children:[{data:{id:'1',title:'T',subreddit:'x',permalink:'/r/x/1'}}]}})});const r=await p.search({query:'x'});assert.equal(r.posts[0].permalink,'https://www.reddit.com/r/x/1');});

test('BCB converts ISO dates to SGS Brazilian date format',async()=>{let seen;const p=new BcbProvider({fetchFn:async u=>{seen=new URL(u);return json([]);}});await p.series({code:1,dateFrom:'2026-09-01',dateTo:'2026-09-10'});assert.equal(seen.searchParams.get('dataInicial'),'01/09/2026');});

test('SEC pads CIK and sends configured User-Agent',async()=>{let seen;const p=new SecProvider({userAgent:'Nexus contact@example.com',fetchFn:async (u,i)=>{seen={u,i};return json({});}});await p.companyFacts('320193');assert.match(seen.u,/CIK0000320193\.json$/);assert.equal(seen.i.headers['user-agent'],'Nexus contact@example.com');});

test('IBGE SIDRA provider constrains route fragments',async()=>{let seen;const p=new IbgeSidraProvider({fetchFn:async u=>{seen=u;return json([]);}});await p.table({table:6579,level:6,territories:'3549904',periods:'last',variables:'9324'});assert.match(seen,/\/t\/6579\/n6\/3549904\/p\/last\/v\/9324$/);});

test('traffic estimator never invents an estimate without a calibrated local model',async()=>{const r=await new TrafficEstimatorService({db:null}).estimate('example.com');assert.equal(r.ok,false);assert.equal(r.reason,'dataset_not_configured');assert.equal(r.meta.estimated,true);});

test('continuous intelligence tools fail explicitly without D1 rather than pretending persistence',async()=>{const s=new MonitorService({db:null});assert.equal((await s.list()).reason,'dataset_not_configured');assert.equal((await s.create({name:'x',type:'web_profile',target:'x.test'})).ok,false);});

import {RipeStatProvider,PeeringDbProvider} from '../src/providers/network-intel.js';
import {CertificateTransparencyProvider} from '../src/providers/certificate-transparency.js';
import {NominatimProvider} from '../src/providers/nominatim.js';
import {SitemapProvider} from '../src/providers/sitemap.js';

test('RIPEstat and PeeringDB construct public network queries',async()=>{let a,b;await new RipeStatProvider({fetchFn:async u=>{a=new URL(u);return json({status:'ok',data:{asns:['1'],prefix:'1.1.1.0/24'}})}}).networkInfo('1.1.1.1');await new PeeringDbProvider({fetchFn:async u=>{b=new URL(u);return json({data:[]})}}).networkByAsn('AS13335');assert.equal(a.searchParams.get('resource'),'1.1.1.1');assert.equal(b.searchParams.get('asn'),'13335');});

test('certificate transparency deduplicates wildcard and exact names',async()=>{const p=new CertificateTransparencyProvider({fetchFn:async()=>json([{name_value:'*.a.example.com\na.example.com'},{name_value:'b.example.com'}])});const r=await p.subdomains('example.com');assert.deepEqual(r.subdomains,['a.example.com','b.example.com']);});

test('Nominatim is self-host-only by default',async()=>{const r=await new NominatimProvider({baseUrl:null}).search({query:'Sao Jose dos Campos'});assert.equal(r.ok,false);assert.equal(r.reason,'not_configured');});

test('sitemap provider extracts loc URLs',async()=>{const p=new SitemapProvider({fetchFn:async()=>new Response('<?xml version="1.0"?><urlset><url><loc>https://x.test/a</loc></url><url><loc>https://x.test/b?x=1&amp;y=2</loc></url></urlset>',{status:200})});const r=await p.urls('x.test');assert.equal(r.urls.length,2);assert.equal(r.urls[1],'https://x.test/b?x=1&y=2');});
