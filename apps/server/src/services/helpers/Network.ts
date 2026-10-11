import express from "express";

/**
 * True when a request originates from the local machine or the local/boat
 * network (loopback + RFC1918 private IPv4 + IPv6 link-local/unique-local).
 * Such connections are trusted unconditionally by the gateway.
 */
export function isLocalRequest(req: express.Request): boolean {
    const ip = (req.ip || '').replace('::ffff:', '').toLowerCase();

    // Loopback / unknown
    if (ip === '' || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
        return true;
    }

    // Private IPv4 ranges (RFC1918)
    if (/^10\./.test(ip)) return true;
    if (/^192\.168\./.test(ip)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;

    // Link-local IPv4 (169.254.x) + IPv6 link-local (fe80::) / unique-local (fc00::/7)
    if (/^169\.254\./.test(ip)) return true;
    if (ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd')) return true;

    return false;
}
