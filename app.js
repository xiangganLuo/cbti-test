/* 数据加载与业务逻辑；题库与标签库来自 /assets/*.json */

/*
 * @author xiangganluo
 */
class DataLoader {
  static async loadJSON(path, fallback){
    try{
      const res = await fetch(path, {cache:'no-store'});
      if(res.ok===false) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(e){
      console.warn('读取 '+path+' 失败，使用内置数据。', e);
      return fallback;
    }
  }
}

/*
 * @author xiangganluo
 */
class QuizEngine{
  constructor(questions){
    this.questions = questions || [];
    this.index = 0;
    this.answers = [];// 存 A/B/C/D
  }
  total(){return this.questions.length}
  current(){return this.questions[this.index]}
  choose(key){ this.answers.push(key); this.index++; }
  done(){return this.index>=this.total()}
  summary(){
    const s={A:0,B:0,C:0,D:0};
    for(let i=0;i<this.answers.length;i++){
      const k=this.answers[i];
      if(Object.prototype.hasOwnProperty.call(s,k)) s[k]++;
    }
    return s;
  }
  reset(){this.index=0;this.answers=[]}
}

/*
 * @author xiangganluo
 */
class ResultResolver{
  constructor(groups, typedict){
    this.groups = groups; this.types = typedict;
  }
  resolve(summary){
    var entries = Object.entries(summary);
    var max = Math.max.apply(null, entries.map(function(p){return p[1];}));
    var topLetters = entries.filter(function(p){return p[1]===max;}).map(function(p){return p[0];});
    var poolLetters = topLetters;
    var poolTypes = [];
    for(var i=0;i<poolLetters.length;i++){
      var arr = this.groups[poolLetters[i]] || [];
      for(var j=0;j<arr.length;j++) poolTypes.push(arr[j]);
    }
    var pick = poolTypes[Math.floor(Math.random()*poolTypes.length)];
    return this.types[pick];
  }
}

/*
 * @author xiangganluo
 */
class CanvasCard{
  constructor(w, h){
    this.w=w||1080; this.h=h||1920;
    this.canvas=document.createElement('canvas');
    this.canvas.width=this.w; this.canvas.height=this.h;
    this.ctx=this.canvas.getContext('2d');
  }
  gradientBg(colors){
    const g=this.ctx.createLinearGradient(0,0,this.w,this.h);
    g.addColorStop(0, colors[0]);
    g.addColorStop(1, colors[1]);
    this.ctx.fillStyle=g;this.ctx.fillRect(0,0,this.w,this.h);
  }
  drawDecor(type, color){
    const ctx=this.ctx;ctx.save();ctx.globalAlpha=0.18;ctx.fillStyle=color;
    const w=this.w, h=this.h;
    function star(x,y,r){ctx.beginPath();for(let i=0;i<5;i++){const ang=i*2*Math.PI/5 - Math.PI/2;const ox=x+Math.cos(ang)*r;const oy=y+Math.sin(ang)*r;ctx.lineTo(ox,oy);const ang2=ang+Math.PI/5;ctx.lineTo(x+Math.cos(ang2)*r*0.5,y+Math.sin(ang2)*r*0.5);}ctx.closePath();ctx.fill();}
    if(type==='star'){star(w*0.85,h*0.18,110);}
    if(type==='cloud'){ctx.beginPath();ctx.ellipse(w*0.2,h*0.18,140,70,0,0,Math.PI*2);ctx.fill();}
    if(type==='heart'){ctx.beginPath();ctx.moveTo(w*0.8,h*0.75);ctx.bezierCurveTo(w*0.9,h*0.65,w*0.98,h*0.85,w*0.8,h*0.92);ctx.bezierCurveTo(w*0.62,h*0.85,w*0.7,h*0.65,w*0.8,h*0.75);ctx.fill();}
    if(type==='sun'){ctx.beginPath();ctx.arc(w*0.15,h*0.12,70,0,Math.PI*2);ctx.fill();}
    if(type==='wave'){ctx.beginPath();ctx.moveTo(0,h*0.9);for(let x=0;x<=w;x+=40){ctx.lineTo(x,h*0.9+Math.sin(x/40)*12);}ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();}
    if(type==='spiral'){ctx.beginPath();let x=w*0.85,y=h*0.2,r=10;for(let i=0;i<90;i++){const a=i/10;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);r+=1.5;}ctx.strokeStyle=color;ctx.lineWidth=6;ctx.stroke();}
    ctx.restore();
  }
  drawCat(style,color){
    const ctx=this.ctx;ctx.save();ctx.translate(this.w*0.5,this.h*0.55);
    const scale = (style.pose==='jump'||style.pose==='float')?1.05:(style.pose==='lie'?0.95:1.0);
    ctx.scale(scale,scale);
    const body=color;
    ctx.fillStyle=body;ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=4;
    const bodyW=360, bodyH=520;
    const drawRoundedRect=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x-r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill();ctx.stroke();};
    ctx.save();
    if(style.pose==='lie'){ctx.rotate(-Math.PI/12)}
    if(style.pose==='jump'){ctx.rotate(-Math.PI/18)}
    if(style.pose==='curl'){ctx.rotate(Math.PI/16)}
    drawRoundedRect(-bodyW/2, -bodyH/2, bodyW, bodyH, 80);
    ctx.beginPath();ctx.arc(0,-bodyH/2-110,120,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-70,-bodyH/2-170);ctx.lineTo(-120,-bodyH/2-90);ctx.lineTo(-20,-bodyH/2-110);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(70,-bodyH/2-170);ctx.lineTo(120,-bodyH/2-90);ctx.lineTo(20,-bodyH/2-110);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(bodyW/2-10,0);ctx.quadraticCurveTo(bodyW/2+120,-40,bodyW/2+60,120);ctx.quadraticCurveTo(bodyW/2,220,bodyW/2+40,280);ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.85)';ctx.beginPath();ctx.arc(-35,-bodyH/2-120,10,0,Math.PI*2);ctx.arc(35,-bodyH/2-120,10,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(0,-bodyH/2-90,6,0,Math.PI*2);ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  drawTexts(title, desc, color){
    const ctx=this.ctx;ctx.save();ctx.fillStyle=color;ctx.textAlign='left';
    ctx.font='bold 72px "PingFang SC","Arial",sans-serif';
    const maxTitle = title.length>12? title.slice(0,12)+'…':title;
    ctx.fillText('你的人格类型：', 80, 210);
    ctx.fillText(maxTitle, 80, 300);
    ctx.font='normal 40px "PingFang SC","Arial",sans-serif';
    const text=desc;
    const lines=this.wrapText(text, 920);
    var y=380; for(var i=0;i<lines.length;i++){ctx.fillText(lines[i], 80, y); y+=56;}
    ctx.globalAlpha=.8;ctx.font='normal 32px Arial';
    ctx.fillText('本测试仅供娱乐，无科学依据 · CBTI', 80, this.h-100);
    ctx.restore();
  }
  wrapText(text, maxWidth){
    const ctx=this.ctx;const words=text.split('');let line='', lines=[];
    ctx.font='normal 40px "PingFang SC"';
    for(var i=0;i<words.length;i++){
      const test=line+words[i]; if(ctx.measureText(test).width>maxWidth){lines.push(line); line=words[i];}else{line=test;}
    }
    if(line) lines.push(line); return lines.slice(0,5);
  }
  async render(typeObj){
    const c1=typeObj.palette[0], c2=typeObj.palette[1], fg=typeObj.palette[2];
    this.gradientBg([c1,c2]);
    this.drawDecor(typeObj.catStyle.decor, fg);
    const catColor = this.tint(fg, .12);
    this.drawCat(typeObj.catStyle, catColor);
    this.drawTexts(typeObj.title+' 型', typeObj.desc, fg);
    return this.canvas.toDataURL('image/png');
  }
  tint(hex, alpha){
    const c=this.hexToRgb(hex); return 'rgba('+c.r+','+c.g+','+c.b+','+alpha+')';
  }
  hexToRgb(hex){
    const n=parseInt(hex.replace('#',''),16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }
}

