(()=>{
  const N=window.R42_NUTRITION;
  const D=window.APP_DATA;
  if(!N||!D?.weeks)return;

  // Portions adultes de référence par repas. Les féculents secs sont stockés en poids cru.
  // Les facteurs individuels/foyer restent appliqués ensuite par nutrition-family-recipe.js.
  const lunchProteins=[['Poulet',140,'Protéines'],['Dinde',140,'Protéines'],['Bœuf haché 5 %',120,'Protéines'],['Tofu ferme',160,'Protéines'],['Thon',130,'Poisson'],['Œufs',2,'Produits frais'],['Pois chiches',160,'Épicerie'],['Lentilles',160,'Épicerie'],['Saumon',130,'Poisson'],['Crevettes',140,'Poisson']];
  const dinnerProteins=[['Cabillaud',130,'Poisson'],['Saumon',130,'Poisson'],['Truite',130,'Poisson'],['Merlu',130,'Poisson'],['Poulet',140,'Protéines'],['Dinde',140,'Protéines'],['Œufs',2,'Produits frais'],['Tofu ferme',160,'Protéines'],['Colin',130,'Poisson'],['Pois chiches',160,'Épicerie']];
  const carbs=[['Riz',90],['Pâtes',100],['Semoule',90],['Quinoa',85],['Boulgour',90],['Pommes de terre',250],['Patate douce',240],['Polenta',90],['Riz basmati',90],['Pâtes complètes',100],['Orge',90],['Riz complet',90]];
  const veg=[['Courgettes',250],['Brocoli',250],['Ratatouille',250],['Haricots verts',250],['Poivrons & tomates',250],['Épinards',250],['Carottes & courgettes',250],['Aubergines & tomates',250],['Petits pois & carottes',250],['Champignons & épinards',250],['Fenouil & courgettes',250],['Légumes méditerranéens',250],['Poireaux & carottes',250],['Brocoli & chou-fleur',250]];
  const styles=['citron & herbes','provençal','méditerranéen','aux herbes fraîches','paprika doux','curry doux','tomate & basilic','citronné','façon tajine douce','ail & persil','romarin','gingembre doux','sauce tomate maison','aux herbes de Provence','façon bowl'];
  const unitFor=p=>p[0]==='Œufs'?'pièce':'g';
  const makeMeal=(p,c,v,style,isDinner=false)=>({
    name:`${p[0]} ${style}, ${c[0].toLowerCase()} & ${v[0].toLowerCase()}`,
    ingredients:[
      [p[0],p[1],unitFor(p),p[2]],
      [c[0],c[1],'g','Féculents'],
      [v[0],v[1],'g','Fruits & légumes'],
      ['Huile d’olive',10,'g','Épicerie'],
      [isDinner?'Fromage blanc':'Skyr',125,'g','Produits frais'],
      ['Fruit',1,'pièce','Fruits & légumes']
    ]
  });

  // Visuels par famille alimentaire : on privilégie la cohérence du plat plutôt qu'une rotation arbitraire.
  // Images Unsplash génériques et stables ; aucune photo de saumon ne sert pour un poisson blanc.
  const IMG={
    chicken:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
    beef:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
    salmon:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    whiteFish:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80',
    eggs:'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
    plant:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    shrimp:'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80'
  };
  function photoFor(protein){
    const x=protein[0].toLowerCase();
    if(/saumon|truite/.test(x))return IMG.salmon;
    if(/cabillaud|merlu|colin|thon/.test(x))return IMG.whiteFish;
    if(/crevette/.test(x))return IMG.shrimp;
    if(/œuf/.test(x))return IMG.eggs;
    if(/bœuf/.test(x))return IMG.beef;
    if(/poulet|dinde/.test(x))return IMG.chicken;
    return IMG.plant;
  }

  const dayCodes=[];
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
    N.lib[code]={lunch,dinner,snack:i%3===0?[['Banane',1,'pièce','Fruits & légumes'],['Skyr',125,'g','Produits frais']]:i%3===1?[['Fruit',1,'pièce','Fruits & légumes'],['Amandes',15,'g','Épicerie']]:[['Banane',1,'pièce','Fruits & légumes'],['Noix',15,'g','Épicerie']]};
    N.photos[code]={lunch:photoFor(lp),dinner:photoFor(dp)};
    dayCodes.push(code);
  }

  D.weeks.slice(0,30).forEach((week,wi)=>week.days.forEach((day,di)=>{day.menu=dayCodes[wi*7+di];}));
  N.meal=(code,part)=>{const x=N.lib[code]||N.lib.C;return {...x[part],photo:N.photos[code]?.[part]||N.photos.C[part]};};
  N.aggregate=(days,people)=>{const out={};for(const d of days){const x=N.lib[d.menu]||N.lib.C;for(const [name,qty,unit,cat] of [...x.lunch.ingredients,...x.dinner.ingredients,...x.snack]){const k=[name,unit,cat].join('|');if(!out[k])out[k]={name,qty:0,unit,cat};if(typeof qty==='number')out[k].qty+=qty*people;}}return Object.values(out).sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));};
  window.R42_MENU_ROTATIONS=Array.from({length:30},(_,w)=>dayCodes.slice(w*7,w*7+7));
  window.R42_UNIQUE_MENU_DAYS=dayCodes;
})();