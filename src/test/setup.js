import '@testing-library/jest-dom';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn() },
      connect: vi.fn()
    };
  }
}

window.AudioContext = MockAudioContext;
window.webkitAudioContext = MockAudioContext;

// Mock HTMLCanvasElement getContext for 2D and 3D / WebGL
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type) => {
  if (type === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn()
    };
  }
  if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
    return {
      getExtension: vi.fn(),
      getParameter: vi.fn(() => 0),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      createProgram: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn(() => true),
      useProgram: vi.fn(),
      createTexture: vi.fn(),
      bindTexture: vi.fn(),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      clearColor: vi.fn(),
      clearDepth: vi.fn(),
      clear: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      depthFunc: vi.fn(),
      viewport: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      getUniformLocation: vi.fn(() => ({})),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      uniform1i: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn()
    };
  }
  return null;
});
