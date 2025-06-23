/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "node:assert";

import type { ISharedArray, SerializableTypeForSharedSignal } from "../../index.js";

/**
 * Asserts that the 2 provided directories have equivalent contents.
 */
export async function assertEquivalentArrays(
	first: ISharedArray<SerializableTypeForSharedSignal>,
	second: ISharedArray<SerializableTypeForSharedSignal>,
): Promise<void> {
	assert(first !== undefined, "first array should be present");
	assert(second !== undefined, "second array should be present");

	// Check number of elements.
	assert.strictEqual(
		first.get(),
		second.get(),
		"Arrays are not equivalent: " +
			`first: ${JSON.stringify(first.get())}` +
			`second ${JSON.stringify(second.get())}`,
	);
}
