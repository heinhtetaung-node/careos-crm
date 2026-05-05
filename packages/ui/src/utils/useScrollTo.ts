import { useRef, useEffect, useState } from 'react';

const useScrollTo: () => [
  React.MutableRefObject<HTMLDivElement | null>,
  (isScroll: boolean) => void,
] = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldScrollTo, setShouldScrollTo] = useState(false);

  useEffect(() => {
    if (ref.current && shouldScrollTo) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollTo(false);
    }
  }, [shouldScrollTo]);

  return [ref, (isScroll: boolean) => setShouldScrollTo(isScroll)];
};

export default useScrollTo;
