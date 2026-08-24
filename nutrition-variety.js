(()=>{
  const N=window.R42_NUTRITION;
  const D=window.APP_DATA;
  if(!N||!D?.weeks)return;

  const lunchProteins=[['Poulet',140,'Protéines'],['Dinde',140,'Protéines'],['Bœuf haché 5 %',120,'Protéines'],['Tofu ferme',160,'Protéines'],['Thon',130,'Poisson'],['Œufs',2,'Produits frais'],['Pois chiches',160,'Épicerie'],['Lentilles',160,'Épicerie'],['Saumon',130,'Poisson'],['Crevettes',140,'Poisson']];
  const dinnerProteins=[['Cabillaud',130,'Poisson'],['Saumon',130,'Poisson'],['Truite',130,'Poisson'],['Merlu',130,'Poisson'],['Poulet',140,'Protéines'],['Dinde',140,'Protéines'],['Œufs',2,'Produits frais'],['Tofu ferme',160,'Protéines'],['Colin',130,'Poisson'],['Pois chiches',160,'Épicerie']];
  const carbs=[['Riz',90],['Pâtes',100],['Semoule',90],['Quinoa',85],['Boulgour',90],['Pommes de terre',250],['Patate douce',240],['Polenta',90],['Riz basmati',90],['Pâtes complètes',100],['Orge',90],['Riz complet',90]];
  const veg=[['Courgettes',250],['Brocoli',250],['Ratatouille',250],['Haricots verts',250],['Poivrons & tomates',250],['Épinards',250],['Carottes & courgettes',250],['Aubergines & tomates',250],['Petits pois & carottes',250],['Champignons & épinards',250],['Fenouil & courgettes',250],['Légumes méditerranéens',250],['Poireaux & carottes',250],['Brocoli & chou-fleur',250]];
  const styles=['citron & herbes','provençal','méditerranéen','aux herbes fraîches','paprika doux','curry doux','tomate & basilic','citronné','façon tajine douce','ail & persil','romarin','gingembre doux','sauce tomate maison','aux herbes de Provence','façon bowl'];
  const unitFor=p=>p[0]==='Œufs'?'pièce':'g';
  const makeMeal=(p,c,v,style,isDinner=false)=>({name:`${p[0]} ${style}, ${c[0].toLowerCase()} & ${v[0].toLowerCase()}`,ingredients:[[p[0],p[1],unitFor(p),p[2]],[c[0],c[1],'g','Féculents'],[v[0],v[1],'g','Fruits & légumes'],['Huile d’olive',10,'g','Épicerie'],[isDinner?'Fromage blanc':'Skyr',125,'g','Produits frais'],['Fruit',1,'pièce','Fruits & légumes']]});

  /* Rome42 photo library v4: photography only. No generated illustrations. */
  const P={
    chickenRice:'https://images.unsplash.com/photo-1772729440931-e8efd3adc748?auto=format&fit=crop&w=1000&q=82',
    chickenRiceAlt:'https://images.unsplash.com/photo-1757715378233-9c849d3416ea?auto=format&fit=crop&w=1000&q=82',
    chicken:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=82',
    turkeyCouscous:'https://cdn.sanity.io/images/om0huuvj/production/0f13603b1ec558a6a8eb8ebeb561ec3b756d49b8-5302x3535.jpg?fit=max&w=1200',
    beefPasta:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=82',
    tofuBowl:'https://theartoffoodandwine.com/wp-content/uploads/2021/05/Buddha-process-4-1024x1015.jpg',
    chickpeaQuinoa:'https://img-3.journaldesfemmes.fr/k8RnaTcDELjghEuJMdA7X4atwFY=/800x600/24065e8f90884d1ab4ac0ae2a1322ed1/ccmcms-jdf/40040114.jpg',
    plant:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=82',
    salmon:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=82',
    salmonPotato:'https://fitfoodway.hu/media/produse/lazacfile-natur-burgonyaval-brokkolival-es-koktelparadicsommal.jpg',
    whiteFishRice:'https://media.hellofresh.com/w_1200,q_auto,f_auto,c_limit,fl_lossy/recipes/image/0197eaca-d5fc-7970-8021-a2d09cf2c58b-bfc82efc.jpg',
    whiteFish:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=82',
    fishPasta:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=82',
    eggs:'https://s3.garlyn.ru/recipe-images/70ab43d5-4c34-4138-8228-1d64dce508c0/9d5c82aa-e47f-4399-8607-c2445f214eaf.png',
    shrimpRice:'https://www.arise-app.com/images/dishes/de/garnelengemusebowl-mit-reis-und-avocado-w9564k.webp',
    pastaVeg:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=82'
  };
  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const has=(s,re)=>re.test(norm(s));
  function photoFor(p,c,v,style,i){
    const protein=norm(p[0]),carb=norm(c[0]),vegetable=norm(v[0]),cooking=norm(style);
    if(has(protein,/cabillaud|merlu|colin/)&&has(carb,/riz/))return {url:P.whiteFishRice,key:'whiteFishRice'};
    if(has(protein,/cabillaud|merlu|colin|thon/)&&has(carb,/pate/))return {url:P.fishPasta,key:'fishPasta'};
    if(has(protein,/cabillaud|merlu|colin|thon/))return {url:P.whiteFish,key:'whiteFish'};
    if(has(protein,/saumon|truite/)&&has(carb,/pomme de terre|patate douce/))return {url:P.salmonPotato,key:'salmonPotato'};
    if(has(protein,/saumon|truite/))return {url:P.salmon,key:'salmon'};
    if(has(protein,/crevette/)&&has(carb,/riz/))return {url:P.shrimpRice,key:'shrimpRice'};
    if(has(protein,/crevette/))return {url:P.shrimpRice,key:'shrimpRice'};
    if(has(protein,/boeuf/)&&has(carb,/pate/))return {url:P.beefPasta,key:'beefPasta'};
    if(has(protein,/boeuf/))return {url:P.beefPasta,key:'beef'};
    if(has(protein,/oeuf/))return {url:P.eggs,key:'eggs'};
    if(has(protein,/dinde/)&&has(carb,/semoule|boulgour/))return {url:P.turkeyCouscous,key:'turkeyCouscous'};
    if(has(protein,/poulet|dinde/)&&has(carb,/riz/))return {url:i%2?P.chickenRice:P.chickenRiceAlt,key:'chickenRice'};
    if(has(protein,/poulet|dinde/)&&has(carb,/pate/))return {url:P.chicken,key:'chickenPasta'};
    if(has(protein,/poulet|dinde/))return {url:P.chicken,key:'chicken'};
    if(has(protein,/tofu/))return {url:P.tofuBowl,key:'tofuBowl'};
    if(has(protein,/pois chiche/)&&has(carb,/quinoa|boulgour|semoule/))return {url:P.chickpeaQuinoa,key:'chickpeaQuinoa'};
    if(has(protein,/lentille|pois chiche/))return {url:P.plant,key:'legumeBowl'};
    if(has(carb,/pate/))return {url:P.pastaVeg,key:'pastaVeg'};
    return {url:P.plant,key:'plant'};
  }

  const dayCodes=[],visualAudit=[];
  for(let i=0;i<210;i++){
    const code=`U${String(i+1).padStart(3,'0')}`;
    const lp=lunchProteins[i%lunchProteins.length],lc=carbs[(i*5+Math.floor(i/10))%carbs.length],lv=veg[(i*3+Math.floor(i/7))%veg.length],ls=styles[(i*7+Math.floor(i/14))%styles.length];
    const dp=dinnerProteins[(i*7+3)%dinnerProteins.length],dc=carbs[(i*7+4+Math.floor(i/9))%carbs.length],dv=veg[(i*5+6+Math.floor(i/11))%veg.length],ds=styles[(i*11+5+Math.floor(i/13))%styles.length];
    const lunch=makeMeal(lp,lc,lv,ls,false),dinner=makeMeal(dp,dc,dv,ds,true),lviz=photoFor(lp,lc,lv,ls,i),dviz=photoFor(dp,dc,dv,ds,i+1);
    N.lib[code]={lunch,dinner,snack:i%3===0?[['Banane',1,'pièce','Fruits & légumes'],['Skyr',125,'g','Produits frais']]:i%3===1?[['Fruit',1,'pièce','Fruits & légumes'],['Amandes',15,'g','Épicerie']]:[['Banane',1,'pièce','Fruits & légumes'],['Noix',15,'g','Épicerie']]};
    N.photos[code]={lunch:lviz.url,dinner:dviz.url};
    visualAudit.push({code,part:'lunch',recipe:lunch.name,mode:'photo',key:lviz.key,url:lviz.url},{code,part:'dinner',recipe:dinner.name,mode:'photo',key:dviz.key,url:dviz.url});
    dayCodes.push(code);
  }
  D.weeks.slice(0,30).forEach((week,wi)=>week.days.forEach((day,di)=>{day.menu=dayCodes[wi*7+di];}));
  N.meal=(code,part)=>{const x=N.lib[code]||N.lib.C;return {...x[part],photo:N.photos[code]?.[part]||N.photos.C[part]};};
  N.aggregate=(days,people)=>{const out={};for(const d of days){const x=N.lib[d.menu]||N.lib.C;for(const [name,qty,unit,cat] of [...x.lunch.ingredients,...x.dinner.ingredients,...x.snack]){const k=[name,unit,cat].join('|');if(!out[k])out[k]={name,qty:0,unit,cat};if(typeof qty==='number')out[k].qty+=qty*people;}}return Object.values(out).sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));};
  window.R42_MENU_ROTATIONS=Array.from({length:30},(_,w)=>dayCodes.slice(w*7,w*7+7));
  window.R42_UNIQUE_MENU_DAYS=dayCodes;
  window.R42_RECIPE_VISUAL_AUDIT=visualAudit;
})();