import puppeteer from "puppeteer";
import { Cluster } from "puppeteer-cluster";

import ValClient from "../ValClient";
import Controller from "../structures/Controller";

import { compileTemplate, log } from "../utils/general";
import { Destroyable } from "../types/interfaces";

export default class RenderController
	extends Controller
	implements Destroyable {
	private cluster: Cluster;

	constructor(client: ValClient) {
		super(client, {
			name: "render",
		});
	}

	init = async () => {
		try {
			if (this.cluster == null) {
				this.cluster = await Cluster.launch({
					concurrency: Cluster.CONCURRENCY_CONTEXT,
					maxConcurrency: 2,
					puppeteerOptions: {
						args: ["--no-sandbox", "--disable-setuid-sandbox"],
						headless: true,
					},
				});

				await this.cluster.task(async ({ page, data: { html, content } }) => {
					return this.screenshot(page, {
						content,
						html,
					});
				});
			}
		} catch (err) {
			log(this.client, err, "error");
		}
	};

	destroy = () => this.cluster.close();

	render = async (data: { content: Record<string, unknown>; html: string }) => {
		return this.cluster.execute(data);
	};

	screenshot = async (page: puppeteer.Page, { content, html }) => {
		const template = compileTemplate(content, html);

		await page.setContent(template, { waitUntil: "networkidle0" });
		const element = await page.$("body");

		const buffer = await element.screenshot({
			type: "jpeg",
			omitBackground: true,
			encoding: "binary",
			quality: 100,
		});

		return buffer;
	};
}
