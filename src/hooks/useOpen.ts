import useMergedState from 'rc-util/lib/hooks/useMergedState';

export default function useOpen(open?: boolean, defaultOpen?: boolean) {
  const [mergedOpen, setMergedOpen] = useMergedState(defaultOpen || false, {
    value: open,
  });
  return [mergedOpen, setMergedOpen];
}
