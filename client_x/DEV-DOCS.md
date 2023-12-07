# Client X Airtable CMS

The content on Client X's homepage changes periodically.

The site's editor is responsible for updating the texts and photo displayed in the **Notice**, **the Monthly Drink**, and **Events** sections.

## Summary
We wanted to allow a person who might not know HTML (or even markdown, for that matter) to manage the content, but a full-blown content management system (CMS) seemed excessive. Instead, we decided to use **Airtable** as an accessible, user-friendly CMS.

Now, the editor can manage the content using an intuitive spreadsheet-like UI, and the changes are automatically deployed to the site.

Our solution integrates three services, referenced below:
- [Eleventy (11ty)](DEV-DOCS.md#eleventy---interacting-with-the-airtable-api)
- [Airtable](DEV-DOCS.md#airtable---managing-the-content)
- [Vercel](DEV-DOCS.md#vercel---building-the-site-and-managing-the-secrets)

This document provides an overview of the integration for any future developer/webmaster.

## Eleventy - interacting with the Airtable API
Eleventy offers almost seamless access to APIs, exposing the fetched data to the site's templates.

The file `airtable.js` interacts with the Airtable API. We store it in Eleventy's global data folder: `src/_data`.

The script fetches the three tables in Client X's Airtable base: _events_, _drink_, and _notice_.

The requests are cached locally for 7 hours using Eleventy's [Cache Assets plugin](https://www.11ty.dev/docs/plugins/cache/). This step reduces build times and avoids hitting Airtable API's limit (five requests per second) during development.

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
			duration: "7h",
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
			`${apiURL}/${baseID}/events?maxRecords=15&sort%5B0%5D%5Bfield%5D=Date&filterByFormula=NOT(%7BName%7D+%3D+'')`
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
1. Calling the Airtable API (the authentication variables at the top are stored locally in a `.env` file). In production, we set these variables directly in Vercel.
2. Checking the `.cache` folder and either pulling the cached data or fetching newer results.
3. Returning the concatenated results in `JSON` format.

These results are now available for the template. We can display them across the site using `airtable.TABLE_NAME` - a `nunjucks` variable comprised of two parts:
1. The script name (i.e., `src/_data/airtable.js` without the file extension) and
2. The table/variable name (i.e., `notice`, `drink`, or `events`).

The file `src/_includes/drink.njk`, for example, generates the data fetched from Airtable's _drink_ table.

Bellow is the template file that generates the _the Monthly Drink_ section on the homepage using `nunjucks` and `HTML`:

```html
{% for item in airtable.drink %}
	<header class="header">
		<h2>the Monthly Drink</h2>
		<h3 translate="no">{{ item.Name }}</h3>
		<p>{{ item.Price }}</p>
	</header>
	<figure role="group">
		<img src="{{ item.Photo }}.jpg" alt="Our monthly deal: {{ item.Name }}" width="350" height="233" loading="lazy">
		<figcaption>{{ item.Description }}</figcaption>
		<a href="/static/getraenke01.pdf" download>› More Drinks...</a>
	</figure>
{% endfor %}
```

## Airtable - managing the content
The site editor manages the content in an Airtable _base_ named [Client X Site Managment](https://airtable.com/BASE_ID).

For more information about the tables and fields, see the [relevant sections of the Site Manual](README.md#update-the-content-on-the-homepage).

## Vercel & GitHub - building the site and managing the secrets
Vercel, our hosting service, handles two key parts of the system:
- Secrets
- Webhook

The `AIRTABLE_BASE_ID` and `AIRTABLE_API_KEY` variables at the top of the `airtable.js` script are stored as _Environment Variables_ in Vercel's dashboard.

These secrets replace the local, uncommitted `.env` file when deploying the site to production.

The webhook triggered by the GitHub workflow named _Scheduled Eleventy Build_ (see the file [here](.github/workflows/build.yml)) is stored as a _Deploy Hook_ in Vercel's dashboard.

---

When the business was closed for the public during Covid-19 lockdowns, we had a chance to test the system in real-time, tweak the workflow, and make sure everything worked as planned. After a few cycles of updates, our solution proved reliable and usable on the back- and frontend.

_Last updated on December 07, 2023_