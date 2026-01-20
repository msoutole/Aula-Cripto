
export interface AsymmetricStep {
  text: string;
  sub: string;
  progress: string;
  btnLabel: string;
}

export type ScenarioType = 'glass' | 'safe';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
