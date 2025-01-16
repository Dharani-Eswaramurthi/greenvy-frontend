import React from 'react';
import styled, { keyframes } from 'styled-components';

const DEFAULT_COLOR = 'hsl(50deg, 100%, 50%)';

const generateSparkle = (color = DEFAULT_COLOR, existingSparkles = [], isMobile = false) => {
  let top, left;
  let attempts = 0;
  do {
    top = Math.random() * 100 + '%';
    left = Math.random() * 100 + '%';
    attempts++;
  } while (existingSparkles.some(sparkle => sparkle.style.top === top && sparkle.style.left === left) && attempts < 10);

  return {
    id: String(Math.floor(Math.random() * 10000)),
    createdAt: Date.now(),
    color,
    size: Math.random() * (isMobile ? 10 : 20 - 5) + (isMobile ? 5 : 10),
    style: {
      top,
      left,
      zIndex: 2,
    },
  };
};

const growAndShrink = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1); }
  100% { transform: scale(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
`;

const Svg = styled.svg`
  position: absolute;
  animation: ${spin} 600ms linear forwards;
`;

const SparkleWrapper = styled.div`
  position: absolute;
  pointer-events: none;
  animation: ${growAndShrink} 600ms ease-in-out forwards;
`;

const SparkleInstance = ({ color, size, style }) => (
  <SparkleWrapper style={style}>
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <path d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z" fill={color} />
    </Svg>
  </SparkleWrapper>
);

const TextSparkle = ({ children }) => {
  const [sparkles, setSparkles] = React.useState([]);
  const isMobile = window.innerWidth <= 768;

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setSparkles((prev) => {
        const now = Date.now();
        const nextSparkles = prev.filter(sparkle => now - sparkle.createdAt < 1000);
        nextSparkles.push(generateSparkle(DEFAULT_COLOR, nextSparkles, isMobile));
        return nextSparkles;
      });
    }, 1000); // Fixed interval of 1000ms

    return () => clearInterval(intervalId);
  }, [isMobile]);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {sparkles.map(sparkle => (
        <SparkleInstance key={sparkle.id} color={sparkle.color} size={sparkle.size} style={sparkle.style} />
      ))}
      <strong style={{ position: 'relative', zIndex: '1', fontWeight: 'bold', color: '#25995C', fontSize: isMobile ? '12px' : '14px' }}>
        {children}
      </strong>
    </span>
  );
};

export default TextSparkle;
