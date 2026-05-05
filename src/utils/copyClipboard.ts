function copyTextToClipboard(text?: string) {
  if (!text) return false;
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false
    );
  }
  return false;
}

export default copyTextToClipboard;
