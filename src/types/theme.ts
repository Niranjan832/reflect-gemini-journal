
export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

export const defaultThemes: ColorTheme[] = [
  {
    id: 'default',
    name: 'Journal Blue',
    primary: '#5C7AEA',
    secondary: '#3D56B2',
    accent: '#14279B',
    background: '#ffffff',
    surface: '#F5F8FF'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#4E9F3D',
    secondary: '#1E5128',
    accent: '#D8E9A8',
    background: '#ffffff',
    surface: '#F5FAF0'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: '#FF7F50',
    secondary: '#E34234',
    accent: '#FFC288',
    background: '#ffffff',
    surface: '#FFF8F5'
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    primary: '#9B87F5',
    secondary: '#7E69AB',
    accent: '#D6BCFA',
    background: '#ffffff',
    surface: '#F9F5FF'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#0EA5E9',
    secondary: '#0369A1',
    accent: '#BAE6FD',
    background: '#ffffff',
    surface: '#F0F9FF'
  }
];
