(()=>{
  const N=window.R42_NUTRITION;
  const D=window.APP_DATA;
  if(!N||!D?.weeks)return;

  // Portions adultes de référence par repas. Les féculents secs sont stockés en poids cru.
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
   * Direction artistique nutrition v2
   * -------------------------------
   * Une photo n'est plus choisie uniquement à partir de la protéine.
   * Le moteur construit une signature visuelle protéine + féculent + légumes + style,
   * puis choisit le visuel le plus spécifique disponible. Les fallbacks restent
   * strictement dans la même famille de plat : jamais de saumon pour un poisson blanc,
   * jamais de viande pour un plat végétal, jamais d'omelette pour un autre plat.
   *
   * Chaque entrée possède aussi des tags de contrôle. Ils rendent la bibliothèque
   * auditable et empêchent une future régression silencieuse.
   */
  const VISUALS={
    chickenRice:{url:'https://www.arise-app.com/images/dishes/es/bol-de-pollo-a-la-plancha-con-arroz-y-verduras-6swya5.webp',tags:['poulet','riz','légumes']},
    chickenCouscous:{url:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=82',tags:['poulet','semoule','légumes']},
    turkeyCouscous:{url:'https://cdn.sanity.io/images/om0huuvj/production/0f13603b1ec558a6a8eb8ebeb561ec3b756d49b8-5302x3535.jpg?fit=max&w=1200',tags:['dinde','semoule','courgettes','carottes']},
    beefPasta:{url:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=82',tags:['bœuf','pâtes','tomate']},
    tofuRice:{url:'https://theartoffoodandwine.com/wp-content/uploads/2021/05/Buddha-process-4-1024x1015.jpg',tags:['tofu','riz','brocoli','épinards']},
    chickpeaQuinoa:{url:'https://img-3.journaldesfemmes.fr/k8RnaTcDELjghEuJMdA7X4atwFY=/800x600/24065e8f90884d1ab4ac0ae2a1322ed1/ccmcms-jdf/40040114.jpg',tags:['pois chiches','quinoa','brocoli','carottes']},
    lentilRice:{url:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=82',tags:['lentilles','riz','légumes']},
    salmon:{url:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=82',tags:['saumon','légumes']},
    shrimpRice:{url:'https://www.arise-app.com/images/dishes/de/garnelengemusebowl-mit-reis-und-avocado-w9564k.webp',tags:['crevettes','riz','brocoli','carottes']},
    codRiceZucchini:{url:'https://v.cdn.ww.com/media/system/wine/5859da100e69795aab1a580f/1160d950-46d9-4c30-9a6a-b92ad3fa8593/ikrwuuxapt2zsap9xx6m.jpg?enable=upscale&fit=crop&height=900&quality=82&width=900',tags:['cabillaud','riz','courgettes']},
    whiteFishPasta:{url:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=82',tags:['poisson blanc','pâtes','légumes']},
    whiteFish:{url:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=82',tags:['poisson blanc','légumes']},
    eggs:{url:'https://d15j9y5wlusr11.cloudfront.net/filehub/image/a385cf36-c3e9-47ab-af82-31bd57b642ed/7331375702410153/recipes_photos/568.jpg',tags:['œufs','pommes de terre','brocoli']},
    plant:{url:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=82',tags:['végétal','légumes']}
  };

  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const has=(s,re)=>re.test(norm(s));
  function visualFor(p,c,v,style){
    const protein=norm(p[0]), carb=norm(c[0]), vegetable=norm(v[0]), cooking=norm(style);
    let key;
    if(has(protein,/cabillaud/) && has(carb,/riz/) && has(vegetable,/courgette/)) key='codRiceZucchini';
    else if(has(protein,/crevette/) && has(carb,/riz/)) key='shrimpRice';
    else if(has(protein,/tofu/) && has(carb,/riz/)) key='tofuRice';
    else if(has(protein,/pois chiche/) && has(carb,/quinoa/)) key='chickpeaQuinoa';
    else if(has(protein,/lentille/) && has(carb,/riz/)) key='lentilRice';
    else if(has(protein,/dinde/) && has(carb,/semoule/)) key='turkeyCouscous';
    else if(has(protein,/poulet/) && has(carb,/semoule/)) key='chickenCouscous';
    else if(has(protein,/poulet/) && has(carb,/riz/)) key='chickenRice';
    else if(has(protein,/boeuf/) && has(carb,/pate/)) key='beefPasta';
    else if(has(protein,/saumon|truite/)) key='salmon';
    else if(has(protein,/cabillaud|merlu|colin|thon/) && has(carb,/pate/)) key='whiteFishPasta';
    else if(has(protein,/cabillaud|merlu|colin|thon/)) key='whiteFish';
    else if(has(protein,/oeuf/)) key='eggs';
    else if(has(protein,/crevette/)) key='shrimpRice';
    else if(has(protein,/poulet|dinde/)) key='chickenRice';
    else if(has(protein,/boeuf/)) key='beefPasta';
    else key='plant';
    const visual=VISUALS[key];
    return {url:visual.url,key,tags:visual.tags,signature:[p[0],c[0],v[0],style].join(' | ')};
  }

  const dayCodes=[];
  const visualAudit=[];
  for(let i=0;i<210;i++){
    const code=`U${String(i+1).padStart(3,'0')}`;
    const lp=lunchProteins[i%lunchProteins.length];
    const lc=carbs[(i*5+Math.floor(i/10))%carbs.length];
    const lv=veg[(i*3+Math.floor(i/7))%veg.length];
    const ls=styles[(i*7+Math.floor(i/14))%styles.length];
    const dp=dinnerProteins[(i*7+3)%dinnerProteins.length];
    const dc=carbs[(i*7+4+Math.floor(i/9))%carbs.length];
    const dv=veg[(i*5+6+Math.floor(i/11))%veg.length];
    const ds=styles[(i*11+5+Math.floor(i/13))%styles.length];
    const lunch=makeMeal(lp,lc,lv,ls,false), dinner=makeMeal(dp,dc,dv,ds,true);
    const lunchVisual=visualFor(lp,lc,lv,ls), dinnerVisual=visualFor(dp,dc,dv,ds);
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
  window.R42_RECIPE_VISUALS=VISUALS;
})();