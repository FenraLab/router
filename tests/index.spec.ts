// import { Endpoint, Router, Server } from "../src";
// // import { ELNCollection } from "../features/ELN";
// import { DebugEndpoint } from "../src/routers/debugEndpoint";

// import autocannon from "autocannon";

// describe("Router", () => {
// 	const port = 3000;
// 	let server: Server;

// 	beforeAll(() => {
// 		server = new Server(Router);
// 		const debug = server.route(DebugEndpoint, "/debug");
// 		// const eln = server.route(ELNCollection, "/eln");

// 		const hello = server.route(Endpoint, "/hello.txt");
// 		hello.handle("get", async (request, response, next) => {
// 			response.setHeader("conect-type", "text/plain");
// 			await next();
// 			response.write("Hello, world!");
// 		});

// 		server.listen(port);
// 	});

// 	const url = `http://localhost:${port}/eln/MyDocument/A/Calibrant`;

// 	it("warms up", async function () {
// 		this.timeout(10 * 1000);
// 		await autocannon({ url, connections: 10, duration: 5 });
// 	});

// 	const duration = 30;
// 	const connectionsArray = [1, 10, 100, 500, 1000];

// 	for (const connections of connectionsArray) {
// 		it(`has good speeds (${connections} concurrent)`, async function () {
// 			this.timeout((duration + 1) * 1000);

// 			const result = await autocannon({ url, connections, duration });
// 			console.log({
// 				connections,
// 				reqPerSec: result.requests.average.toFixed(2),
// 				latency: result.latency.average.toFixed(2),
// 				errors: result.errors,
// 				timeouts: result.timeouts,
// 			});
// 		});
// 	}

// 	afterAll(() => server.close());
// });
