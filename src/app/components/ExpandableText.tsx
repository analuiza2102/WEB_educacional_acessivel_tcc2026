import { useEffect, useId, useRef, useState } from 'react';

interface ExpandableTextProps {
  children: string;
  className?: string;
  buttonClassName?: string;
}

export function ExpandableText({
  children,
  className = '',
  buttonClassName = 'text-blue-700 underline underline-offset-2 hover:text-blue-900 focus:ring-blue-300',
}: ExpandableTextProps) {
  const paragraphId = useId();
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const measure = () => {
      const paragraph = paragraphRef.current;
      if (!paragraph) return;
      setTruncated(paragraph.scrollHeight > paragraph.clientHeight);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [children]);

  return (
    <>
      <p
        id={paragraphId}
        ref={paragraphRef}
        className={`${className} ${!expanded ? 'line-clamp-3' : ''}`.trim()}
      >
        {children}
      </p>
      {truncated && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={paragraphId}
          onClick={() => setExpanded(value => !value)}
          className={`mt-2 rounded focus:outline-none focus:ring-4 ${buttonClassName}`}
        >
          {expanded ? 'Mostrar menos' : 'Ler mais'}
        </button>
      )}
    </>
  );
}
