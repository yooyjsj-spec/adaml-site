import sanitizeHtml from 'sanitize-html';

export const cleanHtml = (html?: string | null) => {
  if (!html) return null;
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'u',
      'ul',
      'ol',
      'li',
      'a',
      'span',
      'div',
      'blockquote',
      'h3',
      'h4',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      p: ['class'],
      span: ['class'],
      div: ['class'],
      h3: ['class'],
      h4: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });
};
