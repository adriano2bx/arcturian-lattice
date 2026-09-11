import { CompetitiveService } from './competitive.js';
export class TrafficEstimatorService {
  constructor({db=null,fetchFn=globalThis.fetch}={}){this.db=db;this.fetchFn=fetchFn;}
  async estimate(domain,{segment='default'}={}){
    if(!this.db?.prepare) return unavailable('dataset_not_configured','Traffic estimation requires a calibrated local model in D1.');
    const row=await this.db.prepare(`SELECT coefficients_json,trained_at,sample_size,metrics_json FROM traffic_models WHERE segment=?`).bind(segment).first();
    if(!row) return unavailable('model_not_trained',`No calibrated traffic model for segment ${segment}.`);
    const snapshot=await new CompetitiveService({fetchFn:this.fetchFn}).snapshot(domain);
    const coefficients=parse(row.coefficients_json)??{};const metrics=parse(row.metrics_json)??{};
    const features={visibilityScore:snapshot.digitalVisibilityScore,seoScore:snapshot.components?.seo?.audit?.score??0,historyCount:snapshot.components?.history?.snapshots?.length??0,newsCount:snapshot.components?.news?.articles?.length??0,technologyCount:snapshot.components?.technology?.technologies?.length??0};
    let logVisits=Number(coefficients.intercept??0);for(const [k,v] of Object.entries(features))logVisits+=Number(coefficients[k]??0)*Number(v??0);
    const center=Math.max(0,Math.round(Math.exp(logVisits)));const errorRatio=Math.max(.1,Math.min(1,Number(metrics.mape??0.4)));
    return{ok:true,domain,segment,estimate:{center,lower:Math.round(center*(1-errorRatio)),upper:Math.round(center*(1+errorRatio))},confidence:metrics.confidence??null,features,model:{trainedAt:row.trained_at??null,sampleSize:row.sample_size??0,metrics},meta:{estimated:true,method:'local_calibrated_model'}};
  }
}
function parse(v){try{return typeof v==='string'?JSON.parse(v):v}catch{return null}}
function unavailable(reason,detail){return{ok:false,reason,detail,meta:{estimated:true,available:false}}}
