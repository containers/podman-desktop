import React from 'react';

export type GradientTextProps = {
  content: string;
  colorFrom: string;
  colorTo: string;
  gradientAngle?: number;
};

export function getGradient(colorFrom: string, colorTo: string, gradientAngle?: number): string {
  return `linear-gradient(${gradientAngle ?? 0}deg, ${colorFrom}, ${colorTo})`;
}

export const GradientText = (props: GradientTextProps): JSX.Element => {
  return (
    <span
      style={{
        background: getGradient(props.colorFrom, props.colorTo, props.gradientAngle),
        backgroundClip: 'text',
        boxDecorationBreak: 'clone',
      }}
      className="text-transparent">
      {props.content}
    </span>
  );
};
