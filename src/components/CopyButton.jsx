import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return (
    <button
      className="btn btn-ghost"
      onClick={handleCopy}
      disabled={!text}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied!' : label}
    </button>
  );
};

export default CopyButton;
