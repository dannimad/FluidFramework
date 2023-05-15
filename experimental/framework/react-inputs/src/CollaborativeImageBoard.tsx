/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from "react";
import { MapBlobHelper } from "./MapBlobHelper";

export interface ICollaborativeImageBoardProps {
	mapBlobHelper: MapBlobHelper;
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
	const { mapBlobHelper } = props;

	const [mapValues, setMapValues] = useState<ArrayBuffer[]>([]);

	// const cacheImage = async (buffer: ArrayBuffer, key: string): Promise<void> => {
	// 	const reader = new FileReader();
	// 	reader.readAsArrayBuffer(new Blob([buffer]));
	// 	reader.onloadend = async () => {
	// 		if (reader.result instanceof ArrayBuffer) {
	// 			const handle = await props.uploadBlob(reader.result);
	// 			// const base64data = reader.result.toString();
	// 			// setMapValues([...mapValues, reader.result]);
	// 			map.set(key, handle);
	// 		}
	// 	};
	// };

	const handleClick = async () => {
		const randomKey = Math.floor(Math.random() * 100).toString();
		const randomImage = `https://picsum.photos/id/${randomKey}/200/300.jpg`;
		const imageBuffer = await getImageArrayBuffer(randomImage);
		mapBlobHelper.set(randomKey, imageBuffer);

		// await cacheImage(imageBuffer, randomKey);

		// const handle = await props.uploadBlob(imageBuffer);
		// map.set(randomKey, handle);
	};

	useEffect(() => {
		const firstTime = async () => {
			const buffers = await mapBlobHelper.setBuffers();
			setMapValues([...buffers]);
		};

		firstTime().catch((error) => console.log(error));
	}, []);

	useEffect(() => {
		const handleValueChanged = (buffers: ArrayBuffer[]) => {
			setMapValues([...buffers]);
		};

		mapBlobHelper.on("MapChanged", handleValueChanged);
		return () => {
			mapBlobHelper.off("MapChanged", handleValueChanged);
		};
	}, [mapBlobHelper.buffers]);

	return (
		// There are a lot of different ways content can be inserted into a textarea
		// and not all of them trigger a onBeforeInput event. To ensure we are grabbing
		// the correct selection before we modify the shared string we need to make sure
		// this.updateSelection is being called for multiple cases.
		<div>
			<h2>Image Board</h2>
			<div style={{ display: "flex", alignItems: "center" }}>
				<button onClick={handleClick} style={{ marginRight: "10px" }}>
					Random Image
				</button>
				<button onClick={handleClick} style={{ marginRight: "10px" }}>
					Delay Image
				</button>
				<button onClick={handleClick}>Offline</button>
			</div>
			<hr style={{ margin: "20px 0" }} />
			<div style={{ display: "flex", flexWrap: "wrap" }}>
				{Array.from(mapValues.entries()).map(([key, value]) => (
					<div key={key} style={{ margin: "10px" }}>
						<img
							src={`data:image/jpg;base64,${btoa(
								String.fromCharCode(...new Uint8Array(value)),
							)}`}
							alt=""
							style={{ width: "200px", height: "200px", objectFit: "cover" }}
						/>
					</div>
				))}
			</div>
		</div>
	);
};
