export type ScoreTone = 'red' | 'pink' | 'perfect';
export declare function parseScore(value: number | string): number;
export declare function scoreStyle(value: number | string): { score: number; progress: number; tone: ScoreTone };
export declare function renderBadge(value: number | string): string;
