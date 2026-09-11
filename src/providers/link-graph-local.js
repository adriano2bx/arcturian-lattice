export class LinkGraphLocalProvider {
  constructor({db=null}={}){this.id='local_link_graph';this.db=db;}
  configured(){return Boolean(this.db?.prepare)}
  async backlinks(domain,{limit=100}={}){if(!this.configured())return{ok:false,provider:this.id,reason:'dataset_not_configured'};try{const r=await this.db.prepare(`SELECT source_url,target_url,anchor,rel,first_seen,last_seen FROM web_links WHERE target_domain=? ORDER BY last_seen DESC LIMIT ?`).bind(String(domain).toLowerCase(),Math.min(500,Math.max(1,Number(limit)||100))).all();return{ok:true,provider:this.id,links:r?.results??[],dataset:{mode:'local_accumulated',estimated:false}}}catch(e){return{ok:false,provider:this.id,reason:'dataset_query_error',detail:String(e?.message??e)}}}
}
