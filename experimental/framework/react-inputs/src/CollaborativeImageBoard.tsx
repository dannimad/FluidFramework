/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import { SharedMap } from "@fluidframework/map";
import { IFluidHandle } from "@fluidframework/core-interfaces";

export interface ICollaborativeImageBoardProps {
	/**
	 * The SharedString that will store the text from the textarea.
	 */
	map: SharedMap;

	uploadBlob(blob: ArrayBufferLike): Promise<IFluidHandle<ArrayBufferLike>>;
}

async function getImageArrayBuffer(url: string): Promise<ArrayBuffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return arrayBuffer;
}

export const CollaborativeImageBoard: React.FC<ICollaborativeImageBoardProps> = (
	props: ICollaborativeImageBoardProps,
) => {
	const { map } = props;

	const [mapValues, setMapValues] = useState<ArrayBuffer[]>([]);

	const cacheImage = async (buffer: ArrayBuffer, key: string): Promise<void> => {
		const reader = new FileReader();
		reader.readAsArrayBuffer(new Blob([buffer]));
		reader.onloadend = async () => {
			if (reader.result instanceof ArrayBuffer) {
				const handle = await props.uploadBlob(reader.result);
				// const base64data = reader.result.toString();
				// setMapValues([...mapValues, reader.result]);
				map.set(key, handle);
			}
		};
	};

	const handleClick = async () => {
		const randomKey = Math.floor(Math.random() * 100).toString();
		const randomImage = `https://picsum.photos/id/${randomKey}/200/300.jpg`;
		const imageBuffer = await getImageArrayBuffer(randomImage);
		await cacheImage(imageBuffer, randomKey);

		// const handle = await props.uploadBlob(imageBuffer);
		// map.set(randomKey, handle);
	};

	useEffect(() => {
		async function updateSharedMap() {
			try {
				const handles = Array.from(map.values());
				const buffers: ArrayBuffer[] = [];
				for (const handle of handles) {
					const buffer = await handle.get();
					buffers.push(buffer);
				}
				console.log("buffers");
				console.log(buffers);
				// const promises = handles.map(async (handle) => handle.get() as ArrayBuffer);
				setMapValues(buffers);
			} catch {
				console.log("error");
			}
		}

		const handleValueChanged = () => {
			updateSharedMap().catch(console.error);
		};

		map.on("valueChanged", handleValueChanged);
		return () => {
			map.off("valueChanged", handleValueChanged);
		};
	}, [map]);

	return (
		// There are a lot of different ways content can be inserted into a textarea
		// and not all of them trigger a onBeforeInput event. To ensure we are grabbing
		// the correct selection before we modify the shared string we need to make sure
		// this.updateSelection is being called for multiple cases.
		<div>
			<h2>Image Board</h2>
			<button onClick={handleClick}> Random Image </button>
			<div style={{ display: "flex", flexWrap: "wrap" }}>
				{Array.from(mapValues.entries()).map(([key, value]) => (
					<div key={key} style={{ margin: "10px" }}>
						<img
							src={`data:image/jpg;base64,${btoa(
								String.fromCharCode(...new Uint8Array(value)),
							)}`}
							alt=""
							style={{ width: "200px" }}
						/>
						<p>{key}</p>
					</div>
				))}
			</div>
		</div>
	);
};
