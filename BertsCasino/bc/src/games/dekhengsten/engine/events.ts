import { HorseId } from './horses'

/** Een race-event: verandert tijdelijk de snelheid (mult) van één paard */
export interface EventDef {
  key: string; mult: number; dur: number
  /** Tekst bij het paard (ballon) */
  label: string; icon: string
  /** Animatie-klasse voor het paard */
  anim: 'stumble' | 'slow' | 'boost' | 'graze' | 'spin' | 'limp' | 'shy'
  /** Commentaar van Bert ({n} = naam van het paard) */
  bert: string[]
  /** Wat het paard zelf roept (Leroy) */
  shout?: string
  weight: number
}

/** Gebeurtenissen die elk paard kunnen overkomen */
export const GENERIC: EventDef[] = [
  { key: 'stumble', mult: 0.45, dur: 1.2, label: 'struikelt!', icon: '💥', anim: 'stumble', weight: 8, bert: ['HO HO HO! {n} STRUIKELT!', 'Oeiii, {n} gaat bijna onderuit!'] },
  { key: 'pakje', mult: 0.35, dur: 1.5, label: 'glijdt uit over een lege ponypack', icon: '🧃', anim: 'spin', weight: 6, bert: ['HO HO HO! WAT GEBEURT DAAR DAN?! {n} glijdt uit over een lege ponypack!', 'Wie gooit er nou een ponypack op de baan?! Arme {n}!'] },
  { key: 'saddle', mult: 0.6, dur: 1.5, label: 'jockey verliest bijna zijn zadel', icon: '🪢', anim: 'shy', weight: 5, bert: ['De jockey van {n} hangt er half naast!', 'Hou je vast jongen! {n} schudt zijn jockey bijna af!'] },
  { key: 'crowd', mult: 0.55, dur: 1.2, label: 'schrikt van het publiek', icon: '😱', anim: 'shy', weight: 5, bert: ['{n} schrikt zich kapot van het publiek!', 'Niet zo schreeuwen op de VIP-tribune! {n} schrikt!'] },
  { key: 'balance', mult: 0.6, dur: 1.3, label: 'uit balans', icon: '🌀', anim: 'stumble', weight: 5, bert: ['{n} zwalkt over de baan!', 'Wat doet {n} nou?! Helemaal uit balans!'] },
  { key: 'sprint', mult: 1.35, dur: 2.5, label: 'onverwachte sprint!', icon: '⚡', anim: 'boost', weight: 7, bert: ['KIJK {n} NOU GAAN!', 'Waar komt dat ineens vandaan?! {n} gaat vlammen!'] },
  { key: 'knee', mult: 0.6, dur: 2, label: 'last van zijn knie', icon: '🦵', anim: 'limp', weight: 4, bert: ['{n} heeft last van zijn knie, a neef!', 'Au au au, die knie van {n}!'] },
  { key: 'chain', mult: 0.4, dur: 1.4, label: 'gouden ketting blijft haken', icon: '⛓️', anim: 'slow', weight: 4, bert: ['De gouden ketting van {n} blijft ergens achter hangen!', 'Te veel goud om je nek, {n}! Blijft haken!'] },
  { key: 'cork', mult: 0.55, dur: 1, label: 'schrikt van een champagnekurk', icon: '🍾', anim: 'shy', weight: 5, bert: ['POEF! Champagnekurk! {n} schrikt zich rot!', 'Daar gaat de Moët op de tribune, en {n} schrikt!'] },
  { key: 'shades', mult: 0.85, dur: 1, label: 'jockey verliest zijn zonnebril', icon: '🕶️', anim: 'slow', weight: 4, bert: ['De jockey van {n} is zijn zonnebril kwijt!', 'Zonnebril weg bij {n}! Dat is stijlverlies, a neef!'] },
  { key: 'graze', mult: 0.08, dur: 1.6, label: 'gaat even grazen', icon: '🌱', anim: 'graze', weight: 3, bert: ['NEE! {n} GAAT GRAZEN! MIDDEN IN DE RACE!', 'Is dit een lunchpauze?! {n} eet gewoon gras!'] },
  { key: 'lambo', mult: 0.5, dur: 2, label: 'afgeleid door een Lamborghini', icon: '🏎️', anim: 'shy', weight: 4, bert: ['Daar rijdt een Lambo langs en {n} kijkt mee!', '{n} wil liever in die Lamborghini!'] },
  { key: 'ego', mult: 1.25, dur: 3, label: 'zelfvertrouwenboost', icon: '😎', anim: 'boost', weight: 5, bert: ['{n} denkt dat hij de beste is, en hij gaat ervoor!', 'Wat een arrogantie! {n} schakelt een tandje bij!'] },
]