// --- 应用逻辑 ---
var $=function(s){return document.querySelector(s)};
var spinner=document.querySelector('#spinner');
var toast=document.querySelector('#toast');
var screens={home:document.querySelector('#screen-home'), quiz:document.querySelector('#screen-quiz'), result:document.querySelector('#screen-result')};
var qText=document.querySelector('#questionText'); var optionsBox=document.querySelector('#optionsBox'); var progressText=document.querySelector('#progressText');
var resultTitle=document.querySelector('#resultTitle'); var resultDesc=document.querySelector('#resultDesc');
var previewImg=document.querySelector('#previewImg');

var quiz, resolver, lastType;

function show(name){ Object.values(screens).forEach(function(n){n.classList.add('hidden')}); screens[name].classList.remove('hidden'); }
function showSpinner(b){ spinner.classList.toggle('show', Boolean(b)); }
function showToast(msg){ toast.textContent=msg; toast.classList.add('show'); setTimeout(function(){toast.classList.remove('show')}, 1600); }

async function init(){
  const fallbackQ={meta:{total:1},questions:[{id:1,text:'加载失败：试试本地服务器打开？',options:[{key:'A',text:'好的'},{key:'B',text:'也是'},{key:'C',text:'可以'},{key:'D',text:'随缘'}]}]};
  const fallbackR={groups:{A:['稳定发疯型'],B:['人间清醒型'],C:['佛系躺平型'],D:['快乐小狗型']},types:{'稳定发疯型':{title:'稳定发疯型',desc:'内置占位文案。',palette:['#FFD1DC','#B7C4FF','#302D4C'],catStyle:{pose:'stand',mood:'chaotic',decor:'spark'}}}};
  const dataQ = await DataLoader.loadJSON('assets/questions.json', fallbackQ);
  const dataR = await DataLoader.loadJSON('assets/results.json', fallbackR);
  quiz = new QuizEngine(dataQ.questions);
  resolver = new ResultResolver(dataR.groups, dataR.types);
  bind();
}

