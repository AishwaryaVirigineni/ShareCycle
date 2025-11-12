/**
 * Logo Component - Adult Women Sharing a Pad
 * Shows two adult women exchanging a pad with animation
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  Ellipse,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { theme } from '../theme';

interface LogoProps {
  size?: number;
  animate?: boolean;
}

export function Logo({ size = 100, animate = false }: LogoProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animate) {
      // Gentle pulsing animation for the entire logo
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.9,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [animate]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="gradient-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFB6C1" />
            <Stop offset="100%" stopColor="#FFC0CB" />
          </LinearGradient>
          <LinearGradient id="gradient-pink-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF9EAE" />
            <Stop offset="100%" stopColor="#FFB6C1" />
          </LinearGradient>
          <LinearGradient id="gradient-coral" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF7F7F" />
            <Stop offset="100%" stopColor="#FFAA99" />
          </LinearGradient>
          <LinearGradient id="gradient-coral-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B6B" />
            <Stop offset="100%" stopColor="#FF7F7F" />
          </LinearGradient>
          <LinearGradient id="gradient-lavender" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E6D9F5" />
            <Stop offset="100%" stopColor="#D8C7F0" />
          </LinearGradient>
          <LinearGradient id="gradient-cream" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFAF0" />
            <Stop offset="100%" stopColor="#FFF8E7" />
          </LinearGradient>
          <LinearGradient id="gradient-heart" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFB6C1" />
            <Stop offset="50%" stopColor="#E6D9F5" />
            <Stop offset="100%" stopColor="#FFAA99" />
          </LinearGradient>
          <LinearGradient id="gradient-skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFDBAC" />
            <Stop offset="100%" stopColor="#FFE4C4" />
          </LinearGradient>
          <LinearGradient id="gradient-skin-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E8C5A0" />
            <Stop offset="100%" stopColor="#FFDBAC" />
          </LinearGradient>
        </Defs>

        {/* Left woman - giving (adult proportions) */}
        <G>
          {/* Head - larger for adult */}
          <Circle cx="28" cy="22" r="11" fill="url(#gradient-skin)" />
          {/* Hair */}
          <Path
            d="M 17 22 Q 17 15, 28 15 Q 39 15, 39 22 Q 39 25, 37 28 Q 35 30, 28 30 Q 21 30, 19 28 Q 17 25, 17 22"
            fill="url(#gradient-pink)"
          />
          {/* Face features */}
          <Circle cx="25" cy="21" r="1.5" fill="#333" />
          <Circle cx="31" cy="21" r="1.5" fill="#333" />
          <Path
            d="M 25 24 Q 28 26, 31 24"
            stroke="#333"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Body - adult proportions (taller, more defined) */}
          {/* Torso */}
          <Ellipse cx="28" cy="42" rx="9" ry="14" fill="url(#gradient-pink)" />
          {/* Waist */}
          <Path
            d="M 19 42 Q 28 48, 37 42"
            stroke="url(#gradient-pink-dark)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Arms - more defined */}
          {/* Left arm (giving) */}
          <Path
            d="M 19 42 Q 15 40, 12 45 Q 10 48, 12 50"
            stroke="url(#gradient-skin)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="12" cy="50" r="2.5" fill="url(#gradient-skin)" />
          
          {/* Right arm (extending to give pad) */}
          <Path
            d="M 37 42 Q 42 40, 45 45 Q 47 47, 46 49"
            stroke="url(#gradient-skin)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="46" cy="49" r="2.5" fill="url(#gradient-skin)" />
          
          {/* Legs - adult length */}
          <Path
            d="M 28 56 L 26 75 Q 26 78, 24 78 L 22 78 M 28 56 L 30 75 Q 30 78, 32 78 L 34 78"
            stroke="url(#gradient-pink)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Feet */}
          <Ellipse cx="23" cy="78" rx="3" ry="2" fill="url(#gradient-pink-dark)" />
          <Ellipse cx="33" cy="78" rx="3" ry="2" fill="url(#gradient-pink-dark)" />
        </G>

        {/* Right woman - receiving (adult proportions) */}
        <G>
          {/* Head */}
          <Circle cx="72" cy="22" r="11" fill="url(#gradient-skin)" />
          {/* Hair */}
          <Path
            d="M 61 22 Q 61 15, 72 15 Q 83 15, 83 22 Q 83 25, 81 28 Q 79 30, 72 30 Q 65 30, 63 28 Q 61 25, 61 22"
            fill="url(#gradient-coral)"
          />
          {/* Face features */}
          <Circle cx="69" cy="21" r="1.5" fill="#333" />
          <Circle cx="75" cy="21" r="1.5" fill="#333" />
          <Path
            d="M 69 24 Q 72 26, 75 24"
            stroke="#333"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Body */}
          <Ellipse cx="72" cy="42" rx="9" ry="14" fill="url(#gradient-coral)" />
          <Path
            d="M 63 42 Q 72 48, 81 42"
            stroke="url(#gradient-coral-dark)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Arms */}
          {/* Left arm (reaching to receive) */}
          <Path
            d="M 63 42 Q 58 40, 55 45 Q 53 47, 54 49"
            stroke="url(#gradient-skin)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="54" cy="49" r="2.5" fill="url(#gradient-skin)" />
          
          {/* Right arm */}
          <Path
            d="M 81 42 Q 85 40, 88 45 Q 90 48, 88 50"
            stroke="url(#gradient-skin)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="88" cy="50" r="2.5" fill="url(#gradient-skin)" />
          
          {/* Legs */}
          <Path
            d="M 72 56 L 70 75 Q 70 78, 68 78 L 66 78 M 72 56 L 74 75 Q 74 78, 76 78 L 78 78"
            stroke="url(#gradient-coral)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Feet */}
          <Ellipse cx="67" cy="78" rx="3" ry="2" fill="url(#gradient-coral-dark)" />
          <Ellipse cx="77" cy="78" rx="3" ry="2" fill="url(#gradient-coral-dark)" />
        </G>

        {/* Sanitary pad being shared - with animation */}
        <G>
          <Rect x="44" y="42" width="12" height="18" rx="6" fill="url(#gradient-lavender)" stroke="#E6D9F5" strokeWidth="1.5" />
          <Rect x="48" y="45" width="4" height="12" rx="2" fill="url(#gradient-cream)" opacity="0.8" />
          <Ellipse cx="44" cy="51" rx="2" ry="4" fill="url(#gradient-lavender)" opacity="0.7" />
          <Ellipse cx="56" cy="51" rx="2" ry="4" fill="url(#gradient-lavender)" opacity="0.7" />
        </G>

        {/* Heart/care symbol */}
        <Path
          d="M 50 70 C 50 70, 45 65, 45 62 C 45 59, 47 57, 50 57 C 53 57, 55 59, 55 62 C 55 65, 50 70, 50 70 Z"
          fill="url(#gradient-heart)"
          opacity="0.8"
        />

        {/* Connecting arc - shows connection */}
        <Path
          d="M 46 49 Q 50 46, 54 49"
          stroke="url(#gradient-heart)"
          strokeWidth="2"
          strokeDasharray="2,2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
