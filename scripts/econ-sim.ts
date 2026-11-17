// Simulation Monte-Carlo de l'économie : que devient un joueur qui adopte tel style pendant 40 jours ?
// Lancé par `npm run econ`. Règles reprises du jeu : 3 clients/jour, achat impossible au-dessus du cash,
// loyer = 500 + 450×(jour−1) + 8 % du cash, revente rapide ×0,62, enchères ×1,15 (×1,3 nettoyées, 150 $) saturées (1 · 0,8 · 0,6).
// Sans jokers, bâtiments, tendances de marché ni événements : c'est la base du jeu.
import { generateProceduralCase, setPlayerCashHint } from '../src/data/generator';
import { computeDynamicFloor } from '../src/services/llm';

const RUNS = Number(process.env.RUNS || 300);
const START_DAY = Number(process.env.START_DAY || 1); // reprise à un palier : jour et caisse de départ
const START_CASH = Number(process.env.START_CASH || 2500);
const DAYS = Number(process.env.HORIZON || 40);
const num = (k: string, d: number) => (process.env[k] ? Number(process.env[k]) : d);
const FAST = num('FAST', 0.8); // revente rapide : part de la valeur de rue
const AUC_CLEAN = num('AUC_CLEAN', 1.2);
const AUC_COST = num('AUC_COST', 250);
const SAT = (process.env.SAT || '1,0.75,0.55').split(',').map(Number);
const RENT_BASE = num('RENT_BASE', 300);
const RENT_SLOPE = num('RENT_SLOPE', 350);
const DAILY_BONUS = num('DAILY_BONUS', 600); // quêtes du jour + série de connexion, en moyenne
const tax = (cash: number) => Math.round(Math.min(cash, 15000) * 0.08 + Math.max(0, Math.min(cash, 50000) - 15000) * 0.15 + Math.max(0, cash - 50000) * 0.25);
const rentOf = (day: number, cash: number) => RENT_BASE + (day - 1) * RENT_SLOPE + tax(cash);

type Strategy = { name: string; fear: number; sell: 'fast' | 'auction-clean'; lazy?: boolean };
const strategies: Strategy[] = [
  { name: 'Paresseux (offre pré-remplie 80 %, revente rapide)', fear: 25, sell: 'fast', lazy: true },
  { name: 'Correct (peur ≈ 45, revente rapide)', fear: 45, sell: 'fast' },
  { name: 'Bon (peur ≈ 65, revente rapide)', fear: 65, sell: 'fast' },
  { name: 'Bon + enchères nettoyées', fear: 65, sell: 'auction-clean' },
  { name: 'Expert (peur ≈ 85) + enchères nettoyées', fear: 85, sell: 'auction-clean' },
];

const median = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

function play(s: Strategy) {
  let cash = START_CASH;
  let debt = 0;
  let graceUsed = false;
  const history: number[] = [];
  for (let day = START_DAY; day < START_DAY + DAYS; day++) {
    const bought: { street: number; paid: number }[] = [];
    for (let k = 0; k < 3; k++) {
      setPlayerCashHint(cash);
      const c = generateProceduralCase(day, 30, undefined, 1, 'fr');
      if (c.isTrap) continue; // le joueur sait les éviter (approximation généreuse)
      const offer = s.lazy
        ? Math.round((c.initialPrice * 0.8) / 50) * 50
        : computeDynamicFloor(c.initialPrice, c.floorPrice, s.fear);
      const paid = Math.min(c.initialPrice, Math.max(offer, c.floorPrice));
      if (paid > cash) continue; // pas assez de cash : il laisse passer
      cash -= paid;
      bought.push({ street: c.streetValue, paid });
    }
    bought.forEach((b, i) => {
      if (s.sell === 'fast') cash += b.street * FAST * 0.93; // 0,93 = pénalité moyenne de saturation de catégorie
      else cash += b.street * AUC_CLEAN * SAT[Math.min(i, SAT.length - 1)] * 0.93 - AUC_COST;
    });
    if (process.env.DEBUG) console.log(`  [${s.name.slice(0, 12)}] j${day} achats=${bought.length} cash=${Math.round(cash)} loyer=${rentOf(day, cash)}`);
    if (!Number.isFinite(cash)) throw new Error(`cash invalide jour ${day} (${s.name}) bought=${JSON.stringify(bought)}`);
    cash += DAILY_BONUS;
    const rent = rentOf(day, cash) + debt;
    debt = 0;
    if (cash < rent) {
      if (!graceUsed) {
        graceUsed = true;
        debt = Math.round((rent - cash) * 1.3);
        cash = 0;
      } else {
        return { diedDay: day, cash: 0, history };
      }
    } else {
      cash -= rent;
    }
    history.push(cash);
  }
  return { diedDay: null as number | null, cash, history };
}

console.log(`Monte-Carlo : ${RUNS} parties × ${DAYS} jours par style, départ jour ${START_DAY}, ${START_CASH} $\n`);
console.log('style'.padEnd(52) + ' | survie 40 j | jour de mort (médiane) | cash médian j10 | j20 | j40');
for (const s of strategies) {
  const runs = Array.from({ length: RUNS }, () => play(s));
  const alive = runs.filter((r) => r.diedDay === null).length;
  const died = runs.filter((r) => r.diedDay !== null).map((r) => r.diedDay as number);
  const at = (d: number) => {
    const v = runs.map((r) => r.history[d - 1]).filter((x) => x !== undefined) as number[];
    return v.length ? Math.round(median(v)) : '-';
  };
  console.log(
    `${s.name.padEnd(52)} | ${String(Math.round((100 * alive) / RUNS)).padStart(9)} %  | ${String(died.length ? median(died) : '-').padStart(22)} | ${String(at(10)).padStart(15)} | ${String(at(20)).padStart(5)} | ${at(40)}`,
  );
}
if (process.env.EARLY) {
  console.log('\nDébut de partie : caisse médiane APRÈS loyer (jours 1-6) et % de survivants');
  for (const s of strategies) {
    const runs = Array.from({ length: RUNS }, () => play(s));
    const cols = [1, 2, 3, 4, 5, 6].map((d) => {
      const alive = runs.filter((r) => r.diedDay === null || (r.diedDay as number) > d).length;
      const v = runs.filter((r) => r.history[d - 1] !== undefined).map((r) => r.history[d - 1]);
      return `j${d}: ${v.length ? Math.round(median(v)) : '-'} (${Math.round((100 * alive) / RUNS)}%)`;
    });
    console.log(`${s.name.slice(0, 22).padEnd(24)}${cols.join('  ')}`);
  }
}
console.log('\nLecture : un style trop facile survit à 100 % avec un cash qui explose ; un style trop dur meurt au jour 1-2.');
