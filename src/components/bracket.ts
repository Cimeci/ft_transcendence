import { translations } from "../i18n";
import { getCurrentLang } from "../pages/settings";

export function createTournamentBracket(players: string[]): HTMLElement {
  	const filled = fillToPowerOfTwo(players);
  	const rounds = Math.log2(filled.length);

  	const COL_W = 180;           // largeur d'un "module" match
  	const COL_GAP = 80;          // espace entre colonnes/rounds
  	const MATCH_H = 60;          // hauteur d'un match
  	const V_GAP_R0 = 15;         // espace vertical de base (round 1)
  	const MARGIN = { top: 30, left: 30, right: 30, bottom: 30 };
	const STROKE_WIDTH = 3;
	const STROKE_COLOR = '#FFFFFF';
	const STROKE_BOX_WIDTH = 3;
	const STROKE_BOX_COLOR = '#00FF41'

  	// Calcul des centres Y des matches pour chaque round
  	const yCentersByRound: number[][] = [];
  	for (let r = 0; r < rounds; r++) {
		const matches = filled.length >> (r + 1);
		const groupH = (MATCH_H + V_GAP_R0) * (1 << r); // l'espacement double à chaque round
		const arr: number[] = [];
		for (let j = 0; j < matches; j++) {
		  const yCenter = MARGIN.top + groupH * (j + 0.5);
		  arr.push(yCenter);
		}
		yCentersByRound.push(arr);
  	}

  	// Dimensions du SVG
  	const width  = MARGIN.left + rounds * (COL_W + COL_GAP) + COL_W + MARGIN.right - COL_GAP;
  	const height = (yCentersByRound[0]?.[yCentersByRound[0].length - 1] ?? 0) + MATCH_H / 2 + MARGIN.bottom;

  	const wrapper = document.createElement('div');
  	wrapper.style.overflow = 'auto';
  	wrapper.style.width = '100%';
  	wrapper.style.maxWidth = '100%';

  	const svg = svgEl('svg', {
		width: String(width),
		height: String(height),
		viewBox: `0 0 ${width} ${height}`,
		style: 'background: transparent;'
  	});

  	// Renders des rounds et connecteurs
  	for (let r = 0; r < rounds; r++) {
		const x = MARGIN.left + r * (COL_W + COL_GAP);
		const nMatches = yCentersByRound[r].length;
		const isFinalRound = r === rounds - 1;

		for (let j = 0; j < nMatches; j++) {
		  	const yCenter = yCentersByRound[r][j];

		  	// Match box
		  	const box = svgEl('rect', {
				x: String(x),
				y: String(yCenter - MATCH_H / 2),
				width: String(COL_W),
				height: String(MATCH_H),
				fill: '#fff',
		  	 	stroke: isFinalRound ? '#f59e0b' : `${STROKE_BOX_COLOR}`,
		  	 		'stroke-width': isFinalRound ? `${STROKE_BOX_WIDTH + 1}` : `${STROKE_BOX_WIDTH}`,
				rx: '10',
				ry: '10',
				class: 'hover:scale-110 transition-all duration-300 cursor-pointer [transform-box:fill-box] [transform-origin:center]',
		  	});
		  	svg.appendChild(box);

		  	// Texte du match (noms des joueurs en round 0)
		  	if (r === 0) {
				const [p1, p2] = seedPair(filled, j);
		 		const t1 = svgText(x + 8, (p1 ? yCenter - 6 : yCenter + 5), p1 ?? '');
				const t2 = svgText(x + 8, (p2 ? yCenter + 14: yCenter + 5), p2 ?? '');
				svg.appendChild(t1);
				svg.appendChild(t2);
		  	} else {
				const label = isFinalRound ? `${translations[getCurrentLang()].final} R${r + 1} - M${j + 1}` : `R${r + 1} - M${j + 1}`;
				const t = svgText(x + 8, yCenter + 5, label);
		  	 	if (isFinalRound) {
		  	 	  	t.setAttribute('font-weight', '700');
		  	 	  	t.setAttribute('fill', '#ca8a04');
		  	 	}
				svg.appendChild(t);
		  	}

		  	// Connecteurs vers le round suivant
		  	if (r < rounds - 1) {
				const xMid = x + COL_W + COL_GAP / 2;
				const yChild = yCenter;

				// Ligne horizontale sortante du match courant jusqu'au "bus" vertical
				svg.appendChild(svgEl('line', {
				  	x1: String(x + COL_W),
				  	y1: String(yChild),
				  	x2: String(xMid),
				  	y2: String(yChild),
				  	stroke: `${STROKE_COLOR}`,
				  	'stroke-width': `${STROKE_WIDTH}`
				}));

				// Si j est pair, on dessine la montante verticale + le lien vers le parent
				if (j % 2 === 0) {
				  	const yChild2 = yCentersByRound[r][j + 1];
				  	// Bus vertical qui relie les deux enfants
				  	svg.appendChild(svgEl('line', {
						x1: String(xMid),
						y1: String(yChild),
						x2: String(xMid),
						y2: String(yChild2),
						stroke: `${STROKE_COLOR}`,
						'stroke-width': `${STROKE_WIDTH}`
				  	}));
				  
				  	// Lien vers le match parent au round suivant
				  	const parentIndex = j >> 1;
				  	const xParent = x + COL_W + COL_GAP; // début de la box parent
				  	const yParent = yCentersByRound[r + 1][parentIndex];
				  
				  	// Petit segment horizontal du bus vertical vers le parent
				  	svg.appendChild(svgEl('line', {
						x1: String(xMid),
						y1: String((yChild + yChild2) / 2),
						x2: String(xParent),
						y2: String((yChild + yChild2) / 2),
						stroke: `${STROKE_COLOR}`,
						'stroke-width': `${STROKE_WIDTH}`
				  	}));
				  
				  	// Segment vertical qui centre sur la box parent (si offsets différents)
				  	svg.appendChild(svgEl('line', {
						x1: String(xParent),
						y1: String((yChild + yChild2) / 2),
						x2: String(xParent),
						y2: String(yParent),
						stroke: `${STROKE_COLOR}`,
						'stroke-width': `${STROKE_WIDTH}`
				  	}));
				}
		  	}
		}
  	}

  	wrapper.appendChild(svg);
  	return wrapper;
}

// Helpers

// retourn un element SVG
function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>
): SVGElementTagNameMap[K] {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el as SVGElementTagNameMap[K];
}


// retourne un texte
function svgText(x: number, y: number, text: string): SVGTextElement {
	const TEXT_COLOR = '#004d1a';
  	const t = svgEl('text', {
		x: String(x),
		y: String(y),
		fill: `${TEXT_COLOR}`,
		'font-size': '12',
		'font-family': 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  	}) as SVGTextElement;
  	t.textContent = text;
  	return t;
}

// Complète la liste de joueurs au prochain multiple de 2 avec des "byes"
function fillToPowerOfTwo(players: string[]): (string | null)[] {
  const n = players.length;
  const m = 1 << Math.ceil(Math.log2(Math.max(2, n))); // au moins 2
  const filled = players.slice(0, m);
  // @ts-ignore
  while (filled.length < m) filled.push(null);
  return filled;
}

// Retourne la paire (haut, bas) seedée pour le match j du round 0
function seedPair(filled: (string | null)[], matchIndex: number): [string | null, string | null] {
  const m = filled.length;
  const i1 = matchIndex + 1;
  const i2 = m - matchIndex;
  return [filled[i1 - 1], filled[i2 - 1]];
}