declare module '*.svg' {
    import React = require('react');
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src
}

interface Mapping { [key: string]: string; }
declare module '*.css';
declare module '*.module.css' { const mapping: Mapping; export default mapping; }
