export class QueridoDiarioProvider { constructor({fetchFn=globalThis.fetch,baseUrl='https://api.queridodiario.org.br'}={}){this.id='querido_diario';this.fetchFn=fetchFn;this.baseUrl=baseUrl.replace(/\/$/,'');}
 async company(cnpj){return this.#get(`/company/info/${encodeURIComponent(cnpj.replace(/\D/g,''))}`)}
 async partners(cnpj){return this.#get(`/company/partners/${encodeURIComponent(cnpj.replace(/\D/g,''))}`)}
 async #get(path){let r;try{r=await this.fetchFn(`${this.baseUrl}${path}`,{headers:{accept:'application/json'}})}catch(e){return{ok:false,provider:this.id,reason:'network_error',detail:String(e?.message??e)}}if(!r.ok)return{ok:false,provider:this.id,reason:r.status===404?'not_found':'upstream_error',status:r.status};return{ok:true,provider:this.id,data:await r.json()};}}
