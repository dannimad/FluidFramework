/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type { IFluidHandle } from "./handles.js";

/**
 * @public
 */
export const IFluidLoadable: keyof IProvideFluidLoadable = "IFluidLoadable";

/**
 * @public
 */
export interface IProvideFluidLoadable {
	readonly IFluidLoadable: IFluidLoadable;
}
/**
 * A shared {@link FluidObject} with a handle that can be used to retrieve it.
 * @remarks
 * In this context, "shared" means that the object might be shared via a {@link https://fluidframework.com/docs/concepts/architecture#fluid-service|Fluid service} and
 * thus could be viewed and edited by other clients.
 * @sealed @public
 */
export interface IFluidLoadable extends IProvideFluidLoadable {
	/**
	 * Handle to this loadable {@link FluidObject}.
	 */
	readonly handle: IFluidHandle;
}

/**
 * @internal
 */
export const IFluidRunnable: keyof IProvideFluidRunnable = "IFluidRunnable";

/**
 * @internal
 */
export interface IProvideFluidRunnable {
	readonly IFluidRunnable: IFluidRunnable;
}
/**
 * @internal
 */
export interface IFluidRunnable {
	// TODO: Use `unknown` instead (API-Breaking)

	run(...args: any[]): Promise<void>;
	stop(reason?: string): void;
}
