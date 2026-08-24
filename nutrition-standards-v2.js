(()=>{
const N=()=>window.R42_NUTRITION;
const protein=/^(poulet|dinde|bœuf|saumon|cabillaud|poisson blanc|truite|thon|colin|merlu|crevettes)$/i;
const cookedStarch=/^(riz|pâtes|semoule|quinoa|boulgour|polenta)$/i;
function target(name,qty,unit){const l=String(name).toLowerCase();if(unit==='pièce'&&l.includes('œuf'))return 2;if(unit!=='g'&&unit!=='ml')return qty;if(protein.test(name))return 110;if(cookedStarch.test(name))return 200;if(/pommes de terre|patate douce/.test(l))return 220;if(/lentilles corail/.test(l))return 160;if(/haricots rouges/.test(l))return 120;if(/courgette|légumes|ratatouille|brocoli|épinards|haricots verts|poivrons|tomates \/ maïs \/ salade|tomates \/ courgettes/.test(l))return 200;if(/sauce tomate/.test(l))return 120;if(/skyr|fromage blanc/.test(l))return 125;if(/parmesan/.test(l))return 15;if(/huile d.ol|huile d’olive/.test(l))return 10;if(/pain complet/.test(l))return 80;if(/lait de coco/.test(l))return 80;if(/amandes|noix/.test(l))return 15;if(/pesto/.test(l))return 20;return qty}
function normalize(){const n=N();if(!n?.lib)return;Object.values(n.lib).forEach(menu=>{['lunch','dinner'].forEach(part=>{const meal=menu?.[part];if(!meal?.ingredients)return;meal.ingredients=meal.ingredients.map(r=>{const x=[...r];if(typeof x[1]==='number')x[1]=target(x[0],x[1],x[2]);return x})});if(Array.isArray(menu?.snack))menu.snack=menu.snack.map(r=>{const x=[...r];if(typeof x[1]==='number')x[1]=target(x[0],x[1],x[2]);return x})});
// Visuels vérifiés pour les plats qui étaient manifestement ambigus ou erronés.
const P=n.photos||{};
if(P.C)P.C.dinner='https://v.cdn.ww.com/media/system/wine/661d471f170ef7001814a023/38493c91-9fc6-4e3f-a7de-d2b2d51d1118/iqgb7u01k1ihngl48hyh.png?enable=upscale&fit=crop&height=800&quality=80&width=800';
if(P.L)P.L.lunch='https://s3.us-east-2.amazonaws.com/pfimg1/013/f9/ca/f9ca2fe9300acd4a33950144cda33112_1280m.jpg';
if(P.I)P.I.dinner='https://mealpractice.b-cdn.net/223486232737484800/pan-seared-trout-with-dill-sauce-steamed-green-beans-and-smashed-red-potatoes-br1UEDRZsG.webp';
// Les recettes poisson blanc héritent du visuel cabillaud plutôt que d'une photo de saumon/poulet.
for(const code of ['F','K','M'])if(P[code]?.dinner&&n.lib[code]?.dinner?.name&&/(poisson blanc|merlu|cabillaud)/i.test(n.lib[code].dinner.name))P[code].dinner=P.C?.dinner||P[code].dinner;
// Omelette/frittata : visuel réellement à base d'œufs.
const egg='https://locapark.com.tr/wp-content/uploads/2023/01/sebzeli-omlet-1920x1361.jpg';
if(P.B)P.B.dinner=egg;if(P.J&&/frittata/i.test(n.lib.J?.dinner?.name||''))P.J.dinner=egg;if(P.L&&/frittata/i.test(n.lib.L?.dinner?.name||''))P.L.dinner=egg;
}
normalize();setTimeout(normalize,400);setTimeout(normalize,2000);document.addEventListener('r42:meal-swapped',normalize);new MutationObserver(()=>{clearTimeout(window.__r42NormTimer);window.__r42NormTimer=setTimeout(normalize,120)}).observe(document.documentElement,{childList:true,subtree:true});
window.R42_NUTRITION_STANDARDS={normalize};
})();