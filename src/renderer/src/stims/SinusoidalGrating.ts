import { Grating, GratingType } from './Grating';

export class SinusoidalGrating extends Grating {
  constructor({
    duration,
    bgColor,
    fgColor,
    speed,
    width,
    angle,
  }: Partial<Grating> = {}) {
    super({
      gratingType: GratingType.Sinusoidal,
      duration,
      bgColor,
      fgColor,
      speed,
      width,
      angle,
    });
  }
}
