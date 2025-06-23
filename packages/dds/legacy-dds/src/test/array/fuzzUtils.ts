/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {combineReducers } from "@fluid-private/stochastic-test-utils";
import type { Serializable } from "@fluidframework/datastore-definitions/internal";



/**
 * Represents a map clear operation.
 */
interface ArrayClear {
	type: "clear";
}

/**
 * Represents a map set key operation.
 */
interface ArraySetKey {
	type: "setKey";
	key: string;
	value: Serializable<unknown>;
}

/**
 * Represents a map delete key operation.
 */
interface ArrayDeleteKey {
	type: "deleteKey";
	key: string;
}

type ArrayOperation = ArraySetKey | ArrayDeleteKey | ArrayClear;

const mapReducer = combineReducers<ArrayOperation, ArrayState>({
	clear: ({ client }) => client.channel.clear(),
	setKey: ({ client }, { key, value }) => {
		client.channel.set(key, value);
	},
	deleteKey: ({ client }, { key }) => {
		client.channel.delete(key);
	},
});

/**
 * Represents the options for the map generator.
 */
interface ArrayGeneratorOptions {
	setWeight: number;
	deleteWeight: number;
	clearWeight: number;
	keyPoolSize: number;
}

const mapDefaultOptions: ArrayGeneratorOptions = {
	setWeight: 20,
	deleteWeight: 20,
	clearWeight: 1,
	keyPoolSize: 20,
};
