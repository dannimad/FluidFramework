/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { strict as assert } from "assert";
// eslint-disable-next-line import/no-nodejs-modules
import * as crypto from "crypto";

import { describeCompat, itExpects } from "@fluid-private/test-version-utils";
import { IContainer } from "@fluidframework/container-definitions/internal";
import {
	CompressionAlgorithms,
	ContainerMessageType,
	disabledCompressionConfig,
} from "@fluidframework/container-runtime/internal";
import { ConfigTypes, IConfigProviderBase, IErrorBase } from "@fluidframework/core-interfaces";
import {
	IDocumentMessage,
	ISequencedDocumentMessage,
} from "@fluidframework/driver-definitions/internal";
import type { ISharedMap } from "@fluidframework/map/internal";
import { FlushMode } from "@fluidframework/runtime-definitions/internal";
import {
	toIDeltaManagerFull,
	ChannelFactoryRegistry,
	DataObjectFactoryType,
	ITestContainerConfig,
	ITestFluidObject,
	ITestObjectProvider,
	waitForContainerConnection,
} from "@fluidframework/test-utils/internal";

describeCompat("Message size", "NoCompat", (getTestObjectProvider, apis) => {
	const { SharedMap } = apis.dds;
	const mapId = "mapId";
	const registry: ChannelFactoryRegistry = [[mapId, SharedMap.getFactory()]];
	const testContainerConfig: ITestContainerConfig = {
		fluidDataObjectType: DataObjectFactoryType.Test,
		registry,
	};
	const bytesPerKB = 1024;

	let provider: ITestObjectProvider;
	beforeEach("getTestObjectProvider", () => {
		provider = getTestObjectProvider();
	});
	afterEach(async function () {
		provider.reset();
	});

	let localContainer: IContainer;
	let remoteContainer: IContainer;
	let localDataObject: ITestFluidObject;
	let remoteDataObject: ITestFluidObject;
	let localMap: ISharedMap;
	let remoteMap: ISharedMap;

	const configProvider = (settings: Record<string, ConfigTypes>): IConfigProviderBase => {
		return {
			getRawConfig: (name: string): ConfigTypes => settings[name],
		};
	};

	const setupContainers = async (
		containerConfig: ITestContainerConfig,
		featureGates: Record<string, ConfigTypes> = {},
	) => {
		const configWithFeatureGates = {
			...containerConfig,
			loaderProps: { configProvider: configProvider(featureGates) },
		};

		// Create a Container for the first client.
		localContainer = await provider.makeTestContainer(configWithFeatureGates);
		localDataObject = (await localContainer.getEntryPoint()) as ITestFluidObject;
		localMap = await localDataObject.getSharedObject<ISharedMap>(mapId);

		// Load the Container that was created by the first client.
		remoteContainer = await provider.loadTestContainer(configWithFeatureGates);
		remoteDataObject = (await remoteContainer.getEntryPoint()) as ITestFluidObject;
		remoteMap = await remoteDataObject.getSharedObject<ISharedMap>(mapId);

		await waitForContainerConnection(localContainer, true);
		await waitForContainerConnection(remoteContainer, true);

		// Force the local container into write-mode by sending a small op
		localMap.set("test", "test");
		await provider.ensureSynchronized();
	};

	const generateRandomStringOfSize = (sizeInBytes: number): string =>
		crypto.randomBytes(sizeInBytes / 2).toString("hex");
	const generateStringOfSize = (sizeInBytes: number): string =>
		new Array(sizeInBytes + 1).join("0");
	const setMapKeys = (map: ISharedMap, count: number, item: string): void => {
		for (let i = 0; i < count; i++) {
			map.set(`key${i}`, item);
		}
	};

	const assertMapValues = (map: ISharedMap, count: number, expected: string): void => {
		for (let i = 0; i < count; i++) {
			const value = map.get(`key${i}`);
			assert.strictEqual(value, expected, `Wrong value for key${i}`);
		}
	};

	const captureContainerCloseError = async (container: IContainer) =>
		new Promise<IErrorBase | undefined>((resolve) =>
			container.once("closed", (error) => {
				resolve(error);
			}),
		);

	const configWithCompressionDisabled = {
		...testContainerConfig,
		runtimeOptions: {
			compressionOptions: disabledCompressionConfig,
		},
	}; // Compression is enabled by default

	itExpects(
		"A large op will close the container when compression is disabled",
		[{ eventName: "fluid:telemetry:Container:ContainerClose", error: "BatchTooLarge" }],
		async () => {
			const maxMessageSizeInBytes = 1024 * 1024; // 1Mb
			await setupContainers(configWithCompressionDisabled);

			const errorP = captureContainerCloseError(localContainer);

			const largeString = generateStringOfSize(maxMessageSizeInBytes + 1);
			const messageCount = 1;
			setMapKeys(localMap, messageCount, largeString);

			// Let the ops flush, which will close the container
			await provider.ensureSynchronized();

			const {
				errorType,
				dataProcessingCodepath,
				errorDetails: { opCount, contentSizeInBytes, socketSize },
			} = (await errorP) as any;
			assert.deepEqual(
				{
					errorType,
					dataProcessingCodepath,
					errorDetails: { opCount },
				},
				{
					errorType: "dataProcessingError",
					dataProcessingCodepath: "CannotSend",
					errorDetails: {
						opCount: 1,
					},
				},
				"Error not as expected",
			);
			assert.equal(
				typeof contentSizeInBytes,
				"number",
				"contentSizeInBytes should be a number",
			);
			assert(
				socketSize > maxMessageSizeInBytes,
				"Socket size should be larger than maxMessageSizeInBytes",
			);
		},
	);

	it("Small ops will pass", async () => {
		const totalMessageSizeInBytes = 800 * 1024; // slightly below 1Mb
		await setupContainers(testContainerConfig);
		const largeString = generateStringOfSize(totalMessageSizeInBytes / 10);
		const messageCount = 10;
		setMapKeys(localMap, messageCount, largeString);
		await provider.ensureSynchronized();

		assertMapValues(remoteMap, messageCount, largeString);
	});

	it("Small batches pass while disconnected, succeed when the container connects and compression is disabled", async function () {
		// Blocked waiting on AB#2690
		if (provider.driver.type === "local") {
			this.skip();
		}

		const maxMessageSizeInBytes = 600 * 1024;
		await setupContainers(configWithCompressionDisabled);
		const largeString = generateStringOfSize(maxMessageSizeInBytes / 10);
		const messageCount = 10;
		localContainer.disconnect();
		for (let i = 0; i < 3; i++) {
			setMapKeys(localMap, messageCount, largeString);
			await new Promise<void>((resolve) => setTimeout(resolve));
			// Individual small batches will pass, as the container is disconnected and
			// batches will be stored as pending
			assert.equal(localContainer.closed, false);
		}

		// On reconnect, all small batches will be sent at once
		localContainer.connect();
		await provider.ensureSynchronized();
	});

	it("Batched small ops pass when batch is larger than max op size", async function () {
		// flush mode is not applicable for the local driver
		if (provider.driver.type === "local") {
			this.skip();
		}

		await setupContainers({
			...testContainerConfig,
			runtimeOptions: { flushMode: FlushMode.Immediate },
		});
		const messageSizeInBytes = 500000;
		const largeString = generateStringOfSize(messageSizeInBytes);
		const messageCount = 10;
		setMapKeys(localMap, messageCount, largeString);
		await provider.ensureSynchronized();

		assertMapValues(remoteMap, messageCount, largeString);
	});

	it("Single large op passes when compression enabled and over max op size", async () => {
		const messageSizeInBytes = 1024 * 1024 + 1; // 1Mb
		await setupContainers({
			...testContainerConfig,
			runtimeOptions: {
				compressionOptions: {
					minimumBatchSizeInBytes: 1,
					compressionAlgorithm: CompressionAlgorithms.lz4,
				},
			},
		});

		const largeString = generateStringOfSize(messageSizeInBytes);
		const messageCount = 1;
		setMapKeys(localMap, messageCount, largeString);
	});

	it("Batched small ops pass when compression enabled and batch is larger than max op size", async function () {
		await setupContainers({
			...testContainerConfig,
			runtimeOptions: {
				compressionOptions: {
					minimumBatchSizeInBytes: 1,
					compressionAlgorithm: CompressionAlgorithms.lz4,
				},
			},
		});
		const messageSizeInBytes = 100 * 1024;
		const largeString = generateStringOfSize(messageSizeInBytes);
		const messageCount = 10;
		setMapKeys(localMap, messageCount, largeString);
		await provider.ensureSynchronized();

		assertMapValues(remoteMap, messageCount, largeString);
	});

	itExpects(
		"Large ops fail when compression is disabled and the content is over max op size",
		[{ eventName: "fluid:telemetry:Container:ContainerClose", error: "BatchTooLarge" }],
		async function () {
			const maxMessageSizeInBytes = 5 * 1024 * 1024; // 5MB
			await setupContainers(configWithCompressionDisabled);

			const largeString = generateRandomStringOfSize(maxMessageSizeInBytes);
			const messageCount = 3; // Will result in a 15 MB payload
			setMapKeys(localMap, messageCount, largeString);

			// Let the ops flush, which will close the container
			const errorP = captureContainerCloseError(localContainer);
			await provider.ensureSynchronized();

			assert(localContainer.closed, "Local Container should be closed during flush");
			const {
				errorType,
				dataProcessingCodepath,
				errorDetails: { opCount, contentSizeInBytes, socketSize },
			} = (await errorP) as any;
			assert.deepEqual(
				{
					errorType,
					dataProcessingCodepath,
					errorDetails: { opCount },
				},
				{
					errorType: "dataProcessingError",
					dataProcessingCodepath: "CannotSend",
					errorDetails: {
						opCount: 1,
					},
				},
				"Error not as expected",
			);
			assert.equal(
				typeof contentSizeInBytes,
				"number",
				"contentSizeInBytes should be a number",
			);
			assert(
				socketSize > maxMessageSizeInBytes,
				"Socket size should be larger than maxMessageSizeInBytes",
			);

			// Confirm the remote map didn't receive any of the large ops
			remoteMap.delete("test"); // So we can just check for empty on the next line
			assert(remoteMap.size === 0, "Remote map should not have received any of the large ops");
		},
	);

	const chunkingBatchesTimeoutMs = 200000;

	const containerConfigGroupedBatching: ITestContainerConfig = {
		...testContainerConfig,
		runtimeOptions: {
			summaryOptions: { summaryConfigOverrides: { state: "disabled" } },
			enableGroupedBatching: true,
		},
	};

	itExpects(
		`Batch with 4000 ops - grouped batches`,
		[], // With grouped batching enabled, this scenario is unblocked
		async function () {
			await setupContainers(containerConfigGroupedBatching);
			// This is currently not supported by the local server. Nacks will occur because too many messages without summary (see localServerTestDriver.ts).
			// This is not supported by tinylicious. For some reason, the socket is accepting more than 1 MB.
			if (provider.driver.type === "local" || provider.driver.type === "tinylicious") {
				this.skip();
			}

			const content = generateRandomStringOfSize(10);
			for (let i = 0; i < 4000; i++) {
				localMap.set(`key${i}`, content);
			}

			await provider.ensureSynchronized();
		},
	).timeout(chunkingBatchesTimeoutMs);

	describe(`Large payloads - "grouped" batches`, () => {
		describe("Chunking compressed batches", () =>
			[
				{ messagesInBatch: 1, messageSize: 51 * bytesPerKB }, // One large message (51 KB each)
				{ messagesInBatch: 3, messageSize: 51 * bytesPerKB }, // Three large messages (51 KB each)
				{ messagesInBatch: 1500, messageSize: bytesPerKB }, // Many small messages (1 KB each)
			].forEach((testConfig) => {
				// biome-ignore format: https://github.com/biomejs/biome/issues/4202
				it(
						"Large payloads pass when compression enabled, " +
							"compressed content is over max op size and chunking enabled. " +
							`${testConfig.messagesInBatch.toLocaleString()} messages of ${testConfig.messageSize.toLocaleString()} bytes == ` +
							`${((testConfig.messagesInBatch * testConfig.messageSize) / bytesPerKB).toFixed(
								2,
							)} KB`,
						async function () {
							// This test is flaky on tinylicious (1500 messages being sent sometimes slows the system down)
							if (provider.driver.type === "tinylicious") {
								this.skip();
							}
							await setupContainers({
								...containerConfigGroupedBatching,
								runtimeOptions: {
									...containerConfigGroupedBatching.runtimeOptions,
									compressionOptions: {
										minimumBatchSizeInBytes: 50 * bytesPerKB, // 50 KB
										compressionAlgorithm: CompressionAlgorithms.lz4,
									},
									chunkSizeInBytes: 20 * bytesPerKB, // 20 KB
								},
							});

							const generated: string[] = [];
							for (let i = 0; i < testConfig.messagesInBatch; i++) {
								// Ensure that the contents don't get compressed properly, by
								// generating a random string for each map value instead of repeating it
								const content = generateRandomStringOfSize(testConfig.messageSize);
								generated.push(content);
								localMap.set(`key${i}`, content);
							}

							await provider.ensureSynchronized();

							for (let i = 0; i < testConfig.messagesInBatch; i++) {
								assert.strictEqual(
									localMap.get(`key${i}`),
									generated[i],
									`Wrong value for key${i} in local map`,
								);
								assert.strictEqual(
									remoteMap.get(`key${i}`),
									generated[i],
									`Wrong value for key${i} in remote map`,
								);
							}
						},
					);
			}));

		itExpects(
			"Large ops fail when chunking is disabled and compressed content is over max op size",
			[
				{
					eventName: "fluid:telemetry:Container:ContainerClose",
					error: "BatchTooLarge",
				},
			],
			async function () {
				const maxMessageSizeInBytes = 50 * bytesPerKB; // 50 KB
				await setupContainers({
					...containerConfigGroupedBatching,
					runtimeOptions: {
						...containerConfigGroupedBatching.runtimeOptions,
						maxBatchSizeInBytes: 51 * bytesPerKB, // 51 KB
						chunkSizeInBytes: Number.POSITIVE_INFINITY,
					},
				});

				const largeString = generateRandomStringOfSize(maxMessageSizeInBytes);
				const messageCount = 3; // Will result in a 150 KB payload
				setMapKeys(localMap, messageCount, largeString);
				await provider.ensureSynchronized();
			},
		);

		itExpects(
			"Large ops fail when compression enabled and compressed content is over max op size",
			[{ eventName: "fluid:telemetry:Container:ContainerClose", error: "BatchTooLarge" }],
			async function () {
				const maxMessageSizeInBytes = 50 * bytesPerKB; // 50 KB
				await setupContainers({
					...testContainerConfig,
					runtimeOptions: {
						...containerConfigGroupedBatching.runtimeOptions,
						maxBatchSizeInBytes: 51 * bytesPerKB, // 51 KB
						chunkSizeInBytes: Number.POSITIVE_INFINITY,
					},
				});

				const largeString = generateRandomStringOfSize(maxMessageSizeInBytes);
				const messageCount = 3; // Will result in a 150 KB payload
				setMapKeys(localMap, messageCount, largeString);
				await provider.ensureSynchronized();
			},
		);
	});

	describe(`Payload size on the wire - grouped batches`, () => {
		let totalPayloadSizeInBytes = 0;
		let totalOps = 0;

		const assertPayloadSize = (totalMessageSizeInBytes: number): void => {
			// Expecting the message size on the wire should have
			// at most 35% extra from stringification and envelope overhead.
			// If any of the tests fail, this value can be increased only if
			// the payload size increase is intentional.
			const overheadRatio = 1.35;
			assert.ok(
				totalPayloadSizeInBytes < overheadRatio * totalMessageSizeInBytes,
				`Message size on the wire, ${totalPayloadSizeInBytes} is larger than expected ${
					overheadRatio * totalMessageSizeInBytes
				}, after sending ${totalMessageSizeInBytes} bytes`,
			);
		};

		const compressionSizeThreshold = 50 * bytesPerKB; // 50 KB;

		const setup = async () => {
			await setupContainers({
				...containerConfigGroupedBatching,
				runtimeOptions: {
					...containerConfigGroupedBatching.runtimeOptions,
					compressionOptions: {
						minimumBatchSizeInBytes: compressionSizeThreshold,
						compressionAlgorithm: CompressionAlgorithms.lz4,
					},
					chunkSizeInBytes: 20 * bytesPerKB, // 20 KB
				},
			});
			totalPayloadSizeInBytes = 0;
			totalOps = 0;
			toIDeltaManagerFull(localContainer.deltaManager).outbound.on("push", (messages) => {
				totalPayloadSizeInBytes += JSON.stringify(messages).length;
				totalOps += messages.length;
			});
		};

		const compressionRatio = 0.1;
		const badCompressionRatio = 1;
		describe("Check batch size on the wire", () =>
			[
				{
					messagesInBatch: 1,
					messageSize: 10 * bytesPerKB, // 10 KB
					expectedSize: 10 * bytesPerKB, // 10 KB
					payloadGenerator: generateStringOfSize,
				}, // One small uncompressed message
				{
					messagesInBatch: 3,
					messageSize: 10 * bytesPerKB, // 10 KB
					expectedSize: 30 * bytesPerKB, // 30 KB
					payloadGenerator: generateStringOfSize,
				}, // Three small uncompressed messages
				{
					messagesInBatch: 1,
					messageSize: compressionSizeThreshold + 1,
					expectedSize: compressionRatio * compressionSizeThreshold,
					payloadGenerator: generateStringOfSize,
				}, // One large message with compression
				{
					messagesInBatch: 10,
					messageSize: compressionSizeThreshold + 1,
					expectedSize: compressionRatio * (compressionSizeThreshold + 1),
					payloadGenerator: generateStringOfSize,
				}, // Ten large messages with compression
				{
					messagesInBatch: 10,
					messageSize: compressionSizeThreshold + 1,
					expectedSize: badCompressionRatio * 10 * (compressionSizeThreshold + 1),
					// In order for chunking to kick in, we need to force compression to output
					// a payload larger than the payload size limit, which is done by compressing
					// random data.
					payloadGenerator: generateRandomStringOfSize,
				}, // Ten large messages with compression and chunking
			].forEach((config) => {
				// biome-ignore format: https://github.com/biomejs/biome/issues/4202
				it(
						"Payload size check, " +
							"Sending " +
							`${config.messagesInBatch.toLocaleString()} messages of ${config.messageSize.toLocaleString()} bytes == ` +
							`${((config.messagesInBatch * config.messageSize) / bytesPerKB).toFixed(
								4,
							)} KB, expecting ${(config.expectedSize / bytesPerKB).toFixed(4)} KB on the wire`,
						async function () {
							// This is not supported by the local server due to chunking. See ADO:2690
							if (provider.driver.type === "local") {
								this.skip();
							}

							await setup();

							for (let i = 0; i < config.messagesInBatch; i++) {
								localMap.set(`key${i}`, config.payloadGenerator(config.messageSize));
							}

							await provider.ensureSynchronized();
							assertPayloadSize(config.expectedSize);
							assert.ok(
									// In case of chunking, we will have more independent messages (chunks) on the wire than in the original batch
									config.payloadGenerator === generateRandomStringOfSize ||
									totalOps === 1,
							);
						},
					);
			}));
	});

	describe("Resiliency", () => {
		const messageSize = 50 * bytesPerKB; // 50 KB
		const messagesInBatch = 3;
		const config: ITestContainerConfig = {
			...testContainerConfig,
			runtimeOptions: {
				summaryOptions: { summaryConfigOverrides: { state: "disabled" } },
				compressionOptions: {
					minimumBatchSizeInBytes: 51 * bytesPerKB, // 51 KB
					compressionAlgorithm: CompressionAlgorithms.lz4,
				},
				chunkSizeInBytes: 20 * bytesPerKB, // 20 KB
			},
		};

		const sendAndAssertSynchronization = async (connection: Promise<void>) => {
			const largeString = generateRandomStringOfSize(messageSize);
			setMapKeys(localMap, messagesInBatch, largeString);
			await connection;
			await provider.ensureSynchronized();

			assertMapValues(remoteMap, messagesInBatch, largeString);
			assertMapValues(localMap, messagesInBatch, largeString);
		};

		describe("Remote container", () => {
			// Forces a reconnection after processing a specified number
			// of ops which satisfy a given condition
			const reconnectAfterOpProcessing = async (
				container: IContainer,
				shouldProcess: (op: ISequencedDocumentMessage) => boolean,
				count: number,
			) => {
				let opsProcessed = 0;
				return new Promise<void>((resolve) => {
					const handler = (op) => {
						if (shouldProcess(op) && ++opsProcessed === count) {
							container.disconnect();
							container.once("connected", () => {
								resolve();
								container.off("op", handler);
							});
							container.connect();
						}
					};

					container.on("op", handler);
				});
			};

			it("Reconnects while processing chunks", async function () {
				await setupContainers(config);
				// Force the container to reconnect after processing 2 chunked ops
				const secondConnection = reconnectAfterOpProcessing(
					remoteContainer,
					(op) =>
						typeof op.contents === "string" &&
						(JSON.parse(op.contents) as { type?: unknown })?.type ===
							ContainerMessageType.ChunkedOp,
					2,
				);

				await sendAndAssertSynchronization(secondConnection);
			});

			it("Reconnects while processing compressed batch", async function () {
				await setupContainers(config);
				// Force the container to reconnect after processing all the chunks
				const secondConnection = reconnectAfterOpProcessing(
					remoteContainer,
					(op) => {
						const contents =
							typeof op.contents === "string" ? JSON.parse(op.contents) : undefined;
						return (
							contents?.type === ContainerMessageType.ChunkedOp &&
							contents?.contents?.chunkId === contents?.contents?.totalChunks
						);
					},
					1,
				);

				await sendAndAssertSynchronization(secondConnection);
			});
		});

		describe("Local container", () => {
			const reconnectAfterBatchSending = async (
				container: IContainer,
				shouldProcess: (batch: IDocumentMessage[]) => boolean,
				count: number,
			) => {
				let batchesSent = 0;
				return new Promise<void>((resolve) => {
					const handler = (batch) => {
						if (shouldProcess(batch) && ++batchesSent === count) {
							container.disconnect();
							container.once("connected", () => {
								resolve();
								toIDeltaManagerFull(container.deltaManager).outbound.off("op", handler);
							});
							container.connect();
						}
					};

					toIDeltaManagerFull(container.deltaManager).outbound.on("op", handler);
				});
			};

			it("Reconnects while sending chunks", async function () {
				// This is not supported by the local server. See ADO:2690
				if (provider.driver.type === "local") {
					this.skip();
				}

				await setupContainers(config);
				// Force the container to reconnect after sending 2 chunked ops,
				// each in their own batch
				const secondConnection = reconnectAfterBatchSending(
					localContainer,
					(batch) =>
						batch.length === 1 &&
						JSON.parse(batch[0].contents as string)?.type === ContainerMessageType.ChunkedOp,
					2,
				);

				await sendAndAssertSynchronization(secondConnection);
			});

			it("Reconnects while sending compressed batch", async function () {
				await setupContainers(config);
				// Force the container to reconnect after sending the compressed batch (i.e. send all chunks)
				const secondConnection = reconnectAfterBatchSending(
					localContainer,
					(batch) => {
						const parsedContent = JSON.parse(batch[0].contents as string);
						return (
							parsedContent?.type === ContainerMessageType.ChunkedOp &&
							parsedContent.contents.chunkId === parsedContent.contents.totalChunks
						);
					},
					1,
				);

				await sendAndAssertSynchronization(secondConnection);
			});
		});
	});
});
