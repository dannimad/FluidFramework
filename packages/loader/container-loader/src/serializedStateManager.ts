/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	IDocumentAttributes,
	ISequencedDocumentMessage,
	ISnapshotTree,
	IVersion,
} from "@fluidframework/protocol-definitions";
import { IGetPendingLocalStateProps, IRuntime } from "@fluidframework/container-definitions";
import {
	ITelemetryLoggerExt,
	MonitoringContext,
	PerformanceEvent,
	UsageError,
	createChildMonitoringContext,
} from "@fluidframework/telemetry-utils";
import { assert } from "@fluidframework/core-utils";
import {
	IDocumentStorageService,
	IResolvedUrl,
	ISnapshot,
} from "@fluidframework/driver-definitions";
import { isInstanceOfISnapshot } from "@fluidframework/driver-utils";
import { ISerializableBlobContents, getBlobContentsFromTree } from "./containerStorageAdapter.js";
import { IPendingContainerState } from "./container.js";

export class SerializedStateManager {
	// eslint-disable-next-line @typescript-eslint/prefer-readonly
	private processedOps: ISequencedDocumentMessage[] = [];
	private snapshot:
		| {
				tree: ISnapshotTree;
				blobs: ISerializableBlobContents;
		  }
		| undefined;
	private readonly mc: MonitoringContext;
	private snapshotSequenceNumber: number = 0;
	private latestSnapshot:
		| {
				tree: ISnapshotTree;
				blobs: ISerializableBlobContents;
		  }
		| undefined;

	constructor(
		private readonly pendingLocalState: IPendingContainerState | undefined,
		subLogger: ITelemetryLoggerExt,
		private readonly storageAdapter: Pick<
			IDocumentStorageService,
			"readBlob" | "getSnapshotTree" | "getSnapshot" | "getVersions"
		>,
		private readonly _offlineLoadEnabled: boolean,
		private readonly getDocumentAttributes: (
			storage,
			tree: ISnapshotTree,
		) => Promise<IDocumentAttributes>,
	) {
		this.mc = createChildMonitoringContext({
			logger: subLogger,
			namespace: "serializedStateManager",
		});
	}

	public get offlineLoadEnabled(): boolean {
		return this._offlineLoadEnabled;
	}

	public addProcessedOp(message: ISequencedDocumentMessage) {
		if (this.offlineLoadEnabled) {
			if (message.sequenceNumber > this.snapshotSequenceNumber) {
				this.snapshot = this.latestSnapshot ?? this.snapshot;
				this.processedOps.push(message);
			}
		}
	}

	private async getVersion(version: string | null): Promise<IVersion | undefined> {
		const versions = await this.storageAdapter.getVersions(version, 1);
		return versions[0];
	}

	public async fetchSnapshot(
		specifiedVersion: string | undefined,
		supportGetSnapshotApi: boolean | undefined,
	) {
		let loadSnapshot: ISnapshotTree;
		let loadVersion: IVersion | undefined;
		return this.fetchSnapshotCore(specifiedVersion, supportGetSnapshotApi)
			.then(async ({ snapshot: latest, version: latestVersion }) => {
				const latestSnapshotTree: ISnapshotTree | undefined = isInstanceOfISnapshot(latest)
					? latest.snapshotTree
					: latest;

				if (this.pendingLocalState) {
					this.snapshot = {
						tree: this.pendingLocalState.baseSnapshot,
						blobs: this.pendingLocalState.snapshotBlobs,
					};
					loadSnapshot = this.pendingLocalState.baseSnapshot;
					loadVersion = undefined;
					assert(latestSnapshotTree !== undefined, "Snapshot should exist");
					if (this.offlineLoadEnabled) {
						const blobs = await getBlobContentsFromTree(
							latestSnapshotTree,
							this.storageAdapter,
						);
						this.latestSnapshot = { tree: latestSnapshotTree, blobs };
						const attributes: IDocumentAttributes = await this.getDocumentAttributes(
							this.storageAdapter,
							this.latestSnapshot.tree,
						);
						this.snapshotSequenceNumber = attributes.sequenceNumber;
					}
				} else {
					assert(latestSnapshotTree !== undefined, "Snapshot should exist");
					if (this.offlineLoadEnabled) {
						const blobs = await getBlobContentsFromTree(
							latestSnapshotTree,
							this.storageAdapter,
						);
						this.snapshot = { tree: latestSnapshotTree, blobs };
					}
					loadSnapshot = latestSnapshotTree;
					loadVersion = latestVersion;
				}

				return { snapshotTree: loadSnapshot, version: loadVersion };
			})
			.catch(async (error) => {
				if (this.pendingLocalState) {
					this.snapshot = {
						tree: this.pendingLocalState.baseSnapshot,
						blobs: this.pendingLocalState.snapshotBlobs,
					};
					const attributes: IDocumentAttributes = await this.getDocumentAttributes(
						this.storageAdapter,
						this.pendingLocalState.baseSnapshot,
					);
					this.snapshotSequenceNumber = attributes.sequenceNumber;
				}
				console.log("FAILURREE: ", error);
				return { snapshotTree: this.pendingLocalState?.baseSnapshot, version: undefined };
			});
	}