/** Karakter-events per paard */
export const SPECIAL: Record<HorseId, EventDef[]> = {
  schlong: [],
  anabool: [
    { key: 'rage', mult: 1.4, dur: 2.5, label: 'woedeaanval!', icon: '😤', anim: 'boost', weight: 6, bert: ['ANABOOL GAAT VOLLEDIG DOOR HET LINT!', 'Pas op! Anabool heeft een woedeaanval!'] },
    { key: 'power', mult: 1.55, dur: 1.8, label: 'overdreven krachtsprint', icon: '💪', anim: 'boost', weight: 4, bert: ['ANABOOL GAAT ALS EEN KANON, A NEEF!', 'Dat is pure spierkracht! Anabool!'] }],
  smokkel: [
    { key: 'illegal', mult: 1.55, dur: 2.5, label: 'illegale sprint', icon: '🕵️', anim: 'boost', weight: 7, bert: ['JA HOOR! DIE OUWE SMOKKELAAR DOET HET WEER!', 'Smokkelpony heeft weer iets geregeld!', 'Ik heb niks gezien, dames en heren! Smokkelpony vliegt!'] },
    { key: 'sneaky', mult: 1.2, dur: 2, label: 'verdachte manoeuvre', icon: '🤫', anim: 'boost', weight: 5, bert: ['Smokkelpony snijdt een bocht af die er niet eens is!', 'Verdacht, verdacht… Smokkelpony schuift op!'] },
    { key: 'delay', mult: 0.45, dur: 2, label: 'onverwachte vertraging', icon: '📦', anim: 'slow', weight: 5, bert: ['Smokkelpony moet even iets afleveren!', 'Waar gaat Smokkelpony heen?! Even een pakketje droppen?'] }],
  dekhengst: [],
  tollie: [
    { key: 'mega', mult: 2.0, dur: 3, label: 'NIET MEER TE HOUDEN', icon: '🚀', anim: 'boost', weight: 3, bert: ['PAARDENTOLLIE IS NIET MEER TE HOUDEN!', 'WAT IS DIT?! PAARDENTOLLIE HEEFT EEN RAKET IN ZIJN REET!'] },
    { key: 'wrongway', mult: 0.05, dur: 1.2, label: 'kijkt de verkeerde kant op', icon: '🔄', anim: 'spin', weight: 5, bert: ['Paardentollie! De finish is DIE kant op!', 'Paardentollie staat gewoon achterstevoren!'] },
    { key: 'random', mult: 1.45, dur: 2, label: 'willekeurige versnelling', icon: '🎲', anim: 'boost', weight: 6, bert: ['Niemand snapt het, maar Paardentollie gaat ineens!', 'Paardentollie doet maar wat, en het werkt!'] },
    { key: 'collapse', mult: 0.2, dur: 2.5, label: 'stort volledig in', icon: '🫠', anim: 'graze', weight: 4, bert: ['Paardentollie stort helemaal in!', 'Daar ligt Paardentollie bijna! Wat een drama!'] }],
  leroy: [
    { key: 'hip', mult: 0.55, dur: 2.2, label: 'heupklachten', icon: '🦴', anim: 'limp', weight: 6, shout: 'Ik heb last van mijn heup.', bert: ['LEKKER BEZIG LEROY, MAAR JE HEUP DAN?!', 'Leroy grijpt naar zijn heup! Arme jongen!'] },
    { key: 'faka', mult: 1.45, dur: 3, label: 'onverwachte acceleratie', icon: '🔥', anim: 'boost', weight: 5, shout: 'FAAAAAAAAAAKAAAAAAAAAAAA!', bert: ['LEEEEEEROY! KOM OP JONGEN!', 'Waar haalt Leroy die energie vandaan?!'] },
    { key: 'tired', mult: 0.7, dur: 2, label: 'verliest zijn tempo', icon: '🚬', anim: 'slow', shout: 'Nee joh, rustig aan.', weight: 4, bert: ['Leroy neemt even een trekje… midden in de race!', 'Leroy heeft er duidelijk geen zin in!'] }],
}

