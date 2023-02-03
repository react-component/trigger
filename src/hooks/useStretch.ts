import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';

export default function useStretch(target: HTMLElement, stretch: string) {
  useLayoutEffect(() => {}, [target, stretch]);
}
