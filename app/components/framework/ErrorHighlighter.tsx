type ErrorLocation = {
  url: string;
  line: string;
  column: string;
};

type ErrorPart = {
  type: 'location' | 'error' | 'stack' | 'text';
  content: string;
  location?: ErrorLocation;
};

const ErrorLink = ({ url, line, column }: ErrorLocation) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // This creates a clickable link in the console that opens the source
    console.log(
      `%c${url}:${line}:${column}`,
      'color: blue; text-decoration: underline; cursor: pointer;',
      '\n',
      `Click to open in devtools`,
    );
  };

  return (
    <a href={url} className="cursor-pointer text-blue-400">
      {url}
      <button onClick={handleClick} className="text-blue-300 hover:underline">
        :{line}:{column}
      </button>
    </a>
  );
};

const ErrorPart = ({ part }: { part: ErrorPart }) => {
  switch (part.type) {
    case 'location':
      return part.location ? <ErrorLink {...part.location} /> : null;
    case 'error':
      return <span className="text-red-500">{part.content}</span>;
    case 'stack':
      return <span className="text-emerald-400">{part.content}</span>;
    default:
      return <span>{part.content}</span>;
  }
};

const parseErrorMessage = (message: string): ErrorPart[] => {
  const parts: ErrorPart[] = [];
  let remainingMessage = message;

  // Parse location links
  const locationRegex = /(http.+):(\d+):(\d+)/g;
  let locationMatch;
  let lastIndex = 0;

  while ((locationMatch = locationRegex.exec(message)) !== null) {
    // Add text before the match
    if (locationMatch.index > lastIndex) {
      parts.push({
        type: 'text',
        content: message.slice(lastIndex, locationMatch.index),
      });
    }

    // Add the location
    parts.push({
      type: 'location',
      content: locationMatch[0],
      location: {
        url: locationMatch[1],
        line: locationMatch[2],
        column: locationMatch[3],
      },
    });

    lastIndex = locationMatch.index + locationMatch[0].length;
  }

  // Add remaining text
  remainingMessage = message.slice(lastIndex);

  // Parse error messages
  remainingMessage = remainingMessage.replace(
    /(Error:.+?)(?=\n|$)/g,
    (match) => {
      parts.push({ type: 'error', content: match });
      return '';
    },
  );

  // Parse stack traces
  remainingMessage = remainingMessage.replace(/(at\s.+?)(?=\n|$)/g, (match) => {
    parts.push({ type: 'stack', content: match });
    return '';
  });

  // Add any remaining text
  if (remainingMessage.trim()) {
    parts.push({ type: 'text', content: remainingMessage });
  }

  return parts;
};

interface ErrorHighlighterProps {
  errorMessage: string;
  className?: string;
}

const ErrorHighlighter = ({
  errorMessage,
  className = '',
}: ErrorHighlighterProps) => {
  const errorParts = parseErrorMessage(errorMessage);

  return (
    <div
      className={`whitespace-pre-wrap break-words rounded-md font-mono text-neutral-300 ${className}`}
    >
      {errorParts.map((part, index) => (
        <ErrorPart key={index} part={part} />
      ))}
    </div>
  );
};

export default ErrorHighlighter;
