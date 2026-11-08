export interface ReviewCardInput { title: string; score: number | string; summary: string; pros: string[]; cons: string[]; coverDataUrl: string; focus?: 'left' | 'center' | 'right'; }
export declare function renderReviewCard(input: ReviewCardInput, options?: { template?: 'impact' | 'clean' }): string;
