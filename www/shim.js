// يستبدل claude.use('db'|'downloads'|'assets') بـ Firebase + مشاركة الملفات
(function(){
  const BOOK=new URLSearchParams(location.search).get('b')||'ruwais-2026';
  let fs=null;
  function root(){
    if(!fs){ firebase.initializeApp(window.FIREBASE_CONFIG); fs=firebase.firestore(); fs.enablePersistence({synchronizeTabs:true}).catch(()=>{}); }
    return fs.collection('books').doc(BOOK);
  }
  const db={
    collection:n=>root().collection(n),
    doc:p=>{const a=p.split('/'); return root().collection(a[0]).doc(a.slice(1).join('/'));}
  };
  const dl={
    async save({filename,data}){
      const blob=data instanceof Blob?data:new Blob([data]);
      const C=window.Capacitor;
      if(C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins.Filesystem&&C.Plugins.Share){
        const b64=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(',')[1]);f.readAsDataURL(blob);});
        const w=await C.Plugins.Filesystem.writeFile({path:filename,data:b64,directory:'CACHE'});
        await C.Plugins.Share.share({title:filename,url:w.uri});
      }else{
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();
      }
    }
  };
  window.claude={use:async n=>n==='db'?db:n==='downloads'?dl:null}; // assets=null: رفع صور الفواتير مخفي بالنسخة الأولى
})();
