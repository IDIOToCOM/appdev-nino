import { MOBILE_API } from '../../config/api';

export type ServerProbeResult = {
  ok: boolean;
  url: string;
  message: string;
  status?: number;
};

/** Lightweight GET used on the login screen to verify Forge is reachable from the device. */
export async function probeForgeServer(): Promise<ServerProbeResult> {
  const url = `${MOBILE_API}/health`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'SAMSON-Mobile/1.0',
  };

  try {
    const response = await fetch(url, { method: 'GET', headers });

    if (response.ok) {
      return { ok: true, url, message: 'Server reachable', status: response.status };
    }

    return {
      ok: false,
      url,
      message: `Server returned HTTP ${response.status}`,
      status: response.status,
    };
  } catch (error) {
    const detail =
      error instanceof Error && error.message ? error.message : 'Network request failed';
    return {
      ok: false,
      url,
      message: detail,
    };
  }
}
