# Swart Airtable CMS

The content on Swart's homepage changes periodically.

The site's editor is responsible for updating the texts and photo displayed in the Notice, Der Drink, and Events sections.

## Summary
We wanted to allow a person who might not know HTML (or even markdown, for that matter) to manage the content, but a full-blown content management system (CMS) seemed excessive. Instead, we decided to use **Airtable** as an accessible, user-friendly CMS.

Now, the editor can manage the content using an intuitive spreadsheet-like UI, and the changes are automatically deployed to the site.

Our solution integrates four services, referenced below:
- [Eleventy (11ty)](DEV-DOCS.md#eleventy---interacting-with-the-airtable-api)
- [Airtable](DEV-DOCS.md#airtable---managing-the-content)
- [Pipedream](DEV-DOCS.md#pipedream---automating-the-deployment-to-vercel)
- [Vercel](DEV-DOCS.md#vercel---building-the-site-and-managing-the-secrets)

This document provides an overview of the integration for any future developer/webmaster.
 
## Eleventy - interacting with the Airtable API
Eleventy offers almost seamless access to APIs, exposing the fetched data to the site's templates.

The file `airtable.js` interacts with the Airtable API. We store it in Eleventy's global data folder: `src/_data`.

The script fetches the three tables in Swart's Airtable base: _schedule_, _drink_, and _notice_.

The requests are cached locally for 90 minutes using Eleventy's [Cache Assets plugin](https://www.11ty.dev/docs/plugins/cache/). This step reduces build times and avoids hitting Airtable API's limit (five requests per second) during development.

Here's the script:

```js
const Cache = require("@11ty/eleventy-cache-assets");
require("dotenv").config();

const apiKey = process.env.AIRTABLE_API_KEY;
const baseID = process.env.AIRTABLE_BASE_ID;
const apiURL = "https://api.airtable.com/v0";

// Cache the Airtable API URLs passed below
const fetchData = async (url) => {
	console.log("Caching API requests");
	try {
		let data = await Cache(url, {
			duration: "90m",
			type: "json",
			fetchOptions: {
				headers: { Authorization: `Bearer ${apiKey}` },
			},
		});

             // Concatenate the json response
		const allTables = data.records.map((record) => {
			return record.fields;
		});
		// console.log("All:", allTables);
		return allTables;
	} catch (error) {
		console.error(error.stack);
		return {};
	}
};

// the URL of each table, with relevant Airtable filters (encoded)
module.exports = async () => {
	try {
		const notice = await fetchData(`${apiURL}/${baseID}/notice?maxRecords=1`);
		const drink = await fetchData(
			`${apiURL}/${baseID}/drink?maxRecords=1&filterByFormula=NOT(%7BName%7D+%3D+'')`
		);
		const events = await fetchData(
			`${apiURL}/${baseID}/schedule?maxRecords=15&sort%5B0%5D%5Bfield%5D=Date&filterByFormula=NOT(%7BName%7D+%3D+'')`
		);

		// Return the promise for each table
		// console.log("Notice:", notice, "Drink:", drink, "Events:", events);
		return { notice, drink, events };
	} catch (error) {
		console.error("Error returning multiple cached API requests");
	}
};

```

The script performs three tasks:
1. Calling the Airtable API (the authentication variables at the top are stored in a `.env` file).
2. Checking the `.cache` folder and either pulling the cached data or fetching newer results.
3. Returning the concatenated results in `JSON` format.

These results are now available for the template. We can display them across the site using `airtable.TABLE_NAME` - a `nunjucks` variable comprised of two parts:
1. The script name (`src/_data/airtable.js` without the file extension).
2. The table/variable name (`notice`, `drink`, or `events`).

The file `src/_includes/drink.njk`, for example, generates the data fetched from Airtable's _drink_ table.

Bellow is the template file that generates the _Der Drink_ section on the homepage using `nunjucks` and `HTML`:

```
{% for item in airtable.drink %}
	<header class="header">
		<h2>Der Drink</h2>
		<h3 translate="no">{{ item.Name }}</h3>
		<p>{{ item.Price }}</p>
	</header>
	<figure role="group">
		<img src="{{ item.Photo }}.jpg" alt="Swart's deal: {{ item.Name }}" width="350" height="233" loading="lazy">
		<figcaption>{{ item.Description }}</figcaption>
		<a href="/static/getraenke01.pdf">› More Drinks...</a>
	</figure>
{% endfor %}
```

## Airtable - managing the content
The site editor manages the content in an Airtable _base_ named [Swart Final 2020](https://airtable.com/appbUdgFei30sFUZP).

For more information about the tables and fields, see the [relevant sections of the Site Manual](README.md#update-the-content-on-the-homepage).

## Pipedream - automating the deployment to Vercel
[Pipedream](https://pipedream.com) is an automation tool similar to Integromat (or Zapier).

It has a very generous free tier, especially considering Swart's low-frequency updates cycle.

Pipedream has built-in support for Airtable, and it handles the authentication internally.

We have three Pipedream [_Workflows_](https://pipedream.com/workflows), each interacting with the corresponding Airtable table:
- `Update der Drink`
- `Update Events calendar`
- `Update Notice box`

The Workflows are identical, _except_ for the table they monitor.

The three-step Workflows fire automatically when the editor changes the content on Airtable:
1. The script is triggered each time a record is added, updated, or deleted in the corresponding table.
2. It then makes an HTTP request to Vercel's Deploy Hook, deploying a new build.
3. After the update completes, Pipedream sends a notification email to the webmaster, listing the changes (or errors).

Each workflow also checks for updates once a day via a CRON job. It bails if there are no changes.

* Note: Pipedream essentially skips GitHub and doesn't interact with the repository.

## Vercel - building the site and managing the secrets
Vercel handles two key parts of the system:
- Secrets
- Webhook

The `AIRTABLE_BASE_ID` and `AIRTABLE_API_KEY` variables at the top of the `airtable.js` script are stored as _Environment Variables_ in Vercel's dashboard.

These secrets replace the local, uncommitted `.env` file when deploying the site.

The webhook triggered by Pipedream is stored as `Update Airtable` _Deploy Hook_ in Vercel's dashboard.

---

When the bar was closed for the public during Covid-19 lockdowns, we had a chance to test the system in real-time, tweak the workflow, and make sure everything worked as planned. After a few cycles of updates, our solution proved reliable and usable on the back- and frontend.

_Last updated on October 31, 2021_