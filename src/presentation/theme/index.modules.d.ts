import '@material-ui/core/styles/createTheme';
import '@material-ui/core/styles/createPalette';

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    outline: {
      primary: { border1: string };
      sencondary: {
        light: { border1: string };
        border1: string;
        border2: string;
      };
      error: { border1: string };
    };
    effects: { shadow2: string; shadow3: string };
    boardItem: { input: { height: string; borderRadius: string } };
  }
  interface ThemeOptions {
    outline?: {
      primary?: { border1: string };
      sencondary?: {
        light: { border1: string };
        border1: string;
        border2: string;
      };
      error: { border1: string };
    };
    effects: { shadow2: string; shadow3: string };
    boardItem: { input: { height: string; borderRadius: string } };
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface CommonColors {
    blue: string;
    sky: string;
    blueHover: string;
    blueSkyLight: string;
    blueWhite: string;
    blueNormal: string;
  }

  interface Palette {
    danger: Palette['primary'];
    warning: Palette['primary'];
    grey: { [key: number]: string };
  }
  interface PaletteOptions {
    danger: PaletteOptions['primary'];
    warning: PaletteOptions['primary'];
    grey: { [key: number]: string };
  }
}
