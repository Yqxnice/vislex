/** 图库灯箱样式（createPortal 到 body，遮罩与控件用固定 rgba，不随主题翻转） */
import { style } from '@vanilla-extract/css';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
});

export const closeBtn = style({
  position: 'absolute',
  top: '16px',
  right: '16px',
  display: 'inline-flex',
  width: '36px',
  height: '36px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  border: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
});

/** 左右切换按钮公共基类 */
export const nav = style({
  position: 'absolute',
  top: '50%',
  display: 'inline-flex',
  width: '44px',
  height: '44px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  border: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  color: '#ffffff',
  transform: 'translateY(-50%)',
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
  },
});

export const navPrev = style({
  left: '20px',
});

export const navNext = style({
  right: '20px',
});

export const figure = style({
  display: 'flex',
  maxWidth: '100%',
  maxHeight: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  margin: 0,
});

export const image = style({
  display: 'block',
  maxWidth: 'min(1100px, 100%)',
  maxHeight: '78vh',
  borderRadius: '8px',
  objectFit: 'contain',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
});

export const caption = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '12px',
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.9)',
});

export const captionText = style({
  color: '#ffffff',
});

export const counter = style({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.6)',
});
