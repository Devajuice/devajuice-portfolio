import { useEffect, useState } from 'react';
import { quotes } from '../data/site';

export default function Quote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % quotes.length), 7000);
    return () => clearInterval(id);
  }, []);

  const quote = quotes[index];
  if (!quote) return null;

  return (
    <figure className="mx-auto max-w-2xl text-center min-h-[5.5rem]">
      <div key={index} className="quote-swap">
        <blockquote className="text-sm leading-relaxed text-text-secondary sm:text-base">
          “{quote.text}”
        </blockquote>
        <figcaption className="mt-2 text-xs text-text-muted sm:text-sm">— {quote.author}</figcaption>
      </div>
    </figure>
  );
}
