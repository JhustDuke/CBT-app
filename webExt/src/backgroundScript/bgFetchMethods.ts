import { BackendResponseInterface } from "../interfaces";
import { mockData } from "./mock";
import axios, { AxiosResponse, AxiosInstance } from "axios";
import { backendUrls } from "auxie-shared";
import { UpdateEnrolStatusPayloadInterface } from "../interfaces";
const api: AxiosInstance = axios.create({
	baseURL: backendUrls.extApp,
});

// BG fetch methods
export const bgFetchMethods = {
	backHistory: [] as BackendResponseInterface[],
	frontHistory: [] as BackendResponseInterface[],
	dataGenerator: null as Generator<BackendResponseInterface> | null,

	updateBackendData: async function (
		payload: UpdateEnrolStatusPayloadInterface
	): Promise<any> {
		const endpoint: string = "/updateEnrolStatus";

		try {
			const response = await api.patch(endpoint, payload);

			return response.data;
		} catch (err: any) {
			const message: string =
				err?.response?.data?.message ||
				err?.message ||
				"failed to update enrol status";

			console.log("[updateBackendData] error:", message);

			throw new Error(message);
		}
	},

	// fetch backend data
	fetchBackendData: async function (): Promise<BackendResponseInterface[]> {
		const getEnrolData = "/getEnrolData";
		try {
			const response: AxiosResponse<BackendResponseInterface[]> = await api.get(
				getEnrolData
			);

			const data: BackendResponseInterface[] = response.data;

			console.log(data);

			return data;
		} catch (err: any) {
			throw new Error(err.response.data?.message || "network error retry");
		}
	},

	// generator helper
	yieldData: function* (data: BackendResponseInterface[]) {
		for (let i = 0; i < data.length; i++) {
			yield data[i];
		}
	},

	// init generator once
	initGenerator: async function (): Promise<void> {
		if (bgFetchMethods.dataGenerator) {
			console.log("[initGenerator] generator already exists, returning early");
			return;
		}

		const data = await bgFetchMethods.fetchBackendData();
		bgFetchMethods.dataGenerator = bgFetchMethods.yieldData(data);
	},

	// start (history first, then generator)
	start: async function (): Promise<IteratorResult<BackendResponseInterface>> {
		if (bgFetchMethods.backHistory.length > 0) {
			console.log("[start] serving from backHistory");
			const last = bgFetchMethods.backHistory.at(
				-1
			) as BackendResponseInterface;
			return { value: last, done: false };
		}

		await bgFetchMethods.initGenerator();

		const first = bgFetchMethods.dataGenerator?.next();
		if (!first) {
			console.log("[start] generator missing, returning early");
			throw new Error("no data available");
		}

		if (!first.done) {
			bgFetchMethods.backHistory.push(first.value);
		}

		return first;
	},

	// next (frontHistory → generator)
	next: async function (): Promise<IteratorResult<BackendResponseInterface>> {
		if (bgFetchMethods.frontHistory.length > 0) {
			console.log("[next] serving from frontHistory");
			const item =
				bgFetchMethods.frontHistory.pop() as BackendResponseInterface;
			bgFetchMethods.backHistory.push(item);
			return { value: item, done: false };
		}

		await bgFetchMethods.initGenerator();

		const next = bgFetchMethods.dataGenerator?.next();
		if (!next) {
			console.log("[next] generator missing, returning early");
			throw new Error("no more data");
		}

		if (!next.done) {
			bgFetchMethods.backHistory.push(next.value);
		}

		return next;
	},

	// prev (pure history)
	prev: function (): IteratorResult<BackendResponseInterface> {
		if (bgFetchMethods.backHistory.length <= 1) {
			console.log("[prev] no previous history, returning early");
			throw new Error("no previous data");
		}

		const current =
			bgFetchMethods.backHistory.pop() as BackendResponseInterface;
		bgFetchMethods.frontHistory.push(current);

		const prev = bgFetchMethods.backHistory.at(-1) as BackendResponseInterface;

		return { value: prev, done: false };
	},
};

// BG download helper
//https://agents-ui-i2jn.onrender.com
//https://cbt-ui-mock.onrender.com
//https://backend-apis-cgn1.onrender.com
