import React from 'react';

export type GradientTextProps = {
  content: string;
  colorFrom: string;
  colorTo: string;
  gradientAngle?: number;
};

export const GradientText = (props: GradientTextProps): JSX.Element => {
  return (
    <span
      style={{
        background: `linear-gradient(${props.gradientAngle ?? 0}deg, ${props.colorFrom}, ${props.colorTo})`,
        backgroundClip: 'text',
        boxDecorationBreak: 'clone',
      }}
      className="text-transparent">
      {props.content}
    </span>
  );
};
