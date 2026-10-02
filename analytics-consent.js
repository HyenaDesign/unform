(() => {
  'use strict';
  const analyticsId='G-FQYX2GBM5P';
  const consentKey='unform-cookie-consent-v1';
  const consentLifetime=183*24*60*60*1000;
  let analyticsLoaded=false;
  window[`ga-disable-${analyticsId}`]=true;

  function enableAnalytics(){
    window[`ga-disable-${analyticsId}`]=false;
    if(analyticsLoaded){
      window.gtag('event','page_view');
      return;
    }
    analyticsLoaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config',analyticsId,{
      allow_google_signals:false,
      allow_ad_personalization_signals:false
    });
    const analyticsScript=document.createElement('script');
    analyticsScript.async=true;
    analyticsScript.src=`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    analyticsScript.onerror=()=>{
      analyticsLoaded=false;
      console.error('Google Analytics could not be loaded.');
      window.dispatchEvent(new Event('unform-analytics-error'));
    };
    document.head.append(analyticsScript);
  }

  function disableAnalytics(){
    window[`ga-disable-${analyticsId}`]=true;
    document.cookie.split(';').forEach(cookie=>{
      const name=cookie.split('=')[0].trim();
      if(name==='_ga'||name.startsWith('_ga_')){
        document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;
        const hostname=location.hostname.split('.');
        if(hostname.length>2){
          document.cookie=`${name}=; Max-Age=0; path=/; domain=.${hostname.slice(-2).join('.')}; SameSite=Lax`;
        }
      }
    });
  }

  const analyticsConsent={
    hasSavedPreference:false,
    setConsent(accepted){
      if(accepted)enableAnalytics();
      else disableAnalytics();
    }
  };
  window.unformAnalytics=analyticsConsent;

  try{
    const stored=localStorage.getItem(consentKey);
    if(!stored)return;
    const consent=JSON.parse(stored);
    if(typeof consent.analytics!=='boolean'||!Number.isFinite(consent.expiresAt)){
      localStorage.removeItem(consentKey);
      return;
    }
    if(consent.expiresAt<=Date.now()){
      localStorage.removeItem(consentKey);
      return;
    }
    analyticsConsent.hasSavedPreference=true;
    if(consent.analytics)enableAnalytics();
  }catch(error){
    console.error('Could not read the saved cookie preference.',error);
  }
})();