function bind(){
  document.querySelector('#startBtn').onclick = function(){ quiz.reset(); renderQuestion(); show('quiz'); };
  document.querySelector('#restartLink').onclick = function(){ quiz.reset(); show('home'); };
  document.querySelector('#saveBtn').onclick = function(){
    if(!previewImg.src || previewImg.src.length===0){return}
    const a=document.createElement('a'); a.href=previewImg.src; a.download=(lastType && lastType.title ? lastType.title : 'result')+'.png'; document.body.appendChild(a); a.click(); a.remove(); showToast('图片已保存');
  };
}

function renderQuestion(){
  const cur = quiz.current(); if(cur==null) return;
  progressText.textContent = '第 ' + (quiz.index+1) + '/' + quiz.total() + ' 题';
  qText.textContent = cur.text;
  optionsBox.innerHTML = '';
  for(let i=0;i<cur.options.length;i++){
    const opt=cur.options[i];
    const btn=document.createElement('button'); btn.className='opt'; btn.textContent = opt.text; btn.onclick = function(){ onChoose(opt.key); };
    optionsBox.appendChild(btn);
  }
}

function onChoose(key){
  quiz.choose(key);
  if(quiz.done()){
    const typeObj = resolver.resolve(quiz.summary());
    lastType = typeObj;
    resultTitle.textContent = '你的人格类型：' + typeObj.title + ' 型';
    resultDesc.textContent = typeObj.desc;
    previewImg.src = '';
    document.querySelector('#saveBtn').disabled=true;
    show('result');
    // 自动生成结果图
    showSpinner(true);
    (async ()=>{
      try{
        const card = new CanvasCard();
        const dataUrl = await card.render(lastType);
        previewImg.src = dataUrl;
        document.querySelector('#saveBtn').disabled=false;
      } finally { showSpinner(false); }
    })();
  }else{
    renderQuestion();
  }
}

// 启动
init();