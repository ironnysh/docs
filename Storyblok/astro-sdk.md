
# Chapter 1: Getting started

Use Storyblok to manage the content of an Astro website.

> [!NOTE] Versions
>
> - [astro v5.7.0](https://github.com/withastro/astro/blob/main/packages/astro)
> - [create-astro v4.11.1](https://github.com/withastro/astro/blob/main/packages/create-astro)
> - [storyblok-astro v6.1.1](https://github.com/storyblok/storyblok-astro/releases/tag/v6.1.1)
> - Node v23.11.0

## Setup

1. Create a new Astro project following the [official installation guide](https://docs.astro.build/en/install-and-setup/).

2. Create a new Storyblok space at [app.storyblok.com](http://app.storyblok.com). The space includes the content and blocks referenced in this guide.

> [!NOTE] Storyblok concepts
> Learn more about [Storyblok concepts and terminology](https://www.storyblok.com/docs/concepts/).

## Installation

In the terminal, `cd` into the Astro project and install the `@storyblok/astro` and `@vite` packages.

```shell
npm install @storyblok/astro vite --save-dev
```

In the root of the project, create a `.env` file to store the Storyblok access token.

```shell
STORYBLOK_DELIVERY_API_TOKEN="<REPLACE_WITH_YOUR_TOKEN>"
```

> [!NOTE] API access token
> Learn where to find the [access token](https://www.storyblok.com/docs/concepts/access-tokens#space-access-token) of a Storyblok space.

In `astro.config.mjs`, initialize Storyblok:

```js
import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
const env = loadEnv('', process.cwd(), 'STORYBLOK');

export default defineConfig({
	integrations: [
		storyblok({
			accessToken: env.STORYBLOK_ACCESS_TOKEN,
			apiOptions: {
        region: 'eu', // Optional. Defaults to 'eu'
      },
		}),
	],
	output: 'server',
});

```

> [!NOTE] SDK configuration
> **Region:** If the space is not in the EU, update the code accordingly. Learn more about [supported regions](https://www.storyblok.com/faq/define-specific-region-storyblok-api#adding-a-region-parameter-when-using-an-sdk).
>
> Learn about [other configuration options](https://github.com/storyblok/storyblok-astro?tab=readme-ov-file#options) available in the `@storyblok/astro` SDK.

## Fetch a single story

Open `src/pages/index.astro` and replace Astro's default contents with the following:

```js
---
import { useStoryblokApi } from '@storyblok/astro';
import StoryblokComponent from '@storyblok/astro/StoryblokComponent.astro';
import Layout from '../layouts/Layout.astro';

const storyblokApi = useStoryblokApi();
const { data } = await storyblokApi.get('cdn/stories/home', {
	version: 'draft',
});

const story = data.story;
---

<Layout>
	<StoryblokComponent blok={story.content} />
</Layout>

```

The `StoryblokComponent` renders the content types and nestable blocks defined in a Storyblok space. Here, it fetches the `home` story.

## Register and render blocks

A new Storyblok space has one story and four blocks:

- A story (`home`)
- A content type block (`page`)
- Three nestable blocks (`teaser`, `grid`, and `feature`).

To allow Astro to render them, update `astro.config.mjs` with the following content:

```js
// ...
  accessToken: env.STORYBLOK_ACCESS_TOKEN,
	components: {
		page: 'storyblok/Page',
		grid: 'storyblok/Grid',
		feature: 'storyblok/Feature',
		teaser: 'storyblok/Teaser',
	},
// ...
```

In the project's `src` directory, create a `storyblok` directory containing four files:

- `Page.astro`
- `Grid.astro`
- `Feature.astro`
- `Teaser.astro`

> [!NOTE] Storyblok structure
> Learn more about [content types, blocks, and fields](https://www.storyblok.com/docs/concepts/blocks).

Paste the following snippets in the corresponding file:

`src/storyblok/Page.astro`

```js
---
import { storyblokEditable } from '@storyblok/astro';
import StoryblokComponent from '@storyblok/astro/StoryblokComponent.astro';
const { blok } = Astro.props;
---

<main {...storyblokEditable(blok)}>
	{
		blok.body?.map((blok) => {
			return <StoryblokComponent blok={blok} />;
		})
	}
</main>

```

`src/storyblok/Grid.astro`

```js
---
import { storyblokEditable } from '@storyblok/astro';
import StoryblokComponent from '@storyblok/astro/StoryblokComponent.astro';
const { blok } = Astro.props;
---

<div {...storyblokEditable(blok)} class="grid">
	{
		blok.columns?.map((blok) => {
			return <StoryblokComponent blok={blok} />;
		})
	}
</div>

```

`src/storyblok/Feature.astro`

```js
---
import { storyblokEditable } from '@storyblok/astro';
const { blok } = Astro.props;
---

<div {...storyblokEditable(blok)} class="feature">
	<p>{blok.name}</p>
</div>

```

`src/storyblok/Teaser.astro`

```js
---
import { storyblokEditable } from '@storyblok/astro';
const { blok } = Astro.props;
---

<section {...storyblokEditable(blok)} class="teaser">
	<h1>{blok.headline}</h1>
</section>

```

Each file renders the contents in the `blok` property object.

While `Page.astro` iterates over the `body` block field, `Grid.astro` iterates over the `columns` block field. Both consist of an array of nestable blocks.

Start the local development server using `npm run dev` and open `http://localhost:4321/` in the browser to view the website.

---

# Chapter 2: Visual preview

Set up the Astro project to automatically render new stories created in Storyblok.

## Set the default environment

To connect to the Visual Editor, the local project must run over HTTPS.

> [!NOTE] HTTPS
> Learn how to [create a local HTTPS certificate on macOS](https://www.storyblok.com/faq/setup-dev-server-https-proxy)

To render a preview of the local project in the Storyblok Visual Editor, follow these steps:

1. Navigate to **Settings > Visual Editor**.
2. Set the default environment to `https://localhost:3000`.
3. Save.
4. Open the `home` story.
5. Click **Config**.
6. Type `/` in the **Real path**.

After you save, Astro will render the project in the Visual Editor.

## Set up Storyblok Bridge

Connect Astro components to their Storyblok counterparts with the `storyblokEditable` function.

This function adds HTML attributes to the components and allows the **Storyblok Bridge** to interact with the Visual Editor in real time.

> [!NOTE] Storyblok Bridge
> The Storyblok Bridge is enabled by default. Learn more about [the `StoryblokBridge` class](https://www.storyblok.com/docs/packages/storyblok-bridge) and [the options available in the `@storyblok/astro` SDK](https://github.com/storyblok/storyblok-astro?tab=readme-ov-file#using-the-storyblok-bridge).

The components created in the **Getting started** chapter are already set up. For example:

`src/storyblok/Teaser.astro`

```js
// ...
<section {...storyblokEditable(blok)} class="teaser">
	<h1>{blok.headline}</h1>
</section>

```

## Set up Live preview

To activate the live preview feature in the Astro project, adapt `astro.config.mjs` with the following content:

```js
// ...
integrations: [
	storyblok({
		accessToken: env.STORYBLOK_ACCESS_TOKEN,
+		livePreview: true,
// ...

```

> [!NOTE] Live preview
> This feature supports real-time editing capabilities. [Learn how to enable all the options](https://github.com/storyblok/storyblok-astro?tab=readme-ov-file#enabling-live-preview-for-storybloks-visual-editor).

Test the preview in Storyblok:

1. Open the `home` story.
2. Click the `Teaser` block in the Visual Editor to open its corresponding field.
3. Change the value, save, and see the update rendered.

## Deploy the preview environment

To fetch the `draft` version of the content, use a **preview access token**.

In a production environment, fetch the `published` version of the content using a **public access token**.

> [!NOTE] Deployment tutorial
> [Learn how to set up preview and production environments](https://www.storyblok.com/tp/create-preview-production-environments-and-deploy).

Deploy the website using client-side or server-side rendering mode to reflect content updates in the Visual Editor.

---

# Chapter 3: Dynamic routing

Set up the Astro project to map all routes and render new stories automatically.

Create a `src/pages/[…slug].astro` file with the following content:

```js
---
import { useStoryblokApi } from '@storyblok/astro';
import StoryblokComponent from '@storyblok/astro/StoryblokComponent.astro';
import Layout from '../layouts/Layout.astro';

const { slug } = Astro.params;

const storyblokApi = useStoryblokApi();
const { data } = await storyblokApi.get(`cdn/stories/${slug || 'home'}`, {
	version: 'draft',
});

const story = data.story;
---

<Layout>
	<StoryblokComponent blok={story.content} />
</Layout>

```

Instead of fetching the single `home` story, Astro now fetches all stories. If no slug is present in the route, it loads the `home` story.

Delete `src/pages/index.astro` and restart the development server.

In Storyblok, create a new story, add some blocks, and Astro will render it automatically.

> [!NOTE] Static site generator (SSG)
> To deploy in SSG mode, define the routes manually using Astro’s `getStaticPaths()`. Use Storyblok's [Links endpoint](https://www.storyblok.com/docs/api/content-delivery/v2/links/) to retrieve them.
>
> Learn more about [dynamic routes in the Astro documentation](https://docs.astro.build/en/guides/routing/#dynamic-routes).

---

# Chapter 4: Content Modeling

Handle different content type blocks, render rich text, and use References to manage content globally.

## Set up the Storyblok space

Navigate to the **Blocks** section and create three new blocks:

1. A content type block named `article` with two fields:
   - `Text`: for the title
   - `Rich text`: for the content
2. A content type block named `article_overview`. It has no fields.
3. A nestable block named `featured_articles` with one field:
   - `Multi Options (References)`: name it `articles`

> [!NOTE] Field types
> Learn more about [Storyblok's different field types](https://www.storyblok.com/docs/concepts/fields).

Next, navigate to the **Content** section:

1. Create a folder named `Articles`.
2. Create two or more sample stories inside it. Use the `article` block created before.
3. Create another story, this time use the `article_overview` block. Name it and select the **Define as root for the folder** option.
4. Open the `home` story and add the `featured_articles` block to the `body` field.
5. Select some articles to feature.

## Set up the Astro project

Register the new blocks and create the corresponding components.

### Register the blocks

Add the new blocks to `astro.config.astro`:

```js
// ...
  components: {
		page: 'storyblok/Page',
		grid: 'storyblok/Grid',
		feature: 'storyblok/Feature',
		teaser: 'storyblok/Teaser',
	+	article: 'storyblok/Article',
	+	featured_articles: 'storyblok/FeaturedArticles',
	+	article_overview: 'storyblok/ArticleOverview',
			},
// ...
```

### Create the Article block

Create a `src/storyblok/Article.astro` file with the following content:

```js
---
import { storyblokEditable, renderRichText } from '@storyblok/astro';

const { blok } = Astro.props;
const renderedRichText = renderRichText(blok.content);
---

<article {...storyblokEditable(blok)}>
	<h2>{blok.title}</h2>
	<Fragment set:html={renderedRichText} />
</article>

```

The `StoryblokRichText` component, provided by the SDK, renders the contents of the rich text field.

> [!NOTE] Rich text
> Learn more about [the rich text field](https://www.storyblok.com/docs/concepts/fields#rich-text) and the `@storyblok/astro` package.

This component allows Astro to render all the content type `article` stories.

### Fetch and list all articles

Create a `src/storyblok/ArticleOverview.astro` file with the following content:

```js
---
import { useStoryblokApi } from '@storyblok/astro';

const storyblokApi = useStoryblokApi();
const articles = await storyblokApi.getAll('cdn/stories', {
	version: 'draft',
	starts_with: 'articles',
	content_type: 'article',
});
---

<section>
	<h2>Articles overview</h2>
	<ul>
		{
			articles.map((article) => (
				<li>
					<a href={article.full_slug}>{article.name}</a>
					<p>{article.content.summary}</p>
				</li>
			))
		}
	</ul>
</section>

```

The `starts_with` parameter retrieves stories from the **Articles** folder.
The `content_type` parameter restricts the results to stories of the content type `article`. This excludes the `article_overview` story.

> [!NOTE] The Content Delivery API
> Learn more about parameters and filter queries in the [API documentation](https://www.storyblok.com/docs/api/content-delivery/v2/getting-started/).

This component renders the articles' overview page, which returns a list of links to all articles.

### Display featured articles using referenced stories

To resolve referenced stories, set the `resolve_relations` parameter in the relevant API request. Adapt `src/pages/[...slug].astro` like so:

```js diff
// ...
const { data } = await storyblokApi.get(`cdn/stories/${slug || 'home'}`, {
	version: 'draft',
+	resolve_relations: 'featured_articles.articles',
});
// ...

```

> [!NOTE] References
> Learn more [about references](https://www.storyblok.com/docs/concepts/references) and how to work with them.

Next, create a `src/storyblok/FeaturedArticles.astro` file with the following content:

```js
---
import { storyblokEditable } from '@storyblok/astro';

const { blok } = Astro.props;
const articles = blok.articles;
---

<section {...storyblokEditable(blok)}>
	<h2>Featured articles</h2>
	<ul>
		{
			articles.map((article) => (
				<li>
					<a href={article.full_slug}>{article.content.title}</a>
				</li>
			))
		}
	</ul>
</section>

```

This component renders the featured articles block from the `home` story, together with the list of articles defined in the References field.

---

# Chapter 5: Internationalization

Learn how to create a minimal implementation of field-level translation in an Astro project.

## Set up the Storyblok space

Add a language and translate the relevant fields.

1. Open **Settings** > **Internationalization** > **Languages**.
2. Select Spanish (`es`).
3. Navigate to the **Blocks** section and open the `article` block.
4. Click the `title` field, select the **Translatable** option, and save. Do the same with the `content` field.
5. In the Visual Editor, open an article, and switch the language to Spanish.
6. Click the **Translate** toggle, and provide Spanish content. Do the same for all articles. You can also use [AI Translations](https://www.storyblok.com/docs/editor-guides/ai-translations).

> [!NOTE] Internationalization
> Learn more about [working with multilingual content in Storyblok](https://www.storyblok.com/docs/concepts/internationalization).

## Set up the Astro project

Use the **language** API parameter to render the page based on the selected locale. Adapt `src/pages/[...slug].astro` like so:

```js
---
import { useStoryblokApi } from '@storyblok/astro';
import StoryblokComponent from '@storyblok/astro/StoryblokComponent.astro';
import Layout from '../layouts/Layout.astro';

const slug = Astro.params.slug?.split('/') ?? [];

const availableLanguages = ['es'];
const language = availableLanguages.includes(slug[0]) ? slug[0] : undefined;

if (language) {
	slug.shift();
}

const storyblokApi = useStoryblokApi();
const { data } = await storyblokApi.get(
	`cdn/stories/${slug && slug.length > 0 ? slug.join('/') : 'home'}`,
	{
		version: 'draft',
		resolve_relations: 'featured-articles.articles',
		language,
	},
);

const story = data.story;
---

<Layout>
	<StoryblokComponent blok={story.content} />
</Layout>

```

> [!NOTE] Fetch all languages
> This guide lists language codes in the `availableLanguages` array. Learn how to [retrieve an array of all the language codes in the space.](https://www.storyblok.com/docs/api/content-delivery/v2/spaces/the-space-object).

The language code is the first part of the `full_slug` of each language-specific story. For example, the Spanish version of `articles/example-article` would be `es/articles/example-article`.

The `language` parameter handles each story's translated version. In the example above, Astro checks if the first element of the `slug` array appears in the `availableLanguages` array. If it does, it's set as the `language` parameter in the API request. Otherwise, it's removed, and the `slug` in the API request remains unchanged.

> [!NOTE] The `home` story
> This approach works for all stories except the `home` story. Internationalization and how you handle the `home` story or other aspects depend on your specific project requirements.
For example, create a static route `pages/es/index.astro` to override the dynamic route `pages/[…slug].astro`, and set it to fetch the `home` story in Spanish.
