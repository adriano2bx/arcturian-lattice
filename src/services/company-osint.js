import { MinhaReceitaCnpjProvider } from '../providers/minhareceita.js';
import { CompanyProfileService } from './company-profile.js';
import { BrasilApiCnpjProvider } from '../providers/brasilapi.js';
import { TcuCertificatesProvider } from '../providers/tcu-certificates.js';
import { PncpContractsProvider } from '../providers/pncp-contracts.js';
import { QueridoDiarioProvider } from '../providers/querido-diario.js';
import { GleifProvider } from '../providers/gleif.js';
import { GdeltProvider } from '../providers/gdelt.js';
import { describeCnpj } from '../core/cnpj.js';

export class CompanyOsintService {
 constructor({fetchFn=globalThis.fetch}={}){this.fetchFn=fetchFn;}
 async investigate({cnpj,legalName=null,dateFrom,dateTo,maxPages=2}){
  const doc=describeCnpj(cnpj);if(!doc.valid)return{status:'failed',error:{code:'INVALID_CNPJ'},document:doc};
  const profileSvc=new CompanyProfileService({providers:[new BrasilApiCnpjProvider({fetchFn:this.fetchFn})]});
  let profile=null;try{profile=await profileSvc.getByCnpj(doc.normalized)}catch{}
  const name=legalName??profile?.identity?.legalName??null;
  const qd=new QueridoDiarioProvider({fetchFn:this.fetchFn});const gdelt=new GdeltProvider({fetchFn:this.fetchFn});const gleif=new GleifProvider({fetchFn:this.fetchFn});
  const jobs=[
    ['risk',new TcuCertificatesProvider({fetchFn:this.fetchFn}).check(doc.normalized)],
    ['gazetteCompany',qd.company(doc.normalized)],['gazettePartners',qd.partners(doc.normalized)],
    ...(name?[['globalEntity',gleif.searchByName(name,{limit:5})],['news',gdelt.search({query:`\"${name}\"`,timespan:'3months',limit:25})]]:[]),
    ...(dateFrom&&dateTo?[['publicContracts',new PncpContractsProvider({fetchFn:this.fetchFn}).searchContracts({cnpj:doc.normalized,role:'supplier',dateFrom,dateTo,maxPages})]]:[]),
  ];
  const settled=await Promise.all(jobs.map(async([k,p])=>[k,await p.catch?.(e=>({ok:false,reason:'exception',detail:String(e?.message??e)}))??p]));
  const data=Object.fromEntries(settled);const okCount=Object.values(data).filter(x=>x?.ok).length;
  return{status:okCount===settled.length?'success':okCount?'partial_success':'failed',company:{cnpj:doc.normalized,legalName:name,profile},signals:data,confidence:{class:'mixed',note:'Combines authoritative, observed and public-index sources; inspect each signal provider.'}};
 }
}
