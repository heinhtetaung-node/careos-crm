import React from 'react';

function addLink(str: string, linkHref: string, linkText = '') {
  let link =
    linkHref || str?.substring(str?.indexOf('https://'), str?.lastIndexOf(' '));

  if (!link.startsWith('https://')) {
    link = '';
  }

  const linkShowText = linkText || link;
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (linkShowText === '') return <>{str}</>;
  const strReplaced = str.replaceAll(linkShowText, `|${linkShowText}|`);
  const strArrayByLink = strReplaced.split('|');
  const elements = strArrayByLink.map((strChunk: string, key: number) => {
    if (strChunk.includes(linkShowText)) {
      return (
        <a key={key} target="_blank" rel="noreferrer" href={link}>
          {`${linkShowText} `}
        </a>
      );
    }
    return <span key={key}>{strChunk}</span>;
  });
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{elements}</>;
}

// eslint-disable-next-line import/prefer-default-export
export { addLink };