/** Getimede karaktertrekken (geen toeval-events maar vaste momenten in de race) */
export const TRAITS = {
  schlongStart: 0.8, schlongStartUntil: 0.18, schlongKick: { at: 0.8, chance: 0.6, mult: 1.5, dur: 5 },
  anaboolStart: 1.12, anaboolStartUntil: 0.25, anaboolFade: { at: 0.6, chance: 0.55, mult: 0.65, dur: 4 },
  dekhengstMove: { from: 0.4, to: 0.75, chance: 0.55, mult: 1.25, dur: 3 },
  leroyKick: { at: 0.75, chance: 0.45, mult: 1.4, dur: 4 },
}

/** Losse uitroepen van Leroy (geen effect op de snelheid) */
export const LEROY_LINES = ['FAAAAAAAAAAKAAAAAAAAAAAA!', 'Ik heb last van mijn heup.', 'Nee joh, rustig aan.', 'Wat een teringzooi.', 'Ik trek dit niet meer.', 'Moet dit nou echt?']

/** Commentaar van Bert per moment in de race ({n} = paard) */
export const BERT = {
  start: ['DAAR GAAN WE, DAMES EN HEREN!', 'DE HEKKEN ZIJN OPEN! DAAR GAAN ZE!', 'EN WEG ZIJN ZE! WAT EEN START!'],
  lead: ['{n} NEEMT DE LEIDING!', '{n} gaat nu aan kop, a neef!', 'Kijk eens aan, {n} op kop!', '{n} pakt de eerste plek!'],
  leadBy: {
    anabool: ['ANABOOL GAAT ALS EEN KANON, A NEEF!', 'Anabool walst over iedereen heen!'],
    schlong: ['HORSE COCK KOMT ERAAN!', 'Horse Cock duwt zich naar voren!'],
    smokkel: ['JA HOOR! DIE OUWE SMOKKELAAR DOET HET WEER!', 'Smokkelpony aan kop! Hoe dan?!'],
    dekhengst: ['DE DEKHENGST LAAT ZICH NIET KENNEN!', 'De Dekhengst neemt wat hem toekomt!'],
    tollie: ['PAARDENTOLLIE AAN KOP?! DIT HEB IK NOG NOOIT GEZIEN!', 'Paardentollie leidt! Iemand bel de dokter!'],
    leroy: ['LEEEEEEROY! KOM OP JONGEN!', 'LEROYYYY! DIE KOMT ER NOG EVEN LANGS!'],
  } as Record<HorseId, string[]>,
  final: ['LAATSTE RECHTE STUK! DIT IS HET MOMENT!', 'NOG HONDERD METER! HOU JE BIERTJE VAST!', 'DAAR KOMT DE FINISH IN ZICHT!'],
  photo: ['DIT WORDT NOG EEN HELE FOTOFINISH!', 'NEUS AAN NEUS! FOTOFINISH, A NEEF!'],
  win: ['EN DAAR IS DE WINNAAR! {n}! WAT EEN RACE!', '{n} WINT! ONGELOOFLIJK!', 'HET IS {n}! DE TRIBUNE GAAT LOS!'],
}
