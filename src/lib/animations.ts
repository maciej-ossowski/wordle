export const tileVariants = {
  initial: { rotateX: 0 },
  flip: { 
    rotateX: 360,
    transition: { duration: 0.6 }
  },
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

export const keyVariants = {
  pressed: { scale: 0.9 },
  tap: { scale: 0.9 }
}; 