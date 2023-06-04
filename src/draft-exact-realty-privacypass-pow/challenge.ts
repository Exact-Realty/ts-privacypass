/* Copyright © 2023 Exact Realty Limited. All rights reserved.
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

import produceTokenChallenge from '../draft-ietf-privacypass-auth-scheme-08/challenge.js';
import g from '../lib/global.js';

const producePowWwwAuthenticateHeader = async (
	origin: string,
	difficulty: number,
	transientStorePut: (
		key: ArrayBuffer,
		value: string,
	) => void | Promise<void>,
	redemptionContext?: ArrayBuffer,
): Promise<string | undefined> => {
	if (
		difficulty < 1 ||
		difficulty > 32 ||
		!Number.isSafeInteger(difficulty)
	) {
		throw new RangeError('Invalid difficulty');
	}

	const issuer = `_difficulty-${difficulty}._alg-0.pow.privacypass.arpa`;

	try {
		const [rawChallenge, challenge] = produceTokenChallenge(
			22352,
			issuer,
			origin,
			redemptionContext,
		);

		// hash challenge and store the issuerKey
		const challengeDigest = await g.crypto.subtle.digest(
			{ ['name']: 'SHA-256' },
			rawChallenge,
		);

		await transientStorePut(challengeDigest, String(difficulty));

		return `PrivateToken challenge="${challenge}"`;
	} catch {
		return;
	}
};

export default producePowWwwAuthenticateHeader;
