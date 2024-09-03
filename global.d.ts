// global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'custom-element': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & { class?: string }, 
      HTMLElement
    >;
  }
}
