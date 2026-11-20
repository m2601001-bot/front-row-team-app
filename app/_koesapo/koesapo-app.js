// こえサポ の動き（claude.ai のアーティファクト版から移植）
// KoeSapo.tsx の画面ができたあとで、ブラウザの中で一度だけ実行されます。

export function initKoeSapo() {
  // React の開発モードでは effect が2回動くので、二重に初期化しないようにする
  if (document.body.dataset.koesapoReady) return;
  document.body.dataset.koesapoReady = "1";

  const DEFAULTS = {
    "あいさつ": ["こんにちは","ありがとうございます","すみません","よろしくお願いします","さようなら","おはようございます"],
    "学校": ["もう一度言ってください","ゆっくり話してください","わかりました","わかりません","質問があります","トイレに行ってもいいですか"],
    "お店": ["これをください","いくらですか","袋はいりません","カードで払えますか","温めてください","レシートをください"],
    "病院": ["気分が悪いです","頭が痛いです","お腹が痛いです","熱があります","薬はありますか","アレルギーがあります"],
    "きもち": ["うれしいです","楽しいです","悲しいです","疲れました","少し待ってください","大丈夫です"],
    "緊急": ["助けてください","警察を呼んでください","救急車を呼んでください","道に迷いました","知らない人がいます","家族に連絡してください"]
  };
  const ICONS = {"あいさつ":"👋","学校":"🏫","お店":"🛍️","病院":"🏥","きもち":"💗","緊急":"🚨"};
  const TONES = {
    happy:{rate:1.18,pitch:1.55,vol:1,label:"楽しい",face:"😊"},
    normal:{rate:1.0,pitch:1.0,vol:1,label:"ふつう",face:"🙂"},
    sad:{rate:0.72,pitch:0.6,vol:0.8,label:"悲しい",face:"😢"},
    angry:{rate:1.2,pitch:0.78,vol:1,label:"怒ってる",face:"😠"}
  };
  const STRENGTH={1:{k:0.6,label:"少し"},2:{k:1,label:"ふつう"},3:{k:1.5,label:"すごく"}};
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function voiceParams(tn){
    const T=TONES[tn]||TONES.normal, k=STRENGTH[document.getElementById("strength").value].k;
    return {rate:clamp(1+(T.rate-1)*k,0.5,2), pitch:clamp(1+(T.pitch-1)*k,0.1,2), vol:clamp(1+(T.vol-1)*k,0.5,1)};
  }
  // 言い方に気持ちを込める：句読点で声の抑揚を変える（表示する文字はそのまま）
  function emote(text,tn,lang){
    if(!document.getElementById("emoteText").checked || tn==="normal") return text;
    const lvl=+document.getElementById("strength").value;
    const ja=lang==="ja"||lang==="zh";
    let t=text.trim(); const q=/[?？]$/.test(t);
    t=t.replace(/[。．.!！?？…♪～〜\s]+$/,"");
    const isQ = q || (lang==="ja" && /(ですか|ますか|でしょうか|かな|の)$/.test(t));
    if(tn==="happy"){ return t+(isQ?(ja?"？":"?"):(ja?(lvl>=3?"！！":"！"):(lvl>=3?"!!":"!"))); }
    if(tn==="angry"){
      const bang=ja?(lvl>=3?"！！":"！"):(lvl>=3?"!!":"!");
      return t.replace(/、\s*/g,ja?"！":"! ").replace(/,\s*/g,"! ")+(isQ?(ja?"？！":"?!"):bang);
    }
    if(tn==="sad"){
      const dots=ja?(lvl>=3?"……":"…"):"...";
      let body=t;
      if(lvl>=2) body=body.replace(/、/g,"…、").replace(/, /g,"... ");
      return (lvl>=3?(ja?"……":"... "):"")+body+(isQ?(ja?"…？":"...?"):dots);
    }
    return text;
  }
  function mascotSVG(tn){
    const eyes={
      happy:'<path d="M30 44q6-8 12 0M58 44q6-8 12 0" stroke="#3d4560" stroke-width="4" fill="none" stroke-linecap="round"/>',
      sad:'<ellipse cx="36" cy="44" rx="4.5" ry="5.5" fill="#3d4560"/><ellipse cx="64" cy="44" rx="4.5" ry="5.5" fill="#3d4560"/><path d="M28 33l12 4M72 33l-12 4" stroke="#3d4560" stroke-width="3" stroke-linecap="round"/><path d="M68 52q3 6 0 9q-3-3 0-9z" fill="#9fd4ff"/>',
      angry:'<path d="M27 32l15 7M73 32l-15 7" stroke="#3d4560" stroke-width="4" stroke-linecap="round"/><ellipse cx="36" cy="45" rx="4.5" ry="5" fill="#3d4560"/><ellipse cx="64" cy="45" rx="4.5" ry="5" fill="#3d4560"/><path d="M78 14l4 6M86 18l-6 3M76 22l6-1" stroke="#c43c3c" stroke-width="3" stroke-linecap="round"/>',
      normal:'<ellipse cx="36" cy="42" rx="5" ry="6.5" fill="#3d4560"/><ellipse cx="64" cy="42" rx="5" ry="6.5" fill="#3d4560"/><circle cx="38" cy="39.5" r="1.8" fill="#fff"/><circle cx="66" cy="39.5" r="1.8" fill="#fff"/>'
    }[tn];
    const mouth={
      happy:'<path d="M40 54q10 12 20 0z" fill="#3d4560"/><path d="M45 58q5 3 10 0" fill="#ff8fa8"/>',
      sad:'<path d="M42 60q8-7 16 0" stroke="#3d4560" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
      angry:'<path d="M41 61q9-8 18 0" stroke="#3d4560" stroke-width="4" fill="none" stroke-linecap="round"/>',
      normal:'<path d="M43 53q7 7 14 0" stroke="#3d4560" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    }[tn];
    const body={happy:"#ffc94d",normal:"#7cc0f5",sad:"#9aa9d6",angry:"#ff7a7a"}[tn];
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8c24 0 42 15 42 35S74 78 50 78c-5 0-9-.5-13-1.6L18 88l5-16C13 65 8 55 8 43 8 23 26 8 50 8z" fill="${body}"/>${eyes}<ellipse cx="24" cy="55" rx="7" ry="4" fill="#ffc2d8"/><ellipse cx="76" cy="55" rx="7" ry="4" fill="#ffc2d8"/>${mouth}</svg>`;
  }
  function applyTone(tn){
    document.body.dataset.tone=tn;
    document.querySelectorAll(".mascot").forEach(m=>m.innerHTML=mascotSVG(tn));
  }
  const LANGS = {ja:{name:"日本語",bcp:"ja-JP"},en:{name:"English",bcp:"en-US"},zh:{name:"中文",bcp:"zh-CN"},ko:{name:"한국어",bcp:"ko-KR"},vi:{name:"Tiếng Việt",bcp:"vi-VN"},ne:{name:"नेपाली",bcp:"ne-NP"},ro:{name:"Română",bcp:"ro-RO"}};

  const store = {
    get(k,d){try{const v=localStorage.getItem("koesapo_"+k);return v?JSON.parse(v):d}catch{return d}},
    set(k,v){try{localStorage.setItem("koesapo_"+k,JSON.stringify(v))}catch{}}
  };
  let phrases = store.get("phrases", JSON.parse(JSON.stringify(DEFAULTS)));
  let history = store.get("history", []);
  let tone = "normal", cat = Object.keys(phrases)[0], editing = false;
  const transCache = {};
  // AI（翻訳・直す）と Claude の声は claude.ai の上でだけ使える機能。
  // このアプリでは今は null のまま（あとで自分の AI API につなぐ場所）。
  let sample = null, tts = null, lastSpoken = null;

  const $ = id => document.getElementById(id);
  const statusEl = $("status"); let stTimer;
  function toast(msg){statusEl.textContent=msg;statusEl.classList.add("show");clearTimeout(stTimer);stTimer=setTimeout(()=>statusEl.classList.remove("show"),2600)}

  // ---------- render ----------
  function renderTabs(){
    const tabs=$("tabs"); tabs.innerHTML="";
    Object.keys(phrases).forEach(c=>{
      const b=document.createElement("button");
      b.className="tab";b.setAttribute("role","tab");b.textContent=(ICONS[c]?ICONS[c]+" ":"")+c;b.setAttribute("aria-selected",c===cat);
      b.onclick=()=>{cat=c;renderTabs();renderGrid()};
      tabs.appendChild(b);
    });
  }
  function renderGrid(){
    const g=$("grid"); g.innerHTML=""; g.parentElement.classList.toggle("editing",editing);
    (phrases[cat]||[]).forEach((p,i)=>{
      const b=document.createElement("button");
      b.className="phrase";b.textContent=p;
      b.onclick=()=>{ if(editing) return; say(p,b); };
      const d=document.createElement("button");
      d.className="del";d.textContent="✕";d.setAttribute("aria-label",p+"を削除");
      d.onclick=e=>{e.stopPropagation();phrases[cat].splice(i,1);store.set("phrases",phrases);renderGrid()};
      b.appendChild(d); g.appendChild(b);
    });
    const a=document.createElement("button");
    a.className="add";a.textContent="＋ ついか";
    a.onclick=()=>openAdd("");
    g.appendChild(a);
  }
  function renderHist(){
    const ul=$("hist"); ul.innerHTML="";
    if(!history.length){ul.innerHTML='<li class="hint">まだありません</li>';return}
    history.slice(0,15).forEach(h=>{
      const li=document.createElement("li");
      const s=document.createElement("div");
      s.innerHTML=`<div></div><span class="t"></span>`;
      s.firstChild.textContent=h.text+(h.out&&h.out!==h.text?"  →  "+h.out:"");
      s.lastChild.textContent=h.time+"・"+(TONES[h.tone]?.label||"")+"・"+(LANGS[h.lang]?.name||"");
      const b=document.createElement("button");b.textContent="▶";b.setAttribute("aria-label","もう一度");
      b.onclick=()=>speakRaw(h.out||h.text,h.lang,h.tone,h.text);
      li.append(s,b); ul.appendChild(li);
    });
  }

  // ---------- speech ----------
  let voices=[];
  function loadVoices(){ try{voices=speechSynthesis.getVoices()}catch{} }
  if("speechSynthesis" in window){ loadVoices(); }
  // 自然な声を優先：Edgeの「Natural/Online」、Chromeの「Google」、Macの「Enhanced/Premium」など
  function voiceScore(v){
    const n=(v.name||"");let sc=0;
    if(/Natural/i.test(n)) sc+=50;
    if(/Online/i.test(n)) sc+=30;
    if(/Premium|Enhanced|Neural|Siri/i.test(n)) sc+=25;
    if(/^Google/i.test(n)) sc+=20;
    if(/Nanami|Keita|Aoi|Kyoko|Otoya|O-ren/i.test(n)) sc+=5;
    if(!v.localService) sc+=3;
    return sc;
  }
  function voicesFor(bcp){
    const base=bcp.split("-")[0].toLowerCase();
    return voices.filter(v=>v.lang&&v.lang.replace("_","-").toLowerCase().startsWith(base)&&!/Microsoft/i.test(v.name||""))
                 .sort((a,b)=>voiceScore(b)-voiceScore(a));
  }
  const MALE=/Keita|Otoya|Ichiro|Daichi|Naoki|Hattori|Guy|Davis|Andrew|Brian|Christopher|Eric|Roger|Steffan|Ryan|Thomas|Daniel|Alex\b|Fred|Aaron|Rishi|Male|Yunxi|Yunyang|Yunjian|Kangkang|Li-mu|InJoon|Hyunsu|Bong ?Jin|NamMinh|\bAn\b|Emil|Andrei|Sagar|Hemkala?/i;
  const isMale=v=>MALE.test(v.name||"");
  function pickVoice(bcp){
    const choice=$("voice").value;
    if(choice==="male"){ return voicesFor(bcp).find(isMale) || voicesFor(bcp)[0]; }
    if(choice.startsWith("dev:")){
      const v=voices.find(x=>x.voiceURI===choice.slice(4));
      if(v && v.lang.toLowerCase().startsWith(bcp.split("-")[0])) return v;
    }
    return voicesFor(bcp)[0];
  }
  const CLAUDE_VOICES=[["buttery","やわらか"],["airy","ふんわり"],["glassy","すっきり"],["rounded","まるい"]];
  function renderVoices(){
    const sel=$("voice"), prev=sel.value||store.get("voice","auto");
    const L=LANGS[$("lang").value]||LANGS.ja;
    sel.innerHTML="";
    const add=(parent,val,txt)=>{const o=document.createElement("option");o.value=val;o.textContent=txt;parent.appendChild(o);};
    add(sel,"auto","おすすめ（いちばん自然な声を自動で選ぶ）");
    add(sel,"male","男性の声（おすすめ・この端末）");
    if(tts){
      const g=document.createElement("optgroup");g.label="Claudeの声（自然・ネット必要）";
      CLAUDE_VOICES.forEach(([id,jp])=>add(g,"claude:"+id,"Claude "+jp+"（"+id+"）"));
      sel.appendChild(g);
    }
    const list=voicesFor(L.bcp);
    if(list.length){
      const g=document.createElement("optgroup");g.label="この端末の声（"+L.name+"）";
      list.forEach(v=>add(g,"dev:"+v.voiceURI,v.name+(isMale(v)?" ♂":"")+(voiceScore(v)>=20?" ★":"")));
      sel.appendChild(g);
    }
    if([...sel.options].some(o=>o.value===prev)) sel.value=prev;
    updateVoiceNote();
  }
  function updateVoiceNote(){
    const val=$("voice").value, n=$("voiceNote");
    const best=voicesFor((LANGS[$("lang").value]||LANGS.ja).bcp)[0];
    if(val.startsWith("claude:")) n.textContent="Claudeの声はとても自然です。Claudeの声では、入力した言葉をそのまま読みます。トーンは「速さ」だけ変わります。";
    else if(val==="male"){ const mv=voicesFor((LANGS[$("lang").value]||LANGS.ja).bcp).find(isMale);
      n.textContent=mv?("いま使う声："+mv.name+(voiceScore(mv)>=20?"（自然な声 ★）":"")):"この端末には、この言葉の男性の声が見つかりません。"; }
    else if(val==="auto") n.textContent=best?("いま使う声："+best.name+(voiceScore(best)>=20?"（自然な声 ★）":"")):"この端末には、この言葉の声がありません。";
    else n.textContent="★ が付いている声は、より自然に聞こえます。";
    if(!best && !tts && val==="auto") n.textContent="この端末には、この言葉の声がありません。画面の文字を見せてください。";
  }
  // Claudeの声：文の終わりをはっきりさせ、言い終わる時間を過ぎたら必ず止める
  let ttsTimer=null, ttsLimit=0, ttsStateHooked=false;
  function claudeSay(text,lang,opts){
    let t=text.trim();
    if(!/[。．.!！?？]$/.test(t)) t+=(/^(ja|zh)$/.test(lang)?"。":".");
    const cjk=/[぀-ヿ㐀-鿿가-힯]/.test(t);
    const perSec=(cjk?5.5:13)*(opts.rate||1);
    ttsLimit=Math.round((t.length/perSec+1.0)*1000);
    if(!ttsStateHooked && tts.onState){
      ttsStateHooked=true;
      tts.onState(({state})=>{
        clearTimeout(ttsTimer);
        if(state==="speaking") ttsTimer=setTimeout(()=>{try{tts.stop()}catch{}},ttsLimit);
      });
    }
    clearTimeout(ttsTimer);
    // 念のため：話し始めの合図が来なくても止める
    ttsTimer=setTimeout(()=>{try{tts.stop()}catch{}},ttsLimit+4000);
    return tts.speak(t,opts).catch(e=>{ if(e&&e.code==="rate_limited") toast("少し待ってからもう一度どうぞ"); });
  }
  function speakRaw(text,lang,tn,original){
    const L=LANGS[lang]||LANGS.ja, T=voiceParams(tn);
    applyTone(tn);
    const tl=TONES[tn]||TONES.normal; $("bigTone").textContent=tl.face+" "+tl.label;
    showBig(text, original && original!==text ? original : "");
    const plain=String(text).trim();
    text=emote(text,tn,lang);
    lastSpoken={text:plain,lang,tone:tn,original};
    const choice=$("voice").value;
    const m=$("mascot");
    if(choice.startsWith("claude:") && tts){
      try{speechSynthesis.cancel()}catch{}
      m.classList.add("talk");
      claudeSay(plain,lang,{voice:choice.slice(7),rate:clamp(T.rate,.7,1.5)})
        .finally(()=>m.classList.remove("talk"));
      return;
    }
    const v = ("speechSynthesis" in window) ? pickVoice(L.bcp) : null;
    if(v){
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.voice=v; u.lang=L.bcp; u.rate=T.rate; u.pitch=T.pitch; u.volume=T.vol;
      m.classList.add("talk"); u.onend=u.onerror=()=>m.classList.remove("talk");
      speechSynthesis.speak(u);
      return;
    }
    if(tts){
      claudeSay(plain,lang,{rate:clamp(T.rate,.7,1.5)});
      return;
    }
    toast("この端末では"+L.name+"の音声がありません。画面の文字を見せてください。");
  }
  async function say(text,btn){
    const lang=$("lang").value;
    let out=text;
    if(lang!=="ja"){
      if(btn) btn.classList.add("speaking");
      out = await translate(text,lang);
      if(btn) btn.classList.remove("speaking");
      if(out==null) return;
    }
    speakRaw(out,lang,tone,text);
    const now=new Date();
    history.unshift({text,out,lang,tone,time:now.getHours()+":"+String(now.getMinutes()).padStart(2,"0")});
    history=history.slice(0,50); store.set("history",history); renderHist();
  }

  // ---------- AI ----------
  async function translate(text,lang){
    const key=lang+"|"+tone+"|"+$("strength").value+"|"+text;
    if(transCache[key]) return transCache[key];
    if(!sample){toast("翻訳（AI機能）はまだ準備中です。今は日本語で話せます。");return null}
    toast("翻訳中…");
    try{
      const r = await sample(
        `You translate short spoken phrases for a speech-assist app used by people who find speaking difficult. Translate the Japanese phrase below into ${LANGS[lang].name} (${LANGS[lang].bcp}). The speaker's mood is "${TONES[tone].label}" — keep wording natural and polite, and clearly express that mood through word choice, sentence endings and punctuation (e.g. "!" when happy or hurried, "..." when sad). Reply with ONLY the translated sentence, no quotes, no romanization, no explanation.\n\nPhrase: ${text}`,
        {modelTier:"quick"});
      const out=(r.text||"").trim().split("\n")[0];
      transCache[key]=out; return out||text;
    }catch(e){
      toast(e&&e.code==="rate_limited"?"少し待ってからもう一度どうぞ":"翻訳できませんでした");
      return null;
    }
  }
  async function fixJapanese(){
    const text=$("input").value.trim();
    if(!text){toast("先に文字を入力してください");return}
    if(!sample){toast("AI機能はまだ準備中です");return}
    const btn=$("fixBtn"); btn.disabled=true; btn.textContent="考え中…";
    const box=$("aiOut");
    try{
      const r=await sample.json(
        `You help a person who finds speaking difficult (they may be a non-native Japanese speaker) say what they mean. Rewrite their input as ONE natural, polite, spoken Japanese sentence that keeps their meaning and clearly shows their emotion through wording and sentence endings (current mood: ${TONES[tone].label}, strength ${STRENGTH[$("strength").value].label}). If the input is in another language, turn it into Japanese. Return JSON: {"fixed": "<Japanese sentence>", "note": "<one very short reason in easy Japanese, or empty>"}\n\nInput: ${text}`,
        {modelTier:"quick"});
      const fixed=(r&&r.fixed)||"";
      box.innerHTML="";
      const p=document.createElement("div");p.style.fontSize="19px";p.style.fontWeight="700";p.textContent=fixed;
      const n=document.createElement("div");n.className="hint";n.textContent=r&&r.note?"メモ："+r.note:"";
      const row=document.createElement("div");row.className="row";row.style.marginTop="8px";
      const use=document.createElement("button");use.className="primary";use.textContent="これを使う";
      use.onclick=()=>{$("input").value=fixed;box.classList.remove("show")};
      const sp=document.createElement("button");sp.textContent="▶ このまま話す";sp.onclick=()=>say(fixed);
      row.append(use,sp); box.append(p,n,row); box.classList.add("show");
    }catch(e){
      toast(e&&e.code==="rate_limited"?"少し待ってからもう一度どうぞ":"うまく直せませんでした");
    }finally{btn.disabled=false;btn.textContent="AIで自然な日本語に直す"}
  }

  // ---------- big display ----------
  function showBig(text,sub){
    if(!$("showBig").checked) return;
    $("bigText").textContent=text; $("bigSub").textContent=sub||""; $("big").classList.add("show");
  }
  $("bigClose").onclick=()=>$("big").classList.remove("show");
  $("bigAgain").onclick=()=>{ if(lastSpoken) speakRaw(lastSpoken.text,lastSpoken.lang,lastSpoken.tone,lastSpoken.original) };

  // ---------- add dialog ----------
  function openAdd(text){
    const sel=$("newCat"); sel.innerHTML="";
    Object.keys(phrases).forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;if(c===cat)o.selected=true;sel.appendChild(o)});
    $("newText").value=text; $("addModal").classList.add("show"); setTimeout(()=>$("newText").focus(),50);
  }
  $("addCancel").onclick=()=>$("addModal").classList.remove("show");
  $("addOk").onclick=()=>{
    const t=$("newText").value.trim(); if(!t) return;
    const c=$("newCat").value; phrases[c].push(t); store.set("phrases",phrases);
    cat=c; renderTabs(); renderGrid(); $("addModal").classList.remove("show"); toast("「"+t+"」を追加しました");
  };

  // ---------- controls ----------
  $("tones").addEventListener("click",e=>{
    const b=e.target.closest(".tone"); if(!b) return;
    tone=b.dataset.tone; applyTone(tone);
    document.querySelectorAll(".tone").forEach(x=>x.setAttribute("aria-pressed",x===b));
  });
  $("editBtn").onclick=()=>{editing=!editing;$("editBtn").textContent=editing?"完了":"編集";renderGrid()};
  $("speakBtn").onclick=()=>{const t=$("input").value.trim(); if(t) say(t); else toast("先に文字を入力してください")};
  $("fixBtn").onclick=fixJapanese;
  $("saveBtn").onclick=()=>openAdd($("input").value.trim());
  $("clearHist").onclick=()=>{history=[];store.set("history",history);renderHist()};
  $("stopBtn").onclick=()=>{try{speechSynthesis.cancel()}catch{} clearTimeout(ttsTimer); try{tts?.stop?.()}catch{}};
  $("input").addEventListener("keydown",e=>{ if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)) $("speakBtn").click() });

  $("strength").oninput=()=>{$("strengthLabel").textContent=STRENGTH[$("strength").value].label};
  applyTone(tone);
  $("voice").onchange=()=>{store.set("voice",$("voice").value);updateVoiceNote()};
  $("lang").addEventListener("change",renderVoices);
  $("tryVoice").onclick=async()=>{
    const lang=$("lang").value; let t="こんにちは。こえサポです。よろしくお願いします。";
    if(lang!=="ja"){ const o=await translate(t,lang); if(o==null) return; t=o; }
    const keep=$("showBig").checked; $("showBig").checked=false; speakRaw(t,lang,tone); $("showBig").checked=keep;
  };
  if("speechSynthesis" in window){ speechSynthesis.onvoiceschanged=()=>{loadVoices();renderVoices()}; }
  renderTabs(); renderGrid(); renderHist(); renderVoices();

  // ---------- AI の状態 ----------
  if(!sample){
    $("fixBtn").disabled=true;
    $("aiNote").textContent="AI機能（翻訳・直す）はまだ準備中です。日本語の読み上げは使えます。";
  }
}
