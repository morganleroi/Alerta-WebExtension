function cleanUrl(url: string) {
  url = url.trim();
  if (!url.endsWith('/')) {
    url = url + '/';
  }
  return url;
}

export { cleanUrl };