	private async fetchSnapshotCore(
		specifiedVersion: string | undefined,
		supportGetSnapshotApi: boolean | undefined,
	): Promise<{ snapshot?: ISnapshot | ISnapshotTree; version?: IVersion }> {
		if (
			this.mc.config.getBoolean("Fluid.Container.UseLoadingGroupIdForSnapshotFetch") ===
				true &&
			supportGetSnapshotApi === true
		) {
			const snapshot =
				(await this.storageAdapter.getSnapshot?.({
					versionId: specifiedVersion,
				})) ?? undefined;
			const version: IVersion = {
				id: snapshot?.snapshotTree.id ?? "",
				treeId: snapshot?.snapshotTree.id ?? "",
			};

			if (snapshot === undefined && specifiedVersion !== undefined) {
				this.mc.logger.sendErrorEvent({
					eventName: "getSnapshotTreeFailed",
					id: version.id,
				});
			} else if (snapshot !== undefined && version === undefined) {
				this.mc.logger.sendErrorEvent({
					eventName: "getSnapshotFetchedTreeWithoutVersion",
				});
			}
			return { snapshot, version };
		}
		return this.fetchSnapshotTree(specifiedVersion);
	}

	/**
	 * Get the most recent snapshot, or a specific version.
	 * @param specifiedVersion - The specific version of the snapshot to retrieve
	 * @returns The snapshot requested, or the latest snapshot if no version was specified, plus version ID
	 */
	private async fetchSnapshotTree(
		specifiedVersion: string | undefined,
	): Promise<{ snapshot?: ISnapshotTree; version?: IVersion | undefined }> {
		const version = await this.getVersion(specifiedVersion ?? null);

		if (version === undefined && specifiedVersion !== undefined) {
			// We should have a defined version to load from if specified version requested
			this.mc.logger.sendErrorEvent({
				eventName: "NoVersionFoundWhenSpecified",
				id: specifiedVersion,
			});
		}
		const snapshot = (await this.storageAdapter.getSnapshotTree(version)) ?? undefined;

		if (snapshot === undefined && version !== undefined) {
			this.mc.logger.sendErrorEvent({ eventName: "getSnapshotTreeFailed", id: version.id });
		}
		return { snapshot, version };
	}

	/**
	 * This method is only meant to be used by Container.attach() to set the initial
	 * base snapshot when attaching.
	 * @param snapshot - snapshot and blobs collected while attaching
	 */
	public setSnapshot(
		snapshot:
			| {
					tree: ISnapshotTree;
					blobs: ISerializableBlobContents;
			  }
			| undefined,
	) {
		this.snapshot = snapshot;
	}

	public async getPendingLocalStateCore(
		props: IGetPendingLocalStateProps,
		clientId: string | undefined,
		runtime: Pick<IRuntime, "getPendingLocalState">,
		resolvedUrl: IResolvedUrl,
	) {
		return PerformanceEvent.timedExecAsync(
			this.mc.logger,
			{
				eventName: "getPendingLocalState",
				notifyImminentClosure: props.notifyImminentClosure,
				savedOpsSize: this.processedOps.length,
				clientId,
			},
			async () => {
				if (!this.offlineLoadEnabled) {
					throw new UsageError(
						"Can't get pending local state unless offline load is enabled",
					);
				}
				assert(this.snapshot !== undefined, "no base data");
				const pendingRuntimeState = await runtime.getPendingLocalState(props);
				const pendingState: IPendingContainerState = {
					attached: true,
					pendingRuntimeState,
					baseSnapshot: this.snapshot.tree,
					snapshotBlobs: this.snapshot.blobs,
					savedOps: this.processedOps,
					url: resolvedUrl.url,
					// no need to save this if there is no pending runtime state
					clientId: pendingRuntimeState !== undefined ? clientId : undefined,
				};

				return JSON.stringify(pendingState);
			},
		);
	}
}
