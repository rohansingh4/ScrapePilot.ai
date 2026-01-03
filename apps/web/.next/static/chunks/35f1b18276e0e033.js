(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,60970,e=>{"use strict";var t=e.i(32718),r=e.i(56780),i=e.i(7257),n=e.i(86649),a=e.i(4447);function o(){let e=r.useRef(null),i=r.useRef(null),o=`
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,s=`
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Pink to purple gradient based on position and time
      vec3 pink = vec3(0.925, 0.286, 0.6);
      vec3 purple = vec3(0.545, 0.361, 0.965);
      vec3 magenta = vec3(0.8, 0.2, 0.8);

      float mixFactor = sin(vPosition.y * 2.0 + uTime * 0.5) * 0.5 + 0.5;
      vec3 baseColor = mix(pink, purple, mixFactor);

      // Add some variation based on normal
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      baseColor = mix(baseColor, magenta, fresnel * 0.5);

      // Add glow effect
      float glow = pow(fresnel, 3.0) * 0.5;

      gl_FragColor = vec4(baseColor + glow, 1.0);
    }
  `;(0,n.useFrame)(t=>{e.current&&(e.current.rotation.y=.2*t.clock.getElapsedTime(),e.current.rotation.x=.1*Math.sin(.3*t.clock.getElapsedTime())),i.current?.uniforms?.uTime&&(i.current.uniforms.uTime.value=t.clock.getElapsedTime())});let l=r.useMemo(()=>{let e=new a.IcosahedronGeometry(1.5,1),t=e.attributes.position;if(!t)return e;for(let e=0;e<t.count;e++){let r=t.getX(e),i=t.getY(e),n=t.getZ(e),a=Math.sqrt(r*r+i*i+n*n),o=1+.8*Math.random();t.setXYZ(e,r/a*o*1.5,i/a*o*1.5,n/a*o*1.5)}return e.computeVertexNormals(),e},[]);return(0,t.jsx)("mesh",{ref:e,geometry:l,children:(0,t.jsx)("shaderMaterial",{ref:i,vertexShader:o,fragmentShader:s,uniforms:{uTime:{value:0}}})})}function s(){let e=r.useRef(null),i=r.useMemo(()=>{let e=new a.BufferGeometry,t=new Float32Array(150);for(let e=0;e<50;e++){let r=Math.random()*Math.PI*2,i=Math.random()*Math.PI,n=2+2*Math.random();t[3*e]=n*Math.sin(i)*Math.cos(r),t[3*e+1]=n*Math.sin(i)*Math.sin(r),t[3*e+2]=n*Math.cos(i)}return e.setAttribute("position",new a.BufferAttribute(t,3)),e},[]);return(0,n.useFrame)(t=>{e.current&&(e.current.rotation.y=.05*t.clock.getElapsedTime())}),(0,t.jsx)("points",{ref:e,geometry:i,children:(0,t.jsx)("pointsMaterial",{size:.05,color:"#ec4899",transparent:!0,opacity:.6,sizeAttenuation:!0})})}function l(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("ambientLight",{intensity:.3}),(0,t.jsx)("pointLight",{position:[5,5,5],intensity:.8,color:"#ec4899"}),(0,t.jsx)("pointLight",{position:[-5,-5,5],intensity:.5,color:"#8b5cf6"}),(0,t.jsx)(o,{}),(0,t.jsx)(s,{})]})}function c(){let[e,n]=r.useState(!1);return(r.useEffect(()=>{n(!0)},[]),e)?(0,t.jsxs)("div",{className:"relative w-full h-[400px]",children:[(0,t.jsx)(i.Canvas,{camera:{position:[0,0,5],fov:50},dpr:[1,2],gl:{antialias:!0,alpha:!0},style:{background:"transparent"},children:(0,t.jsx)(l,{})}),(0,t.jsx)("div",{className:"absolute inset-0 pointer-events-none",style:{background:"radial-gradient(circle at center, rgba(236, 72, 153, 0.15) 0%, transparent 60%)"}})]}):(0,t.jsx)(u,{})}function u(){return(0,t.jsx)("div",{className:"relative w-full h-[400px] flex items-center justify-center",children:(0,t.jsx)("div",{className:"w-48 h-48 rounded-full animate-pulse",style:{background:"radial-gradient(circle, #ec4899 0%, #8b5cf6 50%, transparent 70%)",filter:"blur(40px)"}})})}e.s(["CrystalAnimation",()=>c])},84022,e=>{e.n(e.i(60970))}]);