import { translations } from "../i18n";
import { getCurrentLang } from "../pages/settings";
import { getPlayerNames, parsePlayer, type Tournament } from "../pages/tournament";


export async function createTournamentBracket(Tournament: Tournament): Promise<HTMLElement> {
    let players: string[] = [];
    let wrapper: HTMLElement = document.createElement('div');
    let matches: any[] = [];
    let playerUuidToName: Map<string, string> = new Map();

    async function getPlayers() {
        const playerArray = parsePlayer(Tournament!);
        let playerUuids: string[] = [];
        if (Array.isArray(playerArray) && playerArray.length > 0) {
            playerUuids = playerArray.map(p => p.uuid);
        }
        
        // Récupérer les matches du tournoi
        try {
            const gameData = typeof Tournament.game === 'string' 
                ? JSON.parse(Tournament.game) 
                : Tournament.game;
            matches = Array.isArray(gameData) ? gameData : [];
            
            // Ajouter tous les UUIDs des joueurs présents dans les matches (y compris les winners)
            const allPlayerUuids = new Set(playerUuids);
            matches.forEach(match => {
                if (match.player1_uuid) allPlayerUuids.add(match.player1_uuid);
                if (match.player2_uuid) allPlayerUuids.add(match.player2_uuid);
                if (match.winner_uuid) allPlayerUuids.add(match.winner_uuid);
            });
            playerUuids = Array.from(allPlayerUuids);
        } catch (e) {
            console.error("Error parsing tournament matches:", e);
            matches = [];
        }
        
        if (playerUuids.length > 0) {
            players = await getPlayerNames(playerUuids);
            // Créer un mapping uuid -> nom
            for (let i = 0; i < playerUuids.length; i++) {
                playerUuidToName.set(playerUuids[i], players[i]);
            }
        }
        
        render();
    }

    function render() {
        const filled = fillToPowerOfTwo(players);
        const rounds = Math.log2(filled.length);

        const COL_W = 180;
        const COL_GAP = 80;
        const MATCH_H = 65;
        const V_GAP_R0 = 15;
        const MARGIN = { top: 30, left: 30, right: 30, bottom: 30 };
        const STROKE_WIDTH = 3;
        const STROKE_COLOR = '#FFFFFF';
        const STROKE_BOX_WIDTH = 3;
        const STROKE_BOX_COLOR = '#00FF41'

        const yCentersByRound: number[][] = [];
        for (let r = 0; r < rounds; r++) {
            const matches = filled.length >> (r + 1);
            const groupH = (MATCH_H + V_GAP_R0) * (1 << r);

            const arr: number[] = [];
            for (let j = 0; j < matches; j++) {
                const yCenter = MARGIN.top + groupH * (j + 0.5);
                arr.push(yCenter);
            }
            yCentersByRound.push(arr);
        }

        const width = MARGIN.left + rounds * (COL_W + COL_GAP) + COL_W + MARGIN.right - COL_GAP;
        const height = (yCentersByRound[0]?.[yCentersByRound[0].length - 1] ?? 0) + MATCH_H / 2 + MARGIN.bottom;

        wrapper = document.createElement('div');
        wrapper.style.overflow = 'auto';
        wrapper.style.width = '100%';
        wrapper.style.maxWidth = '100%';

        const svg = svgEl('svg', {
            width: String(width),
            height: String(height),
            viewBox: `0 0 ${width} ${height}`,
            style: 'background: transparent;'
        });

        for (let r = 0; r < rounds; r++) {
            const x = MARGIN.left + r * (COL_W + COL_GAP);
            const nMatches = yCentersByRound[r].length;
            const isFinalRound = r === rounds - 1;

            for (let j = 0; j < nMatches; j++) {
                const yCenter = yCentersByRound[r][j];

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

                if (r === 0) {
                    const [p1, p2] = seedPair(filled, j);

                    const t1 = svgEl('text', {
                        x: String(x + COL_W / 2),
                        y: String(yCenter - 10),
                        fill: '#004d1a',
                        'font-size': '11',
                        'font-family': 'system-ui, sans-serif',
                        'text-anchor': 'middle'
                    }) as SVGTextElement;
                    t1.textContent = p1 ? (p1.length > 18 ? p1.substring(0, 15) + '...' : p1) : '';

                    const t2 = svgEl('text', {
                        x: String(x + COL_W / 2),
                        y: String(yCenter + 10),
                        fill: '#004d1a',
                        'font-size': '11',
                        'font-family': 'system-ui, sans-serif',
                        'text-anchor': 'middle'
                    }) as SVGTextElement;
                    t2.textContent = p2 ? (p2.length > 18 ? p2.substring(0, 15) + '...' : p2) : '';

                    svg.appendChild(t1);
                    svg.appendChild(t2);
                } else {
                    // Trouver le match correspondant dans les données du tournoi
                    const match = matches.find(m => m.round === r + 1 && m.match_number === j);
                    
                    if (match) {
                        // Récupérer les noms des joueurs
                        const player1Name = match.player1_uuid ? playerUuidToName.get(match.player1_uuid) : null;
                        const player2Name = match.player2_uuid ? playerUuidToName.get(match.player2_uuid) : null;
                        
                        // Texte pour player 1
                        const t1 = svgEl('text', {
                            x: String(x + COL_W / 2),
                            y: String(yCenter - 10),
                            fill: match.status === 'completed' ? '#666' : '#004d1a',
                            'font-size': '11',
                            'font-family': 'system-ui, sans-serif',
                            'text-anchor': 'middle',
                            'font-weight': (match.winner_uuid && match.winner_uuid === match.player1_uuid) ? '700' : 'normal'
                        }) as SVGTextElement;
                        t1.textContent = player1Name 
                            ? (player1Name.length > 16 ? player1Name.substring(0, 13) + '...' : player1Name) 
                            : '???';
                        
                        // Texte pour player 2
                        const t2 = svgEl('text', {
                            x: String(x + COL_W / 2),
                            y: String(yCenter + 10),
                            fill: match.status === 'completed' ? '#666' : '#004d1a',
                            'font-size': '11',
                            'font-family': 'system-ui, sans-serif',
                            'text-anchor': 'middle',
                            'font-weight': (match.winner_uuid && match.winner_uuid === match.player2_uuid) ? '700' : 'normal'
                        }) as SVGTextElement;
                        t2.textContent = player2Name 
                            ? (player2Name.length > 16 ? player2Name.substring(0, 13) + '...' : player2Name) 
                            : '???';
                        
                        svg.appendChild(t1);
                        svg.appendChild(t2);
                        
                        // Badge de statut si le match est en cours ou complété
                        if (match.status === 'ready' || match.status === 'playing') {
                            const statusBadge = svgEl('circle', {
                                cx: String(x + COL_W - 15),
                                cy: String(yCenter - MATCH_H / 2 + 15),
                                r: '5',
                                fill: match.status === 'ready' ? '#22c55e' : '#3b82f6',
                                class: 'animate-pulse'
                            });
                            svg.appendChild(statusBadge);
                        }
                    } else {
                        // Fallback: afficher le label si pas de match trouvé
                        const label = isFinalRound ? `${translations[getCurrentLang()].final}` : `R${r + 1} - M${j + 1}`;
                        const t = svgEl('text', {
                            x: String(x + COL_W / 2),
                            y: String(yCenter),
                            fill: isFinalRound ? '#ca8a04' : '#999',
                            'font-size': '12',
                            'font-family': 'system-ui, sans-serif',
                            'text-anchor': 'middle',
                            'font-weight': isFinalRound ? '700' : 'normal'
                        }) as SVGTextElement;
                        t.textContent = label;
                        svg.appendChild(t);
                    }
                }

                if (r < rounds - 1) {
                    const xMid = x + COL_W + COL_GAP / 2;
                    const yChild = yCenter;

                    svg.appendChild(svgEl('line', {
                        x1: String(x + COL_W),
                        y1: String(yChild),
                        x2: String(xMid),
                        y2: String(yChild),
                        stroke: `${STROKE_COLOR}`,
                        'stroke-width': `${STROKE_WIDTH}`
                    }));

                    if (j % 2 === 0) {
                        const yChild2 = yCentersByRound[r][j + 1];
                        svg.appendChild(svgEl('line', {
                            x1: String(xMid),
                            y1: String(yChild),
                            x2: String(xMid),
                            y2: String(yChild2),
                            stroke: `${STROKE_COLOR}`,
                            'stroke-width': `${STROKE_WIDTH}`
                        }));

                        const parentIndex = j >> 1;
                        const xParent = x + COL_W + COL_GAP;
                        const yParent = yCentersByRound[r + 1][parentIndex];

                        svg.appendChild(svgEl('line', {
                            x1: String(xMid),
                            y1: String((yChild + yChild2) / 2),
                            x2: String(xParent),
                            y2: String((yChild + yChild2) / 2),
                            stroke: `${STROKE_COLOR}`,
                            'stroke-width': `${STROKE_WIDTH}`
                        }));

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
    }

    await getPlayers();
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

// Complète la liste de joueurs au prochain multiple de 2 avec des "byes"
function fillToPowerOfTwo(players: string[]): (string | null)[] {
  const n = players.length;
  const m = 1 << Math.ceil(Math.log2(Math.max(2, n))); // au moins 2
  const filled = players.slice(0, m);
  // @ts-ignore
  while (filled.length < m) filled.push(null);
  return filled;
}

// Retourne la paire (haut, bas) pour le match j du round 0: (1vs2, 3vs4, …)
function seedPair(filled: (string | null)[], matchIndex: number): [string | null, string | null] {
  const idx1 = 2 * matchIndex;
  const idx2 = 2 * matchIndex + 1;
  return [filled[idx1] ?? null, filled[idx2] ?? null];
}