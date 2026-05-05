export enum ServicesName {
  API = 'api',
  GFF = 'gff',
  KRATOS = 'kratos',
  NODE = 'node',
}

function handlePath(endpoint: string, path: string) {
  if (path?.charAt(0) === '/') {
    return `${endpoint}${path}`;
  }
  const product =
    window.location.pathname?.startsWith('/health') &&
    !path.startsWith('api/') &&
    !path.startsWith('.ory/')
      ? 'health/'
      : '';
  return `${endpoint}/${product}${path}`;
}

export default function getApiEndpoint(
  path: string,
  api: string = ServicesName.API
) {
  const apiEndpoint = process.env.VITE_API_ENDPOINT ?? '';
  const gffEndpoint = process.env.VITE_GO_GATEWAY_ENDPOINT ?? '';
  const kratosEndpoint = process.env.VITE_KRATOS_URL ?? '';
  const nodeBffEndpoint = process.env.VITE_GATEWAY_ENDPOINT ?? '';

  switch (api) {
    case ServicesName.GFF:
      return handlePath(gffEndpoint, path);
    case ServicesName.KRATOS:
      return handlePath(kratosEndpoint, path);
    case ServicesName.NODE:
      return handlePath(nodeBffEndpoint, path);
    case ServicesName.API:
    default:
      return handlePath(apiEndpoint, path);
  }
}
