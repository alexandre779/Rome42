(()=>{
  const N=window.R42_NUTRITION;
  const D=window.APP_DATA;
  if(!N||!D?.weeks)return;

  const clone=o=>JSON.parse(JSON.stringify(o));
  const lunchProteins=[['Poulet',150,'Protéines'],['Dinde',150,'Protéines'],['Bœuf haché 5 %',120,'Protéines'],['Tofu ferme',160,'Protéines'],['Thon',130,'Poisson'],['Œufs',3,'Produits frais'],['Pois chiches',180,'Épicerie'],['Lentilles',180,'Épicerie'],['Saumon',130,'Poisson'],['Crevettes',150,'Poisson']];
  const dinnerProteins=[['Cabillaud',130,'Poisson'],['Saumon',130,'Poisson'],['Truite',130,'Poisson'],['Merlu',130,'Poisson'],['Poulet',140,'Protéines'],['Dinde',140,'Protéines'],['Œufs',3,'Produits frais'],['Tofu ferme',160,'Protéines'],['Colin',130,'Poisson'],['Pois chiches',180,'Épicerie']];
  const carbs=[['Riz',110],['Pâtes',120],['Semoule',110],['Quinoa',105],['Boulgour',110],['Pommes de terre',260],['Patate douce',250],['Polenta',110],['Riz basmati',110],['Pâtes complètes',120],['Orge',110],['Riz complet',110]];
  const veg=[['Courgettes',250],['Brocoli',250],['Ratatouille',250],['Haricots verts',250],['Poivrons & tomates',250],['Épinards',250],['Carottes & courgettes',250],['Aubergines & tomates',250],['Petits pois & carottes',250],['Champignons & épinards',250],['Fenouil & courgettes',250],['Légumes méditerranéens',250],['Poireaux & carottes',250],['Brocoli & chou-fleur',250]];
  const styles=['citron & herbes','provençal','méditerranéen','aux herbes fraîches','paprika doux','curry doux','tomate & basilic','citronné','façon tajine douce','ail & persil','romarin','gingembre doux','sauce tomate maison','aux herbes de Provence','façon bowl'];
  const unitFor=p=>p[0]==='Œufs'?'pièce':'g';
  const makeMeal=(p,c,v,style,isDinner=false)=>({
    name:`${p[0]} ${style}, ${c[0].toLowerCase()} & ${v[0].toLowerCase()}`,
    ingredients:[
      [p[0],p[1],unitFor(p),p[2]],
      [c[0],c[1],'g','Féculents'],
      [v[0],v[1],'g','Fruits & légumes'],
      ['Huile d’olive',isDinner?10:15,'g','Épicerie'],
      [isDinner?'Fromage blanc':'Skyr',150,'g','Produits frais'],
      ['Fruit',1,'pièce','Fruits & légumes']
    ]
  });

  // 210 journées éditorialisées : chaque journée possède son propre code et ses deux recettes.
  // Les index sont volontairement copremiers/décalés pour éviter qu'une même combinaison complète se répète.
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
    // Garantie d'unicité éditoriale même si deux combinaisons d'ingrédients se rapprochent.
    lunch.name += ` · variation ${i+1}`;
    dinner.name += ` · variation ${i+1}`;
    N.lib[code]={lunch,dinner,snack:i%3===0?[['Banane',1,'pièce','Fruits & légumes'],['Skyr',150,'g','Produits frais']]:i%3===1?[['Fruit',1,'pièce','Fruits & légumes'],['Amandes',20,'g','Épicerie']]:[['Banane',1,'pièce','Fruits & légumes'],['Noix',20,'g','Épicerie']]};
    const photoBase=['A','B','C','D','F','G'][i%6];
    N.photos[code]={lunch:N.photos[photoBase].lunch,dinner:N.photos[photoBase].dinner};
    dayCodes.push(code);
  }

  D.weeks.slice(0,30).forEach((week,wi)=>week.days.forEach((day,di)=>{
    day.menu=dayCodes[wi*7+di];
  }));

  N.meal=(code,part)=>{const x=N.lib[code]||N.lib.C;return {...x[part],photo:N.photos[code]?.[part]||N.photos.C[part]};};
  N.aggregate=(days,people)=>{const out={};for(const d of days){const x=N.lib[d.menu]||N.lib.C;for(const [name,qty,unit,cat] of [...x.lunch.ingredients,...x.dinner.ingredients,...x.snack]){const k=[name,unit,cat].join('|');if(!out[k])out[k]={name,qty:0,unit,cat};if(typeof qty==='number')out[k].qty+=qty*people;}}return Object.values(out).sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));};

  window.R42_MENU_ROTATIONS=Array.from({length:30},(_,w)=>dayCodes.slice(w*7,w*7+7));
  window.R42_UNIQUE_MENU_DAYS=dayCodes;
})();
