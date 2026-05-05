import { createTheme } from '@material-ui/core/styles';

import breakpoints from './breakpoints';
import overrides from './overrides';
import props from './props';
import shadows from './shadows';
import typography from './typography';
import variants from './variants';

const theme = (variant: any) =>
  createTheme(
    {
      spacing: 4,
      breakpoints,
      overrides,
      props,
      typography,
      shadows,
      effects: variant.effects,
      outline: variant.outline,
      body: variant.body,
      boardItem: variant.boardItem,
      border: variant.border,
      header: variant.header,
      palette: variant.palette,
      sidebar: variant.sidebar,
    } as any,
    variant.name
  );

const themes = variants.map((variant) => theme(variant));

export default themes;
