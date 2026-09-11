import { clamp } from '../core/http.js';
export class SearxngProvider {
  constructor({ fetchFn = globalThis.fetch, baseUrl = null } = {}) { this.id='searxng'; this.fetchFn=fetchFn; this.baseUrl=baseUrl?.replace(/\/$/,'') ?? null; }
  configured(){ return Boolean(this.baseUrl); }
  async search({ query, language='pt-BR', categories='general', limit=10 }) {
    if(!this.configured()) return {ok:false,provider:this.id,reason:'not_configured'};
    const url=new URL(`${this.baseUrl}/search`); url.searchParams.set('q',query); url.searchParams.set('format','json'); url.searchParams.set('language',language); url.searchParams.set('categories',categories);
    let r; try{r=await this.fetchFn(url.toString(),{headers:{accept:'application/json'}});}catch(e){return{ok:false,provider:this.id,reason:'network_error',detail:String(e?.message??e)}}
    if(!r.ok) return {ok:false,provider:this.id,reason:'upstream_error',status:r.status}; const p=await r.json();
    return {ok:true,provider:this.id,results:(p.results??[]).slice(0,clamp(limit,1,50,10)).map(x=>({title:x.title??null,url:x.url??null,content:x.content??null,engine:x.engine??null,score:x.score??null}))};
  }
}
