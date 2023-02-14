/**
 * Portal will not work in SSR. We need wrap this to not to break.
 */
export default function ServerPortal(): React.ReactElement {
  return null;
}
