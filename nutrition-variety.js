(()=>{
  const N=window.R42_NUTRITION;
  const D=window.APP_DATA;
  if(!N||!D?.weeks)return;

  const clone=o=>JSON.parse(JSON.stringify(o));
  const add=(code,base,lunchName,dinnerName,lunchChanges,dinnerChanges)=>{
    const x=clone(N.lib[base]);
    x.lunch.name=lunchName;
    x.dinner.name=dinnerName;
    for(const [i,row] of Object.entries(lunchChanges||{}))x.lunch.ingredients[+i]=row;
    for(const [i,row] of Object.entries(dinnerChanges||{}))x.dinner.ingredients[+i]=row;
    N.lib[code]=x;
  };

  add('H','A','Poulet citron, boulgour & légumes','Truite, pommes de terre & haricots verts',
    {1:['Boulgour',120,'g','Féculents']},
    {0:['Truite',120,'g','Poisson'],2:['Haricots verts',250,'g','Fruits & légumes']});
  add('I','C','Dinde tomate, quinoa & légumes','Colin, semoule & ratatouille',
    {1:['Quinoa',110,'g','Féculents'],2:['Légumes méditerranéens',250,'g','Fruits & légumes']},
    {0:['Colin',120,'g','Poisson'],1:['Semoule',110,'g','Féculents'],2:['Ratatouille',250,'g','Fruits & légumes']});
  add('J','D','Boulettes de bœuf, semoule & légumes','Poulet provençal, riz & légumes',
    {1:['Semoule',110,'g','Féculents'],2:['Légumes variés',250,'g','Fruits & légumes']},
    {1:['Riz',120,'g','Féculents']});
  add('K','F','Poulet tikka doux, riz & légumes','Merlu, pommes de terre & épinards',
    {},
    {0:['Merlu',120,'g','Poisson'],1:['Pommes de terre',260,'g','Féculents'],2:['Épinards',250,'g','Fruits & légumes']});
  add('L','B','Bœuf, riz & poivrons','Frittata pommes de terre & légumes',
    {1:['Riz',110,'g','Féculents'],2:['Poivrons / tomates',250,'g','Fruits & légumes']},
    {1:['Pommes de terre',220,'g','Féculents']});

  const extraPhotos={
    H:{lunch:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',dinner:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'},
    I:{lunch:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',dinner:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80'},
    J:{lunch:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',dinner:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80'},
    K:{lunch:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80',dinner:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'},
    L:{lunch:'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',dinner:'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80'}
  };
  Object.assign(N.photos,extraPhotos);
  // Cabillaud: retire l'ancienne photo de saumon et utilise un visuel générique de poisson blanc.
  N.photos.C.dinner='https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80';

  const rotations=[
    ['C','A','B','H','D','F','G'],
    ['I','J','A','K','L','H','G'],
    ['B','I','D','A','K','J','G'],
    ['H','L','C','J','A','I','G'],
    ['K','A','I','D','H','L','G'],
    ['J','C','H','L','I','K','G']
  ];
  D.weeks.forEach((week,wi)=>week.days.forEach((day,di)=>{day.menu=rotations[wi%rotations.length][di];}));

  // meal() avait fermé sur les anciennes références : on le remplace pour inclure les nouvelles recettes/photos.
  N.meal=(code,part)=>{const x=N.lib[code]||N.lib.C;return {...x[part],photo:N.photos[code]?.[part]||N.photos.C[part]};};
  // aggregate() idem, afin que les changements soient automatiquement reflétés dans les courses.
  N.aggregate=(days,people)=>{const out={};for(const d of days){const x=N.lib[d.menu]||N.lib.C;for(const [name,qty,unit,cat] of [...x.lunch.ingredients,...x.dinner.ingredients,...x.snack]){const k=[name,unit,cat].join('|');if(!out[k])out[k]={name,qty:0,unit,cat};if(typeof qty==='number')out[k].qty+=qty*people;}}return Object.values(out).sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));};
})();
