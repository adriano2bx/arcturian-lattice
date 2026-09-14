export class YouTubeProvider {
  constructor({fetchFn=globalThis.fetch,transcriptBaseUrl=null,publicRelayUrl='https://djen.2bx.com.br/youtube',allowKomeFallback=false}={}){this.id='youtube';this.fetchFn=fetchFn;this.transcriptBaseUrl=transcriptBaseUrl?.replace(/\/$/,'')??null;this.publicRelayUrl=publicRelayUrl?.replace(/\/$/,'')??null;this.allowKomeFallback=allowKomeFallback;}
  async metadata(url){const u=new URL('https://www.youtube.com/oembed');u.searchParams.set('url',url);u.searchParams.set('format','json');let r;try{r=await this.fetchFn(u.toString(),{headers:{accept:'application/json'}})}catch(e){return{ok:false,provider:this.id,reason:'network_error',detail:String(e?.message??e)}}if(!r.ok)return{ok:false,provider:this.id,reason:'upstream_error',status:r.status};return{ok:true,provider:this.id,source:'youtube_oembed',data:await r.json()};}
  async transcript(url){if(this.transcriptBaseUrl){const first=await this.#post(`${this.transcriptBaseUrl}/transcript`,{url});if(first.ok)return{...first,source:'self_hosted_transcript'};}
    const publicTrack = await this.#publicTranscript(url);
    if (publicTrack.ok) return publicTrack;
    if(this.allowKomeFallback){const r=await this.#post('https://kome.ai/api/transcript',{video_id:url,format:true,source:'tool'});return{...r,source:'kome_fallback',externalDependency:true};}
    return{ok:false,provider:this.id,reason:'transcript_provider_not_configured',detail:publicTrack.reason??'No public caption track was available for this video.'};}
  async #publicTranscript(url){
    let videoId;
    try { videoId = extractVideoId(url); } catch (e) { return {ok:false,provider:this.id,reason:'invalid_video_url',detail:e.message}; }
    let response;
    const watchUrl = `${this.publicRelayUrl ?? 'https://www.youtube.com'}/watch?v=${encodeURIComponent(videoId)}`;
    try { response = await this.fetchFn(watchUrl, {headers:{accept:'text/html','user-agent':'Mozilla/5.0'}}); }
    catch (e) { return {ok:false,provider:this.id,reason:'network_error',detail:String(e?.message??e)}; }
    if (!response.ok) return {ok:false,provider:this.id,reason:'upstream_error',status:response.status};
    const html = await response.text();
    const player = parseInitialPlayerResponse(html);
    const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
    const track = tracks.find((x)=>x.languageCode === 'pt' || x.languageCode === 'pt-BR') ?? tracks[0];
    if (!track?.baseUrl) return {ok:false,provider:this.id,reason:'caption_track_not_found'};
    let captions;
    const captionUrl = track.baseUrl.replace(/^https:\/\/www\.youtube\.com/, this.publicRelayUrl ?? 'https://www.youtube.com');
    try { const r=await this.fetchFn(`${captionUrl}&fmt=json3`,{headers:{accept:'application/json'}}); if(!r.ok)return{ok:false,provider:this.id,reason:'caption_upstream_error',status:r.status}; captions=await r.json(); }
    catch(e){return{ok:false,provider:this.id,reason:'network_error',detail:String(e?.message??e)}}
    const segments=(captions?.events??[]).flatMap((event)=>event.segs??[]).map((seg)=>String(seg.utf8??'').trim()).filter(Boolean);
    if(!segments.length)return{ok:false,provider:this.id,reason:'empty_transcript'};
    return {ok:true,provider:this.id,source:'youtube_public_caption_track',videoId,language:track.languageCode??null,text:segments.join(' '),segments:captions.events??[]};
  }
  async #post(url,body){let r;try{r=await this.fetchFn(url,{method:'POST',headers:{accept:'application/json','content-type':'application/json'},body:JSON.stringify(body)})}catch(e){return{ok:false,provider:this.id,reason:'network_error',detail:String(e?.message??e)}}if(!r.ok)return{ok:false,provider:this.id,reason:'upstream_error',status:r.status};let data;try{data=await r.json()}catch{data=await r.text()}return{ok:true,provider:this.id,data};}
}

function extractVideoId(value){
  const u=new URL(value);
  if (u.hostname.endsWith('youtu.be')) return u.pathname.slice(1).split('/')[0];
  if (u.searchParams.get('v')) return u.searchParams.get('v');
  const match=u.pathname.match(/\/shorts\/([^/]+)|\/embed\/([^/]+)/);
  const id=match?.[1]??match?.[2];
  if(!id) throw new Error('YouTube URL must contain a video id.');
  return id;
}

function parseInitialPlayerResponse(html){
  const marker='ytInitialPlayerResponse = ';
  const start=html.indexOf(marker);
  if(start<0)return null;
  const jsonStart=start+marker.length;
  let depth=0,inString=false,escaped=false;
  for(let i=jsonStart;i<html.length;i++){
    const ch=html[i];
    if(inString){ if(escaped)escaped=false; else if(ch==='\\')escaped=true; else if(ch==='"')inString=false; continue; }
    if(ch==='"'){inString=true;continue;}
    if(ch==='{')depth++;
    else if(ch==='}'&&--depth===0){try{return JSON.parse(html.slice(jsonStart,i+1));}catch{return null;}}
  }
  return null;
}
