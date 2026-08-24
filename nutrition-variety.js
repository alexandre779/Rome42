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
  const makeMeal=(p,c,v,style,isDinner=false)=>({
    name:`${p[0]} ${style}, ${c[0].toLowerCase()} & ${v[0].toLowerCase()}`,
    ingredients:[[p[0],p[1],unitFor(p),p[2]],[c[0],c[1],'g','Féculents'],[v[0],v[1],'g','Fruits & légumes'],['Huile d’olive',10,'g','Épicerie'],[isDinner?'Fromage blanc':'Skyr',125,'g','Produits frais'],['Fruit',1,'pièce','Fruits & légumes']]
  });

  /*
   * Direction artistique nutrition v3
   * -------------------------------
   * 1. Quelques photos sont conservées uniquement quand elles correspondent réellement
   *    à un archétype de recette précis.
   * 2. Tous les autres plats utilisent une illustration Rome42 générée à partir des
   *    ingrédients exacts. On préfère un visuel volontairement éditorial et exact à une
   *    photo trompeuse. Cela garantit 420 visuels cohérents, sans dépendre d'une photo
   *    générique de protéine.
   * 3. Chaque visuel est auditable via R42_RECIPE_VISUAL_AUDIT.
   */
  const EXACT_PHOTOS={
    chickenRice:{url:'https://www.arise-app.com/images/dishes/es/bol-de-pollo-a-la-plancha-con-arroz-y-verduras-6swya5.webp',tags:['poulet','riz','légumes']},
    beefPasta:{url:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=82',tags:['bœuf','pâtes','tomate']},
    tofuRice:{url:'https://theartoffoodandwine.com/wp-content/uploads/2021/05/Buddha-process-4-1024x1015.jpg',tags:['tofu','riz','légumes']},
    chickpeaQuinoa:{url:'https://img-3.journaldesfemmes.fr/k8RnaTcDELjghEuJMdA7X4atwFY=/800x600/24065e8f90884d1ab4ac0ae2a1322ed1/ccmcms-jdf/40040114.jpg',tags:['pois chiches','quinoa','légumes']},
    salmonPotato:{url:'https://fitfoodway.hu/media/produse/lazacfile-natur-burgonyaval-brokkolival-es-koktelparadicsommal.jpg',tags:['saumon','pommes de terre','brocoli','tomates']},
    codRiceZucchini:{url:'https://media.hellofresh.com/w_3840%2Cq_auto%2Cf_auto%2Cc_limit%2Cfl_lossy/recipes/image/0197eaca-d5fc-7970-8021-a2d09cf2c58b-bfc82efc.jpg',tags:['poisson blanc','riz','courgettes']},
    eggsVeg:{url:'https://s3.garlyn.ru/recipe-images/70ab43d5-4c34-4138-8228-1d64dce508c0/9d5c82aa-e47f-4399-8607-c2445f214eaf.png',tags:['œufs','légumes']}
  };

  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const has=(s,re)=>re.test(norm(s));
  const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const hash=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const PALETTES=[
    ['#7d202d','#d47655','#f2d39a','#fbf4e9'],['#243f35','#6b8c72','#e4b86b','#f5f2e8'],
    ['#3e2a2a','#a14f3d','#d6a76b','#f7eee5'],['#233a4a','#6d92a5','#d3b36c','#f4f0e7'],
    ['#56334b','#a45f75','#d6b56c','#f8efe8'],['#2d3c2b','#81955c','#c9a36a','#f5efe3']
  ];
  function illustrationFor(p,c,v,style,part,seed){
    const signature=[p[0],c[0],v[0],style,part,seed].join('|');
    const pal=PALETTES[hash(signature)%PALETTES.length];
    const protein=xml(p[0]), carb=xml(c[0]), vegetable=xml(v[0]), cooking=xml(style);
    const title=protein.length>16?protein.slice(0,15)+'…':protein;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal[3]}"/><stop offset="1" stop-color="${pal[2]}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-opacity=".14"/></filter></defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <circle cx="980" cy="120" r="210" fill="${pal[1]}" opacity=".12"/><circle cx="150" cy="760" r="260" fill="${pal[0]}" opacity=".09"/>
      <g filter="url(#s)"><ellipse cx="600" cy="460" rx="360" ry="275" fill="#fffdf8"/><ellipse cx="600" cy="460" rx="305" ry="225" fill="#f7f0e6"/></g>
      <path d="M360 420c60-100 180-125 285-55 65 44 82 124 38 185-42 58-140 93-226 50-91-45-139-111-97-180z" fill="${pal[0]}" opacity=".92"/>
      <path d="M655 340c84-32 185 17 204 100 19 82-43 151-132 159-78 7-137-43-145-106-9-71 19-127 73-153z" fill="${pal[2]}" opacity=".96"/>
      <g fill="${pal[1]}" opacity=".94"><circle cx="725" cy="565" r="44"/><circle cx="782" cy="540" r="35"/><circle cx="814" cy="585" r="31"/><circle cx="754" cy="610" r="29"/><circle cx="690" cy="615" r="27"/></g>
      <g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" fill="#1c1b19"><text x="74" y="96" font-size="24" font-weight="800" letter-spacing="4" fill="${pal[0]}">ROME42 · ${part==='lunch'?'DÉJEUNER':'DÎNER'}</text><text x="74" y="155" font-size="52" font-weight="900">${title}</text><text x="74" y="200" font-size="25" font-weight="700" fill="#69635d">${cooking}</text></g>
      <g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" font-size="24" font-weight="800"><rect x="78" y="742" rx="30" width="300" height="62" fill="#fff" opacity=".88"/><text x="112" y="782" fill="#292723">${carb}</text><rect x="398" y="742" rx="30" width="480" height="62" fill="#fff" opacity=".88"/><text x="432" y="782" fill="#292723">${vegetable}</text></g>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }

  function exactPhotoFor(p,c,v){
    const protein=norm(p[0]),carb=norm(c[0]),vegetable=norm(v[0]);
    if(has(protein,/poulet/)&&has(carb,/riz/)&&has(vegetable,/brocoli|carotte|legume/))return ['chickenRice',EXACT_PHOTOS.chickenRice];
    if(has(protein,/boeuf/)&&has(carb,/pate/)&&has(vegetable,/tomate/))return ['beefPasta',EXACT_PHOTOS.beefPasta];
    if(has(protein,/tofu/)&&has(carb,/riz/)&&has(vegetable,/brocoli|epinard|legume/))return ['tofuRice',EXACT_PHOTOS.tofuRice];
    if(has(protein,/pois chiche/)&&has(carb,/quinoa/))return ['chickpeaQuinoa',EXACT_PHOTOS.chickpeaQuinoa];
    if(has(protein,/saumon/)&&has(carb,/pomme de terre/)&&has(vegetable,/brocoli|tomate|legume/))return ['salmonPotato',EXACT_PHOTOS.salmonPotato];
    if(has(protein,/cabillaud|merlu|colin/)&&has(carb,/riz/)&&has(vegetable,/courgette/))return ['codRiceZucchini',EXACT_PHOTOS.codRiceZucchini];
    if(has(protein,/oeuf/)&&has(vegetable,/legume|poivron|tomate|courgette/))return ['eggsVeg',EXACT_PHOTOS.eggsVeg];
    return null;
  }
  function visualFor(p,c,v,style,part,code){
    const exact=exactPhotoFor(p,c,v);
    if(exact)return {url:exact[1].url,key:exact[0],tags:exact[1].tags,mode:'photo',signature:[p[0],c[0],v[0],style].join(' | ')};
    return {url:illustrationFor(p,c,v,style,part,code),key:'recipeIllustration',tags:[p[0],c[0],v[0],style],mode:'illustration',signature:[p[0],c[0],v[0],style].join(' | ')};
  }

  const dayCodes=[];
  const visualAudit=[];
  for(let i=0;i<210;i++){
    const code=`U${String(i+1).padStart(3,'0')}`;
    const lp=lunchProteins[i%lunchProteins.length],lc=carbs[(i*5+Math.floor(i/10))%carbs.length],lv=veg[(i*3+Math.floor(i/7))%veg.length],ls=styles[(i*7+Math.floor(i/14))%styles.length];
    const dp=dinnerProteins[(i*7+3)%dinnerProteins.length],dc=carbs[(i*7+4+Math.floor(i/9))%carbs.length],dv=veg[(i*5+6+Math.floor(i/11))%veg.length],ds=styles[(i*11+5+Math.floor(i/13))%styles.length];
    const lunch=makeMeal(lp,lc,lv,ls,false),dinner=makeMeal(dp,dc,dv,ds,true);
    const lunchVisual=visualFor(lp,lc,lv,ls,'lunch',code+'L'),dinnerVisual=visualFor(dp,dc,dv,ds,'dinner',code+'D');
    N.lib[code]={lunch,dinner,snack:i%3===0?[['Banane',1,'pièce','Fruits & légumes'],['Skyr',125,'g','Produits frais']]:i%3===1?[['Fruit',1,'pièce','Fruits & légumes'],['Amandes',15,'g','Épicerie']]:[['Banane',1,'pièce','Fruits & légumes'],['Noix',15,'g','Épicerie']]};
    N.photos[code]={lunch:lunchVisual.url,dinner:dinnerVisual.url};
    visualAudit.push({code,part:'lunch',recipe:lunch.name,...lunchVisual},{code,part:'dinner',recipe:dinner.name,...dinnerVisual});
    dayCodes.push(code);
  }

  D.weeks.slice(0,30).forEach((week,wi)=>week.days.forEach((day,di)=>{day.menu=dayCodes[wi*7+di];}));
  N.meal=(code,part)=>{const x=N.lib[code]||N.lib.C;return {...x[part],photo:N.photos[code]?.[part]||N.photos.C[part]};};
  N.aggregate=(days,people)=>{const out={};for(const d of days){const x=N.lib[d.menu]||N.lib.C;for(const [name,qty,unit,cat] of [...x.lunch.ingredients,...x.dinner.ingredients,...x.snack]){const k=[name,unit,cat].join('|');if(!out[k])out[k]={name,qty:0,unit,cat};if(typeof qty==='number')out[k].qty+=qty*people;}}return Object.values(out).sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));};
  window.R42_MENU_ROTATIONS=Array.from({length:30},(_,w)=>dayCodes.slice(w*7,w*7+7));
  window.R42_UNIQUE_MENU_DAYS=dayCodes;
  window.R42_RECIPE_VISUAL_AUDIT=visualAudit;
  window.R42_RECIPE_VISUALS={exact:EXACT_PHOTOS,mode:'exact-photo-or-recipe-specific-illustration'};
})();