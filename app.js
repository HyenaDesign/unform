(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.querySelector('#halftone');
  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero');
  let width=0, height=0, dots=[], time=0, paused=reducedMotion.matches, visible=true;
  const pointer={x:-1000,y:-1000}, smooth={x:-1000,y:-1000};
  function resize(){
    const rect=canvas.getBoundingClientRect(); width=rect.width; height=rect.height;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    dots=[];const gap=width<500?9:10;
    for(let y=5;y<height;y+=gap)for(let x=5;x<width;x+=gap)dots.push({x,y});
    draw();
  }
  function draw(){
    ctx.clearRect(0,0,width,height);ctx.fillStyle='#252821';
    const scale=Math.min(width*.55,height*.49),cx=width*.63,cy=height*.46;
    for(const p of dots){
      let x=(p.x-cx)/scale,y=(p.y-cy)/scale;
      const r=Math.hypot(x,y),a=Math.atan2(y,x);
      const edge=.72+.13*Math.sin(a*3+time*.3)+.06*Math.sin(a*5-time*.2);
      const band=Math.exp(-Math.pow((r-edge)/.27,2));
      const light=.50+.50*Math.cos(a-1.0)+.12*Math.sin(x*4+y*3+time*.25);
      let radius=Math.min(4.3,Math.max(0,band*(2.2+light*2.4)));
      if(radius<.38)continue;
      let px=p.x,py=p.y;
      if(!paused){const dx=px-smooth.x,dy=py-smooth.y,d=Math.hypot(dx,dy),force=Math.max(0,1-d/145);px+=dx/(d||1)*force*30;py+=dy/(d||1)*force*30;radius*=1-force*.5;}
      ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);ctx.fill();
    }
  }
  hero.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;});
  hero.addEventListener('pointerleave',()=>{pointer.x=-1000;pointer.y=-1000;});
  let last=0;
  function tick(now){if(visible&&!document.hidden&&!paused&&now-last>30){time+=.025;smooth.x+=(pointer.x-smooth.x)*.18;smooth.y+=(pointer.y-smooth.y)*.18;draw();last=now;}requestAnimationFrame(tick);}
  const motionButton=document.querySelector('#motion-toggle');
  function setMotion(){motionButton.setAttribute('aria-pressed',String(paused));motionButton.querySelector('.control-label').textContent=paused?'Play motion':'Pause motion';motionButton.querySelector('.control-icon').textContent=paused?'▷':'Ⅱ';draw();}
  motionButton.addEventListener('click',()=>{paused=!paused;setMotion();});
  reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;setMotion();});
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(hero);
  setMotion();requestAnimationFrame(tick);
  const serviceCursorIcon=document.querySelector('#service-cursor-icon');
  let targetServiceIconX=0,targetServiceIconY=0,currentServiceIconX=0,currentServiceIconY=0,serviceIconFrame=0;
  function followServiceIcon(){
    currentServiceIconX+=(targetServiceIconX-currentServiceIconX)*.16;
    currentServiceIconY+=(targetServiceIconY-currentServiceIconY)*.16;
    serviceCursorIcon.style.left=`${currentServiceIconX}px`;
    serviceCursorIcon.style.top=`${currentServiceIconY}px`;
    if(Math.abs(targetServiceIconX-currentServiceIconX)>.2||Math.abs(targetServiceIconY-currentServiceIconY)>.2){
      serviceIconFrame=requestAnimationFrame(followServiceIcon);
    }else{
      currentServiceIconX=targetServiceIconX;
      currentServiceIconY=targetServiceIconY;
      serviceCursorIcon.style.left=`${currentServiceIconX}px`;
      serviceCursorIcon.style.top=`${currentServiceIconY}px`;
      serviceIconFrame=0;
    }
  }
  document.querySelectorAll('.service').forEach(service=>{
    const summary=service.querySelector('summary');
    function moveServiceIcon(event){
      const iconWidth=serviceCursorIcon.offsetWidth,iconHeight=serviceCursorIcon.offsetHeight;
      targetServiceIconX=Math.max(8,Math.min(event.clientX+10,innerWidth-iconWidth-8));
      targetServiceIconY=Math.max(8,Math.min(event.clientY-iconHeight/2,innerHeight-iconHeight-8));
      if(!serviceIconFrame)serviceIconFrame=requestAnimationFrame(followServiceIcon);
    }
    summary.addEventListener('pointerenter',event=>{
      if(event.pointerType==='touch')return;
      const iconMask=`url("${service.dataset.cursorIcon}")`;
      serviceCursorIcon.style.webkitMaskImage=iconMask;
      serviceCursorIcon.style.maskImage=iconMask;
      serviceCursorIcon.classList.toggle('is-experience',service.dataset.cursorIcon.endsWith('experience.svg'));
      moveServiceIcon(event);
      currentServiceIconX=targetServiceIconX;
      currentServiceIconY=targetServiceIconY;
      serviceCursorIcon.style.left=`${currentServiceIconX}px`;
      serviceCursorIcon.style.top=`${currentServiceIconY}px`;
      if(serviceIconFrame){cancelAnimationFrame(serviceIconFrame);serviceIconFrame=0;}
      serviceCursorIcon.classList.add('is-visible');
    });
    summary.addEventListener('pointermove',event=>{
      if(serviceCursorIcon.classList.contains('is-visible'))moveServiceIcon(event);
    });
    summary.addEventListener('pointerleave',()=>{
      serviceCursorIcon.classList.remove('is-visible');
      if(serviceIconFrame){cancelAnimationFrame(serviceIconFrame);serviceIconFrame=0;}
    });
  });
  const briefDialog=document.querySelector('#brief-dialog'),projectDialog=document.querySelector('#project-dialog');
  let dialogTrigger=null;
  function openDialog(dialog,trigger){dialogTrigger=trigger;dialog.showModal();document.body.classList.add('dialog-open');}
  document.querySelectorAll('[data-open-brief]').forEach(button=>button.addEventListener('click',()=>openDialog(briefDialog,button)));
  document.querySelector('[data-open-project]').addEventListener('click',e=>openDialog(projectDialog,e.currentTarget));
  document.querySelector('[data-project-to-brief]').addEventListener('click',()=>{projectDialog.close();openDialog(briefDialog,document.querySelector('[data-open-project]'));});
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]')){document.body.classList.remove('dialog-open');dialogTrigger?.focus();}});
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  });
  document.querySelector('#brief-form').addEventListener('submit',event=>{
    event.preventDefault();const data=new FormData(event.currentTarget);
    const text=['UNFORM — PROJECT BRIEF','Good causes. Bold design. Real impact.','',`Name: ${data.get('name')}`,`Organisation: ${data.get('organisation')}`,`Interested in: ${data.get('service')}`,'','OUR CAUSE & PROJECT',data.get('purpose'),'','Prepared for a first conversation with Unform.'].join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='unform-project-brief.txt';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    document.querySelector('#brief-status').textContent='Your brief is ready to save. Keep it for our first conversation. Nothing has been sent.';
  });
  const consentKey='unform-cookie-consent-v1';
  const consentLifetime=183*24*60*60*1000;
  const cookieBanner=document.querySelector('#cookie-banner');
  const cookieStatus=document.querySelector('#cookie-status');
  function saveCookieChoice(choice){
    const consent={analytics:choice==='granted',expiresAt:Date.now()+consentLifetime};
    let saved=true;
    try{
      localStorage.setItem(consentKey,JSON.stringify(consent));
      cookieStatus.textContent='';
    }catch(error){
      saved=false;
      console.error('Could not save the cookie preference in this browser.',error);
      cookieStatus.textContent='Your choice applies for this visit, but this browser could not save it.';
    }
    window.unformAnalytics.setConsent(consent.analytics);
    cookieBanner.hidden=saved;
  }
  document.querySelectorAll('[data-cookie-choice]').forEach(button=>{
    button.addEventListener('click',()=>saveCookieChoice(button.dataset.cookieChoice));
  });
  window.addEventListener('unform-analytics-error',()=>{
    cookieStatus.textContent='Analytics could not be loaded. Your preference has been saved.';
  });
  function openCookieSettings(){
    cookieBanner.hidden=false;
    cookieBanner.querySelector('[data-cookie-choice="denied"]').focus();
  }
  document.querySelector('[data-open-cookie-settings]').addEventListener('click',openCookieSettings);
  document.querySelector('[data-close-cookie-banner]').addEventListener('click',()=>{
    cookieBanner.hidden=true;
  });
  if(location.hash==='#cookie-settings')openCookieSettings();
  cookieBanner.hidden=window.unformAnalytics.hasSavedPreference;
  if(!window.unformAnalytics.hasSavedPreference){
    try{
      if(localStorage.getItem(consentKey)){
        cookieStatus.textContent='Your browser could not read a saved cookie preference. Please choose below.';
      }
    }catch(error){
      console.error('Could not read the saved cookie preference.',error);
      cookieStatus.textContent='Your browser could not read a saved cookie preference. Please choose below.';
    }
  }
  if(window.gsap&&window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);gsap.matchMedia().add('(prefers-reduced-motion: no-preference)',()=>{
    gsap.from('.headline-line',{y:65,opacity:0,duration:1.15,stagger:.12,ease:'power3.out'});
    gsap.from('.hero-eyebrow,.hero-bottom,.hero-caption',{opacity:0,y:15,duration:.8,delay:.45,stagger:.1});
    gsap.utils.toArray('.reveal').forEach(element=>gsap.from(element,{y:45,opacity:0,duration:.9,ease:'power2.out',scrollTrigger:{trigger:element,start:'top 92%',once:true}}));
    gsap.to('.count-star',{rotation:100,ease:'none',scrollTrigger:{trigger:'.studio',start:'top bottom',end:'bottom top',scrub:1}});
  });}
})();
